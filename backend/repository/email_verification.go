package repository

import (
	"errors"
	"time"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type emailVerificationRepo struct {
	db *gorm.DB
}

func NewEmailVerificationRepository(db *gorm.DB) EmailVerificationRepository {
	return &emailVerificationRepo{db: db}
}

func (r *emailVerificationRepo) Create(token *models.EmailVerificationToken) error {
	return r.db.Create(token).Error
}

func (r *emailVerificationRepo) FindValidByHash(tokenHash string, now time.Time) (*models.EmailVerificationToken, error) {
	var token models.EmailVerificationToken
	err := r.db.
		Where("token_hash = ?", tokenHash).
		Where("used_at IS NULL").
		Where("expires_at > ?", now).
		First(&token).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &token, err
}

func (r *emailVerificationRepo) MarkUsed(id uint) error {
	return r.db.Model(&models.EmailVerificationToken{}).Where("id = ?", id).Update("used_at", gorm.Expr("NOW()")).Error
}

func (r *emailVerificationRepo) DeleteByUser(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.EmailVerificationToken{}).Error
}
