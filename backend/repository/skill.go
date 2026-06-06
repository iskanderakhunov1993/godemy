package repository

import (
	"golanger/backend/models"

	"gorm.io/gorm"
)

type SkillRepo struct {
	db *gorm.DB
}

func NewSkillRepository(db *gorm.DB) *SkillRepo {
	return &SkillRepo{db: db}
}

// GetUserSkills получает все скилы пользователя с описанием
func (r *SkillRepo) GetUserSkills(userID uint) ([]models.UserSkill, error) {
	var userSkills []models.UserSkill
	err := r.db.Where("user_id = ?", userID).
		Preload("Skill").
		Order("skill_id").
		Find(&userSkills).Error
	return userSkills, err
}

// GetOrCreateSkill получает скилл по имени или создает новый
func (r *SkillRepo) GetOrCreateSkill(name, slug, category, icon string) (*models.Skill, error) {
	skill := &models.Skill{}
	err := r.db.FirstOrCreate(skill, models.Skill{
		Slug: slug,
	}, models.Skill{
		Name:     name,
		Slug:     slug,
		Category: category,
		Icon:     icon,
	}).Error
	return skill, err
}

// AddUserSkill добавляет скилл пользователю (или обновляет если уже есть)
func (r *SkillRepo) AddUserSkill(userID, skillID uint, proficiency int) error {
	// Если proficiency > 100, обрезаем до 100
	if proficiency > 100 {
		proficiency = 100
	}
	if proficiency < 0 {
		proficiency = 0
	}

	result := r.db.Model(&models.UserSkill{}).
		Where("user_id = ? AND skill_id = ?", userID, skillID).
		Update("proficiency", proficiency)

	if result.RowsAffected == 0 {
		// Скилл еще не добавлен, создаем новую запись
		return r.db.Create(&models.UserSkill{
			UserID:      userID,
			SkillID:     skillID,
			Proficiency: proficiency,
		}).Error
	}
	return result.Error
}

// GetAllSkills получает все доступные скилы с сортировкой
func (r *SkillRepo) GetAllSkills() ([]models.Skill, error) {
	var skills []models.Skill
	err := r.db.Order("`order`, id").Find(&skills).Error
	return skills, err
}

// GetSkillsByCategory получает скилы по категории
func (r *SkillRepo) GetSkillsByCategory(category string) ([]models.Skill, error) {
	var skills []models.Skill
	err := r.db.Where("category = ?", category).Order("`order`").Find(&skills).Error
	return skills, err
}

// CalculateJuniorReadiness вычисляет процент готовности юниора (0-100)
// основано на количестве и уровне скилов
func (r *SkillRepo) CalculateJuniorReadiness(userID uint) (int, error) {
	var skills []models.UserSkill
	err := r.db.Where("user_id = ?", userID).Find(&skills).Error
	if err != nil {
		return 0, err
	}

	if len(skills) == 0 {
		return 0, nil
	}

	// Простая логика: среднее значение proficiency всех скилов
	total := 0
	for _, skill := range skills {
		total += skill.Proficiency
	}

	return total / len(skills), nil
}

// UpdateUserJuniorReadiness обновляет поле JuniorReadiness пользователя
func (r *SkillRepo) UpdateUserJuniorReadiness(userID uint) error {
	readiness, err := r.CalculateJuniorReadiness(userID)
	if err != nil {
		return err
	}

	return r.db.Model(&models.User{}).
		Where("id = ?", userID).
		Update("junior_readiness", readiness).Error
}

// BulkAddSkills добавляет несколько скилов пользователю (для спринтов)
func (r *SkillRepo) BulkAddSkills(userID uint, skills []struct {
	SkillID     uint
	Proficiency int
}) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, s := range skills {
			if s.Proficiency > 100 {
				s.Proficiency = 100
			}
			if s.Proficiency < 0 {
				s.Proficiency = 0
			}

			// Проверяем есть ли уже скилл
			var existing models.UserSkill
			if err := tx.Where("user_id = ? AND skill_id = ?", userID, s.SkillID).
				First(&existing).Error; err == nil {
				// Обновляем: берем макс из текущего и нового
				newProf := s.Proficiency
				if newProf < existing.Proficiency {
					newProf = existing.Proficiency
				}
				if err := tx.Model(&existing).Update("proficiency", newProf).Error; err != nil {
					return err
				}
			} else if err == gorm.ErrRecordNotFound {
				// Создаем новый скилл
				if err := tx.Create(&models.UserSkill{
					UserID:      userID,
					SkillID:     s.SkillID,
					Proficiency: s.Proficiency,
				}).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		}
		return nil
	})
}
