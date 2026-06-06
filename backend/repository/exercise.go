package repository

import (
	"errors"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type exerciseRepo struct {
	db *gorm.DB
}

func NewExerciseRepository(db *gorm.DB) ExerciseRepository {
	return &exerciseRepo{db: db}
}

func (r *exerciseRepo) FindAll(module, category, difficulty string) ([]models.Exercise, error) {
	var exercises []models.Exercise
	query := r.db.Order(`"order" asc`)
	if module != "" {
		query = query.Where("module = ?", module)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}
	return exercises, query.Find(&exercises).Error
}

func (r *exerciseRepo) FindByID(id uint) (*models.Exercise, error) {
	var exercise models.Exercise
	err := r.db.First(&exercise, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &exercise, err
}

func (r *exerciseRepo) FindByModule(module string) ([]models.Exercise, error) {
	var exercises []models.Exercise
	return exercises, r.db.Where("module = ?", module).Find(&exercises).Error
}

func (r *exerciseRepo) FindByTopicID(topicID uint) ([]models.Exercise, error) {
	var exercises []models.Exercise
	return exercises, r.db.Where("trainer_topic_id = ?", topicID).Order(`"order" asc`).Find(&exercises).Error
}

func (r *exerciseRepo) Create(exercise *models.Exercise) error {
	return r.db.Create(exercise).Error
}

func (r *exerciseRepo) Update(exercise *models.Exercise) error {
	return r.db.Save(exercise).Error
}

func (r *exerciseRepo) Delete(id uint) error {
	return r.db.Delete(&models.Exercise{}, id).Error
}
