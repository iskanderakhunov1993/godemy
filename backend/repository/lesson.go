package repository

import (
	"errors"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type lessonRepo struct {
	db *gorm.DB
}

func NewLessonRepository(db *gorm.DB) LessonRepository {
	return &lessonRepo{db: db}
}

func (r *lessonRepo) FindAll(module string) ([]models.Lesson, error) {
	var lessons []models.Lesson
	query := r.db.Order(`"order" asc`)
	if module != "" {
		query = query.Where("module = ?", module)
	}
	return lessons, query.Find(&lessons).Error
}

func (r *lessonRepo) FindBySlug(slug, module string) (*models.Lesson, error) {
	var lesson models.Lesson
	query := r.db.Where("slug = ?", slug)
	if module != "" {
		query = query.Where("module = ?", module)
	}
	err := query.First(&lesson).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &lesson, err
}

func (r *lessonRepo) FindByID(id uint) (*models.Lesson, error) {
	var lesson models.Lesson
	err := r.db.First(&lesson, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &lesson, err
}

func (r *lessonRepo) Create(lesson *models.Lesson) error {
	return r.db.Create(lesson).Error
}

func (r *lessonRepo) Update(lesson *models.Lesson) error {
	return r.db.Save(lesson).Error
}

func (r *lessonRepo) Delete(id uint) error {
	return r.db.Delete(&models.Lesson{}, id).Error
}
