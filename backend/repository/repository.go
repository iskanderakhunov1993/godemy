package repository

import (
	"errors"
	"time"

	"golanger/backend/models"
)

// ErrNotFound is returned when a requested record does not exist.
var ErrNotFound = errors.New("record not found")

type UserRepository interface {
	Create(user *models.User) error
	FindAll() ([]models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindByID(id uint) (*models.User, error)
	FindByProvider(provider, providerID string) (*models.User, error)
	Update(user *models.User) error
}

type PasswordResetRepository interface {
	Create(token *models.PasswordResetToken) error
	FindValidByHash(tokenHash string, now time.Time) (*models.PasswordResetToken, error)
	MarkUsed(id uint) error
	DeleteByUser(userID uint) error
}

type LevelRepository interface {
	FindAll() ([]models.Level, error)
	FindByID(id uint) (*models.Level, error)
	Create(level *models.Level) error
	Update(level *models.Level) error
	Delete(id uint) error
}

type LessonRepository interface {
	FindAll(module string) ([]models.Lesson, error)
	FindBySlug(slug, module string) (*models.Lesson, error)
	FindByID(id uint) (*models.Lesson, error)
	Create(lesson *models.Lesson) error
	Update(lesson *models.Lesson) error
	Delete(id uint) error
}

type ExerciseRepository interface {
	FindAll(module, category, difficulty string) ([]models.Exercise, error)
	FindByID(id uint) (*models.Exercise, error)
	FindByModule(module string) ([]models.Exercise, error)
	FindByTopicID(topicID uint) ([]models.Exercise, error)
	Create(exercise *models.Exercise) error
	Update(exercise *models.Exercise) error
	Delete(id uint) error
}

type TrainerTopicRepository interface {
	FindAll(module string) ([]models.TrainerTopic, error)
	FindBySlug(slug string) (*models.TrainerTopic, error)
	FindByID(id uint) (*models.TrainerTopic, error)
	Create(t *models.TrainerTopic) error
	Update(t *models.TrainerTopic) error
	Delete(id uint) error
}

type ProgressRepository interface {
	FindByUser(userID uint) ([]models.Progress, error)
	FindOne(userID uint, entityType string, entityID uint) (*models.Progress, error)
	Upsert(userID uint, entityType string, entityID uint, status string, payload string) (*models.Progress, error)
}
