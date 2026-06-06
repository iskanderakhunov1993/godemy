package database

import (
	"golanger/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(dsn string) error {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.PasswordResetToken{},
		&models.Skill{},
		&models.UserSkill{},
		&models.Level{},
		&models.Module{},
		&models.Topic{},
		&models.Lesson{},
		&models.TrainerTopic{},
		&models.Exercise{},
		&models.Progress{},
	)
	if err != nil {
		return err
	}

	DB = db
	return nil
}
