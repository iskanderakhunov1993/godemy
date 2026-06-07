package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv             string
	Port               string
	JWTSecret          string
	DatabaseURL        string
	AllowedOrigins     []string
	YandexClientID     string
	YandexClientSecret string
	FrontendURL        string
	AdminSecret        string
	RedisAddr          string
	RedisPassword      string
	RedisDB            int
	SMTPHost           string
	SMTPPort           string
	SMTPUser           string
	SMTPPassword       string
	SMTPFrom           string
}

func Load() *Config {
	_ = godotenv.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "golanger-secret-key-change-in-prod"
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "host=localhost user=golanger password=golanger dbname=golanger port=5432 sslmode=disable"
	}
	allowedOrigins := []string{"http://localhost:3000"}
	if corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS"); corsOrigins != "" {
		parts := strings.Split(corsOrigins, ",")
		allowedOrigins = make([]string, 0, len(parts))
		for _, origin := range parts {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				allowedOrigins = append(allowedOrigins, origin)
			}
		}
		if len(allowedOrigins) == 0 {
			allowedOrigins = []string{"http://localhost:3000"}
		}
	}
	frontendURL := os.Getenv("FRONTEND_URL")
	redisAddr := strings.TrimSpace(os.Getenv("REDIS_ADDR"))
	redisPassword := os.Getenv("REDIS_PASSWORD")

	dbStr := os.Getenv("REDIS_DB")
	if dbStr == "" {
		dbStr = "0"
	}
	dbInt, _ := strconv.Atoi(dbStr)
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	adminSecret := os.Getenv("ADMIN_SECRET")
	if adminSecret == "" {
		adminSecret = "change-me-admin-secret-2026"
	}
	return &Config{
		AppEnv:             os.Getenv("APP_ENV"),
		Port:               port,
		JWTSecret:          secret,
		DatabaseURL:        dbURL,
		AllowedOrigins:     allowedOrigins,
		YandexClientID:     os.Getenv("YANDEX_CLIENT_ID"),
		YandexClientSecret: os.Getenv("YANDEX_CLIENT_SECRET"),
		FrontendURL:        frontendURL,
		AdminSecret:        adminSecret,
		RedisAddr:          redisAddr,
		RedisPassword:      redisPassword,
		RedisDB:            dbInt,
		SMTPHost:           os.Getenv("SMTP_HOST"),
		SMTPPort:           os.Getenv("SMTP_PORT"),
		SMTPUser:           os.Getenv("SMTP_USER"),
		SMTPPassword:       os.Getenv("SMTP_PASSWORD"),
		SMTPFrom:           os.Getenv("SMTP_FROM"),
	}
}

func (c *Config) Validate() error {
	if !strings.EqualFold(c.AppEnv, "production") {
		return nil
	}
	if len(c.JWTSecret) < 32 || c.JWTSecret == "golanger-secret-key-change-in-prod" {
		return fmt.Errorf("JWT_SECRET must contain at least 32 characters in production")
	}
	if len(c.AdminSecret) < 32 || c.AdminSecret == "change-me-admin-secret-2026" {
		return fmt.Errorf("ADMIN_SECRET must contain at least 32 characters in production")
	}
	if strings.Contains(c.DatabaseURL, "password=golanger") {
		return fmt.Errorf("DATABASE_URL must use a strong production password")
	}
	if len(c.AllowedOrigins) == 0 {
		return fmt.Errorf("CORS_ALLOWED_ORIGINS must be configured in production")
	}
	return nil
}
