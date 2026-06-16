package http

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"strings"

	"github.com/gin-gonic/gin"
	"golanger/backend/usecase"
)

type registerInput struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=20"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type forgotPasswordInput struct {
	Email string `json:"email" binding:"required,email"`
}

type resetPasswordInput struct {
	Token       string `json:"token" binding:"required,min=12"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

type verifyEmailInput struct {
	Token string `json:"token" binding:"required,min=12"`
}

type resendVerificationInput struct {
	Email string `json:"email" binding:"required,email"`
}

type updateMeInput struct {
	FullName string `json:"fullName" binding:"required,min=3,max=120"`
}

func (h *Handler) Register() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input registerInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		verificationToken, user, err := h.auth.Register(input.Email, input.Username, input.Password)
		if errors.Is(err, usecase.ErrConflict) {
			c.JSON(http.StatusConflict, gin.H{"error": "Email or username already taken"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
			return
		}

		if err := h.sendEmailVerificationEmail(user.Email, verificationToken); err != nil {
			log.Printf("email verification send error for %s: %v", user.Email, err)
		}

		c.JSON(http.StatusCreated, gin.H{
			"ok":      true,
			"user":    user,
			"message": "Аккаунт создан. Проверь email и подтверди регистрацию.",
		})
	}
}

func (h *Handler) Login() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input loginInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		token, user, err := h.auth.Login(input.Email, input.Password)
		if errors.Is(err, usecase.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		if errors.Is(err, usecase.ErrEmailNotVerified) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Email is not verified"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to login"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
	}
}

func (h *Handler) VerifyEmail() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input verifyEmailInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := h.auth.VerifyEmail(strings.TrimSpace(input.Token))
		if errors.Is(err, usecase.ErrInvalidInput) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "Email подтверждён. Теперь можно войти."})
	}
}

func (h *Handler) ResendVerification() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input resendVerificationInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		email := strings.TrimSpace(input.Email)
		token, err := h.auth.RequestEmailVerification(email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resend verification"})
			return
		}

		if token != "" {
			if err := h.sendEmailVerificationEmail(email, token); err != nil {
				log.Printf("email verification resend error for %s: %v", email, err)
			}
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "Если email есть в системе, письмо подтверждения отправлено"})
	}
}

func (h *Handler) ForgotPassword() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input forgotPasswordInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		token, err := h.auth.RequestPasswordReset(strings.TrimSpace(input.Email))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start password reset"})
			return
		}

		if token != "" {
			if err := h.sendPasswordResetEmail(strings.TrimSpace(input.Email), token); err != nil {
				log.Printf("password reset email send error for %s: %v", input.Email, err)
			}
		}

		// Always return success-like response to prevent email enumeration
		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "Если email существует, инструкция уже отправлена"})
	}
}

func (h *Handler) ResetPassword() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input resetPasswordInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := h.auth.ResetPassword(strings.TrimSpace(input.Token), input.NewPassword)
		if errors.Is(err, usecase.ErrInvalidInput) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "Пароль обновлён"})
	}
}

func (h *Handler) Me() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, err := h.auth.Me(c.GetUint("userId"))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
			return
		}
		c.JSON(http.StatusOK, user)
	}
}

func (h *Handler) UpdateMe() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, err := h.auth.Me(c.GetUint("userId"))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
			return
		}

		var input updateMeInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user.FullName = strings.TrimSpace(input.FullName)
		if err := h.auth.UpdateUser(user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func (h *Handler) sendPasswordResetEmail(email, token string) error {
	resetLink := fmt.Sprintf("%s/auth/reset-password?token=%s", strings.TrimRight(h.cfg.FrontendURL, "/"), token)
	body := fmt.Sprintf(
		"Здравствуйте!\\n\\nЧтобы сбросить пароль, перейдите по ссылке:\\n%s\\n\\nСсылка действует 60 минут.\\nЕсли вы не запрашивали сброс — просто проигнорируйте это письмо.\\n",
		resetLink,
	)
	return h.sendPlainEmail(email, "Сброс пароля Golanger", body, "password-reset", resetLink)
}

func (h *Handler) sendEmailVerificationEmail(email, token string) error {
	verifyLink := fmt.Sprintf("%s/auth/verify-email?token=%s", strings.TrimRight(h.cfg.FrontendURL, "/"), token)
	body := fmt.Sprintf(
		"Здравствуйте!\\n\\nПодтвердите email для аккаунта Godemy по ссылке:\\n%s\\n\\nСсылка действует 24 часа.\\nЕсли вы не создавали аккаунт — просто проигнорируйте это письмо.\\n",
		verifyLink,
	)
	return h.sendPlainEmail(email, "Подтверждение email Godemy", body, "email-verification", verifyLink)
}

func (h *Handler) sendPlainEmail(email, subject, body, logPrefix, fallbackLink string) error {
	// Fallback for local/dev where SMTP is not configured
	if h.cfg.SMTPHost == "" || h.cfg.SMTPPort == "" || h.cfg.SMTPUser == "" || h.cfg.SMTPPassword == "" {
		if strings.EqualFold(h.cfg.AppEnv, "production") {
			return fmt.Errorf("SMTP is not configured")
		}
		log.Printf("[%s] SMTP not configured. Link for %s: %s", logPrefix, email, fallbackLink)
		return nil
	}

	from := h.cfg.SMTPFrom
	if from == "" {
		from = h.cfg.SMTPUser
	}

	msg := []byte("To: " + email + "\\r\\n" +
		"From: " + from + "\\r\\n" +
		"Subject: " + subject + "\\r\\n" +
		"MIME-Version: 1.0\\r\\n" +
		"Content-Type: text/plain; charset=UTF-8\\r\\n\\r\\n" +
		body)

	auth := smtp.PlainAuth("", h.cfg.SMTPUser, h.cfg.SMTPPassword, h.cfg.SMTPHost)
	addr := fmt.Sprintf("%s:%s", h.cfg.SMTPHost, h.cfg.SMTPPort)
	return smtp.SendMail(addr, auth, from, []string{email}, msg)
}
