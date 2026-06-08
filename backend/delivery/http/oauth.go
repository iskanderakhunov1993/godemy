package http

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

// YandexOAuth redirects the browser to Yandex OAuth authorization page.
func (h *Handler) YandexOAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		redirectURI := h.cfg.FrontendURL + "/profile"
		params := url.Values{}
		params.Set("response_type", "code")
		params.Set("client_id", h.cfg.YandexClientID)
		params.Set("redirect_uri", redirectURI)
		params.Set("force_confirm", "no")

		target := "https://oauth.yandex.ru/authorize?" + params.Encode()
		c.Redirect(http.StatusFound, target)
	}
}

type yandexExchangeInput struct {
	Code string `json:"code" binding:"required"`
}

type yandexTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Error       string `json:"error"`
}

type yandexUserInfo struct {
	ID           string `json:"id"`
	Login        string `json:"login"`
	DefaultEmail string `json:"default_email"`
	RealName     string `json:"real_name"`
	DisplayName  string `json:"display_name"`
}

// GoogleOAuth redirects the browser to Google OAuth authorization page.
func (h *Handler) GoogleOAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		redirectURI := h.cfg.FrontendURL + "/auth/google/callback"
		params := url.Values{}
		params.Set("response_type", "code")
		params.Set("client_id", h.cfg.GoogleClientID)
		params.Set("redirect_uri", redirectURI)
		params.Set("scope", "openid email profile")
		params.Set("access_type", "online")
		params.Set("prompt", "select_account")

		target := "https://accounts.google.com/o/oauth2/v2/auth?" + params.Encode()
		c.Redirect(http.StatusFound, target)
	}
}

type googleExchangeInput struct {
	Code string `json:"code" binding:"required"`
}

type googleTokenResponse struct {
	AccessToken      string `json:"access_token"`
	TokenType        string `json:"token_type"`
	ExpiresIn        int    `json:"expires_in"`
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

type googleUserInfo struct {
	ID            string `json:"id"`
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

// YandexCallback exchanges the authorization code for a JWT and returns user info.
func (h *Handler) YandexCallback() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input yandexExchangeInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
			return
		}

		redirectURI := h.cfg.FrontendURL + "/profile"

		// Exchange authorization code for access token
		formData := url.Values{}
		formData.Set("grant_type", "authorization_code")
		formData.Set("code", input.Code)
		formData.Set("client_id", h.cfg.YandexClientID)
		formData.Set("client_secret", h.cfg.YandexClientSecret)
		formData.Set("redirect_uri", redirectURI)

		resp, err := http.Post(
			"https://oauth.yandex.ru/token",
			"application/x-www-form-urlencoded",
			strings.NewReader(formData.Encode()),
		)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "failed to contact Yandex"})
			return
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		var tokenResp yandexTokenResponse
		if err := json.Unmarshal(body, &tokenResp); err != nil || tokenResp.AccessToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("token exchange failed: %s", tokenResp.Error)})
			return
		}

		// Fetch user info from Yandex
		req, _ := http.NewRequest("GET", "https://login.yandex.ru/info?format=json", nil)
		req.Header.Set("Authorization", "OAuth "+tokenResp.AccessToken)
		client := &http.Client{}
		infoResp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch user info"})
			return
		}
		defer infoResp.Body.Close()

		infoBody, _ := io.ReadAll(infoResp.Body)
		var userInfo yandexUserInfo
		if err := json.Unmarshal(infoBody, &userInfo); err != nil || userInfo.ID == "" {
			c.JSON(http.StatusBadGateway, gin.H{"error": "invalid user info from Yandex"})
			return
		}

		username := userInfo.Login
		if username == "" {
			username = userInfo.DisplayName
		}

		token, user, err := h.auth.LoginOrCreateOAuth("yandex", userInfo.ID, userInfo.DefaultEmail, username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to authenticate"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
	}
}

// GoogleCallback exchanges the authorization code for a JWT and returns user info.
func (h *Handler) GoogleCallback() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input googleExchangeInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "code is required"})
			return
		}

		redirectURI := h.cfg.FrontendURL + "/auth/google/callback"

		formData := url.Values{}
		formData.Set("grant_type", "authorization_code")
		formData.Set("code", input.Code)
		formData.Set("client_id", h.cfg.GoogleClientID)
		formData.Set("client_secret", h.cfg.GoogleClientSecret)
		formData.Set("redirect_uri", redirectURI)

		resp, err := http.Post(
			"https://oauth2.googleapis.com/token",
			"application/x-www-form-urlencoded",
			strings.NewReader(formData.Encode()),
		)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "failed to contact Google"})
			return
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		var tokenResp googleTokenResponse
		if err := json.Unmarshal(body, &tokenResp); err != nil || tokenResp.AccessToken == "" {
			message := tokenResp.ErrorDescription
			if message == "" {
				message = tokenResp.Error
			}
			c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("token exchange failed: %s", message)})
			return
		}

		req, _ := http.NewRequest("GET", "https://openidconnect.googleapis.com/v1/userinfo", nil)
		req.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)
		client := &http.Client{}
		infoResp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch user info"})
			return
		}
		defer infoResp.Body.Close()

		infoBody, _ := io.ReadAll(infoResp.Body)
		var userInfo googleUserInfo
		if err := json.Unmarshal(infoBody, &userInfo); err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "invalid user info from Google"})
			return
		}

		providerID := userInfo.ID
		if providerID == "" {
			providerID = userInfo.Sub
		}
		if providerID == "" {
			c.JSON(http.StatusBadGateway, gin.H{"error": "missing Google user id"})
			return
		}

		username := userInfo.GivenName
		if username == "" {
			username = userInfo.Name
		}
		if username == "" && userInfo.Email != "" {
			username = strings.Split(userInfo.Email, "@")[0]
		}

		token, user, err := h.auth.LoginOrCreateOAuth("google", providerID, userInfo.Email, username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to authenticate"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
	}
}
