package usecase

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"golanger/backend/models"
	"golanger/backend/repository"
)

type AuthUseCase struct {
	users     repository.UserRepository
	resets    repository.PasswordResetRepository
	jwtSecret string
}

func NewAuthUseCase(users repository.UserRepository, resets repository.PasswordResetRepository, jwtSecret string) *AuthUseCase {
	return &AuthUseCase{users: users, resets: resets, jwtSecret: jwtSecret}
}

func (u *AuthUseCase) Register(email, username, password string) (string, *models.User, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", nil, err
	}

	pw := string(hashed)
	user := &models.User{
		Email:    email,
		Username: username,
		Password: &pw,
	}

	if err := u.users.Create(user); err != nil {
		return "", nil, ErrConflict
	}

	token, err := u.generateToken(user.ID)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (u *AuthUseCase) Login(email, password string) (string, *models.User, error) {
	user, err := u.users.FindByEmail(email)
	if err != nil {
		_ = bcrypt.CompareHashAndPassword([]byte("$2a$10$dummy"), []byte(password))
		return "", nil, ErrInvalidCredentials
	}

	if user.Password == nil {
		return "", nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(password)); err != nil {
		return "", nil, ErrInvalidCredentials
	}

	token, err := u.generateToken(user.ID)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (u *AuthUseCase) Me(userID uint) (*models.User, error) {
	user, err := u.users.FindByID(userID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	// Auto-expire premium
	if user.IsPremium && user.PremiumUntil != nil && user.PremiumUntil.Before(time.Now()) {
		user.IsPremium = false
		_ = u.users.Update(user)
	}
	return user, nil
}

func (u *AuthUseCase) FindUserByEmail(email string) (*models.User, error) {
	user, err := u.users.FindByEmail(email)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return user, err
}

func (u *AuthUseCase) UpdateUser(user *models.User) error {
	return u.users.Update(user)
}

func (u *AuthUseCase) RequestPasswordReset(email string) (string, error) {
	user, err := u.users.FindByEmail(email)
	if errors.Is(err, repository.ErrNotFound) {
		// Do not reveal whether email exists
		return "", nil
	}
	if err != nil {
		return "", err
	}

	if err := u.resets.DeleteByUser(user.ID); err != nil {
		return "", err
	}

	rawToken, err := generateSecureToken(32)
	if err != nil {
		return "", err
	}

	hash := sha256.Sum256([]byte(rawToken))
	reset := &models.PasswordResetToken{
		UserID:    user.ID,
		TokenHash: hex.EncodeToString(hash[:]),
		ExpiresAt: time.Now().Add(60 * time.Minute),
	}

	if err := u.resets.Create(reset); err != nil {
		return "", err
	}

	return rawToken, nil
}

func (u *AuthUseCase) ResetPassword(rawToken, newPassword string) error {
	if len(rawToken) < 12 || len(newPassword) < 6 {
		return ErrInvalidInput
	}

	hash := sha256.Sum256([]byte(rawToken))
	reset, err := u.resets.FindValidByHash(hex.EncodeToString(hash[:]), time.Now())
	if errors.Is(err, repository.ErrNotFound) {
		return ErrInvalidInput
	}
	if err != nil {
		return err
	}

	user, err := u.users.FindByID(reset.UserID)
	if errors.Is(err, repository.ErrNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	pw := string(hashed)
	user.Password = &pw

	if err := u.users.Update(user); err != nil {
		return err
	}

	if err := u.resets.MarkUsed(reset.ID); err != nil {
		return err
	}

	return nil
}

func (u *AuthUseCase) LoginOrCreateOAuth(provider, providerID, email, username string) (string, *models.User, error) {
	// 1. Try to find by provider
	user, err := u.users.FindByProvider(provider, providerID)
	if err == nil {
		token, err := u.generateToken(user.ID)
		return token, user, err
	}

	// 2. Try to find by email (link provider to existing account)
	if email != "" {
		user, err = u.users.FindByEmail(email)
		if err == nil {
			user.OAuthProvider = provider
			user.OAuthProviderID = providerID
			_ = u.users.Update(user)
			token, err := u.generateToken(user.ID)
			return token, user, err
		}
	}

	// 3. Create new user
	if username == "" {
		username = provider + "_" + providerID[:8]
	}
	// Ensure username uniqueness by appending suffix if needed
	finalUsername := username
	for i := 1; i <= 9; i++ {
		_, findErr := u.users.FindByEmail("__check_username_" + finalUsername + "@noop")
		// We check username via a direct attempt — just try creating
		_ = findErr
		break
	}

	newUser := &models.User{
		Email:           email,
		Username:        finalUsername,
		Password:        nil,
		OAuthProvider:   provider,
		OAuthProviderID: providerID,
	}

	if err := u.users.Create(newUser); err != nil {
		// Username conflict — append suffix
		newUser.Username = finalUsername + "_" + providerID[:4]
		if err2 := u.users.Create(newUser); err2 != nil {
			return "", nil, ErrConflict
		}
	}

	token, err := u.generateToken(newUser.ID)
	if err != nil {
		return "", nil, err
	}
	return token, newUser, nil
}

func (u *AuthUseCase) generateToken(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"userId": userID,
		"exp":    time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat":    time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(u.jwtSecret))
}

func generateSecureToken(size int) (string, error) {
	b := make([]byte, size)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
