package repository

import (
	"errors"
	"time"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type passwordResetRepo struct {
	db *gorm.DB
}

func NewPasswordResetRepository(db *gorm.DB) PasswordResetRepository {
	return &passwordResetRepo{db: db}
}

func (r *passwordResetRepo) Create(token *models.PasswordResetToken) error {
	return r.db.Create(token).Error
}

func (r *passwordResetRepo) FindValidByHash(tokenHash string, now time.Time) (*models.PasswordResetToken, error) {
	var token models.PasswordResetToken
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

func (r *passwordResetRepo) MarkUsed(id uint) error {
	return r.db.Model(&models.PasswordResetToken{}).Where("id = ?", id).Update("used_at", gorm.Expr("NOW()")).Error
}

func (r *passwordResetRepo) DeleteByUser(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.PasswordResetToken{}).Error
}
