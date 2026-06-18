package usecase

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"golanger/backend/models"
	"golanger/backend/repository"
)

type AuthUseCase struct {
	users         repository.UserRepository
	resets        repository.PasswordResetRepository
	verifications repository.EmailVerificationRepository
	jwtSecret     string
}

func NewAuthUseCase(users repository.UserRepository, resets repository.PasswordResetRepository, verifications repository.EmailVerificationRepository, jwtSecret string) *AuthUseCase {
	return &AuthUseCase{users: users, resets: resets, verifications: verifications, jwtSecret: jwtSecret}
}

func (u *AuthUseCase) Register(email, username, password string) (string, *models.User, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", nil, err
	}

	pw := string(hashed)
	cleanEmail := strings.TrimSpace(strings.ToLower(email))
	cleanUsername := strings.TrimSpace(username)
	if cleanUsername == "" {
		cleanUsername = usernameFromEmail(cleanEmail)
	}

	user := &models.User{
		Email:         cleanEmail,
		Username:      cleanUsername,
		Password:      &pw,
		EmailVerified: true,
	}

	if err := u.users.Create(user); err != nil {
		return "", nil, ErrConflict
	}

	verificationToken, err := u.createEmailVerificationToken(user.ID)
	if err != nil {
		return "", nil, err
	}

	return verificationToken, user, nil
}

func (u *AuthUseCase) Login(email, password string) (string, *models.User, error) {
	user, err := u.users.FindByEmail(strings.TrimSpace(strings.ToLower(email)))
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

func usernameFromEmail(email string) string {
	local := "user"
	if at := strings.Index(email, "@"); at > 0 {
		local = email[:at]
	}

	var b strings.Builder
	for _, r := range local {
		switch {
		case r >= 'a' && r <= 'z':
			b.WriteRune(r)
		case r >= 'A' && r <= 'Z':
			b.WriteRune(r + ('a' - 'A'))
		case r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == '_' || r == '-' || r == '.':
			b.WriteRune('_')
		}
	}

	name := strings.Trim(b.String(), "_")
	if len(name) < 3 {
		name = "user_" + name
	}
	if len(name) > 13 {
		name = name[:13]
	}
	return name + "_" + randomSuffix(6)
}

func randomSuffix(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "000000"
	}

	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
	for i, b := range bytes {
		bytes[i] = alphabet[int(b)%len(alphabet)]
	}
	return string(bytes)
}

