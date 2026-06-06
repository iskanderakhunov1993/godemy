package repository

import (
	"golanger/backend/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type GormLevelRepository struct {
	db *gorm.DB
}

func NewGormLevelRepository(db *gorm.DB) *GormLevelRepository {
	return &GormLevelRepository{db: db}
}

func (r *GormLevelRepository) FindAll() ([]models.Level, error) {
	var levels []models.Level
	err := r.db.Order(clause.OrderByColumn{Column: clause.Column{Name: "order"}, Desc: false}).Find(&levels).Error
	return levels, err
}

func (r *GormLevelRepository) FindByID(id uint) (*models.Level, error) {
	var level models.Level
	err := r.db.First(&level, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &level, nil
}

func (r *GormLevelRepository) Create(level *models.Level) error {
	return r.db.Create(level).Error
}

func (r *GormLevelRepository) Update(level *models.Level) error {
	return r.db.Save(level).Error
}

func (r *GormLevelRepository) Delete(id uint) error {
	return r.db.Delete(&models.Level{}, id).Error
}
