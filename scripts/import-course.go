package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Level struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug" gorm:"uniqueIndex"`
	Order       int       `json:"order"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Module struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	LevelID     uint      `json:"levelId" gorm:"index"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug" gorm:"uniqueIndex"`
	Order       int       `json:"order"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Topic struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ModuleID    uint      `json:"moduleId" gorm:"index"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug" gorm:"uniqueIndex"`
	Order       int       `json:"order"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type Lesson struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Level       string    `json:"level" gorm:"index;not null;default:level1"`
	Module      string    `json:"module" gorm:"index;not null;default:core"`
	TopicID     *uint     `json:"topicId" gorm:"index"`
	Slug        string    `json:"slug" gorm:"uniqueIndex;not null"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Content     string    `json:"content" gorm:"type:text"`
	Order       int       `json:"order" gorm:"not null"`
	Category    string    `json:"category" gorm:"not null"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type CourseData struct {
	Levels []CourseLevel `json:"levels"`
}

type CourseLevel struct {
	Title       string         `json:"title"`
	Slug        string         `json:"slug"`
	Order       int            `json:"order"`
	Description string         `json:"description"`
	Modules     []CourseModule `json:"modules"`
}

type CourseModule struct {
	Title       string        `json:"title"`
	Slug        string        `json:"slug"`
	Order       int           `json:"order"`
	Description string        `json:"description"`
	Topics      []CourseTopic `json:"topics"`
}

type CourseTopic struct {
	Title       string         `json:"title"`
	Slug        string         `json:"slug"`
	Order       int            `json:"order"`
	Description string         `json:"description"`
	Lessons     []CourseLesson `json:"lessons"`
}

type CourseLesson struct {
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	Order       int    `json:"order"`
	Description string `json:"description"`
	Content     string `json:"content"`
}

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=godemy port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	dataFile := "course-data.json"
	if len(os.Args) > 1 {
		dataFile = os.Args[1]
	}

	raw, err := os.ReadFile(dataFile)
	if err != nil {
		log.Fatalf("Failed to read %s: %v", dataFile, err)
	}

	var course CourseData
	if err := json.Unmarshal(raw, &course); err != nil {
		log.Fatalf("Failed to parse JSON: %v", err)
	}

	totalLessons := 0

	for _, cl := range course.Levels {
		level := Level{
			Title:       cl.Title,
			Slug:        cl.Slug,
			Order:       cl.Order,
			Description: cl.Description,
		}

		var existing Level
		if err := db.Where("slug = ?", level.Slug).First(&existing).Error; err == nil {
			level.ID = existing.ID
			db.Save(&level)
			fmt.Printf("  Updated level: %s (id=%d)\n", level.Title, level.ID)
		} else {
			db.Create(&level)
			fmt.Printf("  Created level: %s (id=%d)\n", level.Title, level.ID)
		}

		for _, cm := range cl.Modules {
			module := Module{
				LevelID:     level.ID,
				Title:       cm.Title,
				Slug:        cm.Slug,
				Order:       cm.Order,
				Description: cm.Description,
			}

			var existingMod Module
			if err := db.Where("slug = ?", module.Slug).First(&existingMod).Error; err == nil {
				module.ID = existingMod.ID
				db.Save(&module)
				fmt.Printf("    Updated module: %s (id=%d)\n", module.Title, module.ID)
			} else {
				db.Create(&module)
				fmt.Printf("    Created module: %s (id=%d)\n", module.Title, module.ID)
			}

			for _, ct := range cm.Topics {
				topic := Topic{
					ModuleID:    module.ID,
					Title:       ct.Title,
					Slug:        ct.Slug,
					Order:       ct.Order,
					Description: ct.Description,
				}

				var existingTopic Topic
				if err := db.Where("slug = ?", topic.Slug).First(&existingTopic).Error; err == nil {
					topic.ID = existingTopic.ID
					db.Save(&topic)
					fmt.Printf("      Updated topic: %s (id=%d)\n", topic.Title, topic.ID)
				} else {
					db.Create(&topic)
					fmt.Printf("      Created topic: %s (id=%d)\n", topic.Title, topic.ID)
				}

				for _, ll := range ct.Lessons {
					category := "theory"
					if strings.Contains(ll.Title, "🔨") || strings.Contains(strings.ToLower(ll.Title), "практика") || strings.Contains(strings.ToLower(ll.Title), "финал") || strings.Contains(strings.ToLower(ll.Title), "задание") {
						category = "practice"
					}

					lesson := Lesson{
						Level:       cl.Slug,
						Module:      cm.Slug,
						TopicID:     &topic.ID,
						Slug:        ll.Slug,
						Title:       ll.Title,
						Description: ll.Description,
						Content:     ll.Content,
						Order:       ll.Order,
						Category:    category,
					}

					var existingLesson Lesson
					if err := db.Where("slug = ?", lesson.Slug).First(&existingLesson).Error; err == nil {
						lesson.ID = existingLesson.ID
						db.Save(&lesson)
						fmt.Printf("        Updated lesson: %s\n", lesson.Title)
					} else {
						db.Create(&lesson)
						fmt.Printf("        Created lesson: %s\n", lesson.Title)
					}
					totalLessons++
				}
			}
		}
	}

	fmt.Printf("\n✅ Import complete! %d lessons imported.\n", totalLessons)
}