func (u *AuthUseCase) VerifyEmail(rawToken string) error {
	if len(rawToken) < 12 {
		return ErrInvalidInput
	}

	hash := sha256.Sum256([]byte(rawToken))
	token, err := u.verifications.FindValidByHash(hex.EncodeToString(hash[:]), time.Now())
	if errors.Is(err, repository.ErrNotFound) {
		return ErrInvalidInput
	}
	if err != nil {
		return err
	}

	user, err := u.users.FindByID(token.UserID)
	if errors.Is(err, repository.ErrNotFound) {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	user.EmailVerified = true
	if err := u.users.Update(user); err != nil {
		return err
	}

	if err := u.verifications.MarkUsed(token.ID); err != nil {
		return err
	}

	return nil
}

func (u *AuthUseCase) RequestEmailVerification(email string) (string, error) {
	user, err := u.users.FindByEmail(strings.TrimSpace(email))
	if errors.Is(err, repository.ErrNotFound) {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	if user.EmailVerified {
		return "", nil
	}

	return u.createEmailVerificationToken(user.ID)
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

func (u *AuthUseCase) FindUserByID(id uint) (*models.User, error) {
	user, err := u.users.FindByID(id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return user, err
}

func (u *AuthUseCase) ListUsers() ([]models.User, error) {
	users, err := u.users.FindAll()
	if err != nil {
		return nil, err
	}
	now := time.Now()
	for i := range users {
		if users[i].IsPremium && users[i].PremiumUntil != nil && users[i].PremiumUntil.Before(now) {
			users[i].IsPremium = false
			_ = u.users.Update(&users[i])
		}
	}
	return users, nil
}

func (u *AuthUseCase) UpdateUser(user *models.User) error {
	return u.users.Update(user)
}

func (u *AuthUseCase) EnsureAdminAccount(adminLogin, adminPassword string) error {
	adminLogin = strings.TrimSpace(adminLogin)
	adminPassword = strings.TrimSpace(adminPassword)
	if adminLogin == "" || adminPassword == "" {
		return nil
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	passwordHash := string(hashed)

	user, err := u.users.FindByEmail(adminLogin)
	switch {
	case err == nil:
		user.IsAdmin = true
		user.Password = &passwordHash
		if strings.TrimSpace(user.Username) == "" {
			user.Username = sanitizeUsernameCandidate(strings.SplitN(adminLogin, "@", 2)[0])
		}
		if user.Username == "" {
			user.Username = "admin"
		}
		return u.users.Update(user)
	case !errors.Is(err, repository.ErrNotFound):
		return err
	}

	username := sanitizeUsernameCandidate(strings.SplitN(adminLogin, "@", 2)[0])
	if username == "" {
		username = "admin"
	}

	newUser := &models.User{
		Email:         adminLogin,
		Username:      username,
		Password:      &passwordHash,
		IsAdmin:       true,
		EmailVerified: true,
	}

	if err := u.users.Create(newUser); err != nil {
		fallback := sanitizeUsernameCandidate(username + "_admin")
		if fallback == "" || fallback == username {
			fallback = "admin_admin"
		}
		newUser.Username = fallback
		if err2 := u.users.Create(newUser); err2 != nil {
			return err2
		}
	}

	return nil
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
	user.EmailVerified = true

	if err := u.users.Update(user); err != nil {
		return err
	}

	if err := u.resets.MarkUsed(reset.ID); err != nil {
		return err
	}

	return nil
}

func (u *AuthUseCase) LoginOrCreateOAuth(provider, providerID, email, username string) (string, *models.User, error) {
	provider = strings.TrimSpace(provider)
	providerID = strings.TrimSpace(providerID)
	email = strings.TrimSpace(email)
	username = strings.TrimSpace(username)

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
			user.EmailVerified = true
			_ = u.users.Update(user)
			token, err := u.generateToken(user.ID)
			return token, user, err
		}
	}

	// 3. Create new user
	if email == "" {
		email = providerID + "@" + provider + ".oauth.local"
	}

	finalUsername := normalizeOAuthUsername(username, provider, providerID, "")

	newUser := &models.User{
		Email:           email,
		Username:        finalUsername,
		Password:        nil,
		OAuthProvider:   provider,
		OAuthProviderID: providerID,
		EmailVerified:   true,
	}

	if err := u.users.Create(newUser); err != nil {
		// Username conflict — append suffix and retry once.
		newUser.Username = normalizeOAuthUsername(username, provider, providerID, providerIDSuffix(providerID))
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

func (u *AuthUseCase) createEmailVerificationToken(userID uint) (string, error) {
	if err := u.verifications.DeleteByUser(userID); err != nil {
		return "", err
	}

	rawToken, err := generateSecureToken(32)
	if err != nil {
		return "", err
	}

	hash := sha256.Sum256([]byte(rawToken))
	token := &models.EmailVerificationToken{
		UserID:    userID,
		TokenHash: hex.EncodeToString(hash[:]),
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := u.verifications.Create(token); err != nil {
		return "", err
	}

	return rawToken, nil
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

func normalizeOAuthUsername(candidate, provider, providerID, suffix string) string {
	base := sanitizeUsernameCandidate(candidate)
	if base == "" {
		base = provider + "_" + providerIDPrefix(providerID)
	}
	if suffix != "" {
		cleanSuffix := sanitizeUsernameCandidate(suffix)
		if cleanSuffix != "" {
			maxBaseLen := 20 - len(cleanSuffix) - 1
			if maxBaseLen < 1 {
				maxBaseLen = 1
			}
			if len(base) > maxBaseLen {
				base = strings.Trim(base[:maxBaseLen], "_")
			}
			if base == "" {
				base = provider + "_" + providerIDPrefix(providerID)
			}
			base = base + "_" + cleanSuffix
		}
	}
	if len(base) > 20 {
		base = strings.Trim(base[:20], "_")
	}
	if base == "" {
		base = provider + "_" + providerIDPrefix(providerID)
	}
	return base
}

func sanitizeUsernameCandidate(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	var builder strings.Builder
	lastUnderscore := false
	for _, r := range value {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			builder.WriteRune(r)
			lastUnderscore = false
		case r == '_' || r == '-' || r == '.' || r == ' ':
			if !lastUnderscore {
				builder.WriteRune('_')
				lastUnderscore = true
			}
		}
	}
	return strings.Trim(builder.String(), "_")
}

func providerIDPrefix(providerID string) string {
	providerID = strings.TrimSpace(providerID)
	if len(providerID) <= 8 {
		return providerID
	}
	return providerID[:8]
}

func providerIDSuffix(providerID string) string {
	providerID = strings.TrimSpace(providerID)
	if len(providerID) <= 4 {
		return providerID
	}
	return providerID[:4]
}
