package repository

import (
	"errors"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type certificateRepo struct {
	db *gorm.DB
}

func NewCertificateRepository(db *gorm.DB) CertificateRepository {
	return &certificateRepo{db: db}
}

func (r *certificateRepo) FindByUserAndType(userID uint, certType string) (*models.Certificate, error) {
	var certificate models.Certificate
	err := r.db.Where("user_id = ? AND type = ?", userID, certType).First(&certificate).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &certificate, err
}

func (r *certificateRepo) FindByCertificateID(certificateID string) (*models.Certificate, error) {
	var certificate models.Certificate
	err := r.db.Preload("User").Where("certificate_id = ?", certificateID).First(&certificate).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &certificate, err
}

func (r *certificateRepo) Create(certificate *models.Certificate) error {
	return r.db.Create(certificate).Error
}
