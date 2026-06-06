package repository

import (
	"errors"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type progressRepo struct {
	db *gorm.DB
}

func NewProgressRepository(db *gorm.DB) ProgressRepository {
	return &progressRepo{db: db}
}

func (r *progressRepo) FindByUser(userID uint) ([]models.Progress, error) {
	var progresses []models.Progress
	return progresses, r.db.Where("user_id = ?", userID).Find(&progresses).Error
}

func (r *progressRepo) FindOne(userID uint, entityType string, entityID uint) (*models.Progress, error) {
	var p models.Progress
	err := r.db.Where("user_id = ? AND entity_type = ? AND entity_id = ?", userID, entityType, entityID).First(&p).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *progressRepo) Upsert(userID uint, entityType string, entityID uint, status string, payload string) (*models.Progress, error) {
	p, err := r.FindOne(userID, entityType, entityID)
	if errors.Is(err, ErrNotFound) {
		newP := &models.Progress{
			UserID:     userID,
			EntityType: entityType,
			EntityID:   entityID,
			Status:     status,
			Payload:    payload,
		}
		return newP, r.db.Create(newP).Error
	}
	if err != nil {
		return nil, err
	}
	p.Status = status
	p.Payload = payload
	return p, r.db.Model(p).Updates(map[string]any{"status": status, "payload": payload}).Error
}
