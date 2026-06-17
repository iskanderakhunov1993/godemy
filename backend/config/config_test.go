package config

import "testing"

func TestValidateAllowsDevelopmentDefaults(t *testing.T) {
	cfg := &Config{AppEnv: "development"}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("development config should allow defaults: %v", err)
	}
}

func TestValidateRejectsWeakProductionSecrets(t *testing.T) {
	cfg := &Config{
		AppEnv:         "production",
		JWTSecret:      "short",
		AdminLogin:     "",
		AdminSecret:    "also-short",
		DatabaseURL:    "host=db password=strong-password",
		AllowedOrigins: []string{"https://example.com"},
	}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected weak production secrets to be rejected")
	}
}

func TestValidateAcceptsProductionConfig(t *testing.T) {
	cfg := &Config{
		AppEnv:         "production",
		JWTSecret:      "0123456789abcdef0123456789abcdef",
		AdminLogin:     "admin@godemy.ru",
		AdminSecret:    "abcdef0123456789abcdef0123456789",
		DatabaseURL:    "host=db user=app password=strong-password dbname=app",
		AllowedOrigins: []string{"https://example.com"},
		SMTPHost:       "smtp.example.com",
		SMTPPort:       "587",
		SMTPUser:       "mailer@example.com",
		SMTPPassword:   "smtp-password",
	}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected production config to be valid: %v", err)
	}
}

func TestValidateAcceptsProductionConfigWithoutSMTP(t *testing.T) {
	cfg := &Config{
		AppEnv:         "production",
		JWTSecret:      "0123456789abcdef0123456789abcdef",
		AdminLogin:     "admin@godemy.ru",
		AdminSecret:    "abcdef0123456789abcdef0123456789",
		DatabaseURL:    "host=db user=app password=strong-password dbname=app",
		AllowedOrigins: []string{"https://example.com"},
	}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected production config without SMTP to be valid: %v", err)
	}
}
