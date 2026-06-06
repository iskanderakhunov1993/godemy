package repository

import (
	"errors"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type trainerTopicRepo struct {
	db *gorm.DB
}

func NewTrainerTopicRepository(db *gorm.DB) TrainerTopicRepository {
	return &trainerTopicRepo{db: db}
}

func (r *trainerTopicRepo) FindAll(module string) ([]models.TrainerTopic, error) {
	var topics []models.TrainerTopic
	q := r.db.Order(`"order" asc, id asc`)
	if module != "" {
		q = q.Where("module = ?", module)
	}
	return topics, q.Find(&topics).Error
}

func (r *trainerTopicRepo) FindBySlug(slug string) (*models.TrainerTopic, error) {
	var t models.TrainerTopic
	err := r.db.Preload("Exercises", func(db *gorm.DB) *gorm.DB {
		return db.Order(`"order" asc`)
	}).Where("slug = ?", slug).First(&t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &t, err
}

func (r *trainerTopicRepo) FindByID(id uint) (*models.TrainerTopic, error) {
	var t models.TrainerTopic
	err := r.db.First(&t, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &t, err
}

func (r *trainerTopicRepo) Create(t *models.TrainerTopic) error {
	return r.db.Create(t).Error
}

func (r *trainerTopicRepo) Update(t *models.TrainerTopic) error {
	return r.db.Save(t).Error
}

func (r *trainerTopicRepo) Delete(id uint) error {
	return r.db.Delete(&models.TrainerTopic{}, id).Error
}
