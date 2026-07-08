package models

import (
	"time"

	"gorm.io/gorm"
)

type Level struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title"`
	Slug        string         `json:"slug" gorm:"uniqueIndex"`
	Order       int            `json:"order"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Modules     []Module       `json:"modules,omitempty"`
}

type Module struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	LevelID     uint           `json:"levelId" gorm:"index"`
	Title       string         `json:"title"`
	Slug        string         `json:"slug" gorm:"uniqueIndex"`
	Order       int            `json:"order"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Topics      []Topic        `json:"topics,omitempty"`
}

type Topic struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	ModuleID    uint           `json:"moduleId" gorm:"index"`
	Title       string         `json:"title"`
	Slug        string         `json:"slug" gorm:"uniqueIndex"`
	Order       int            `json:"order"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Lessons     []Lesson       `json:"lessons,omitempty"`
}

type User struct {
	ID               uint           `json:"id" gorm:"primaryKey"`
	Email            string         `json:"email" gorm:"uniqueIndex;not null"`
	Username         string         `json:"username" gorm:"uniqueIndex;not null"`
	FullName         string         `json:"fullName" gorm:"default:''"`
	Password         *string        `json:"-"`
	OAuthProvider    string         `json:"-" gorm:"index;default:''"`
	OAuthProviderID  string         `json:"-" gorm:"index;default:''"`
	IsPremium        bool           `json:"isPremium" gorm:"default:false"`
	IsAdmin          bool           `json:"isAdmin" gorm:"default:false"`
	EmailVerified    bool           `json:"emailVerified" gorm:"default:false"`
	AdminDescription string         `json:"adminDescription" gorm:"type:text;default:''"`
	PremiumUntil     *time.Time     `json:"premiumUntil" gorm:"index"`
	JuniorReadiness  int            `json:"juniorReadiness" gorm:"default:0"` // 0-100% готовность как junior в Go
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	Progresses []Progress  `json:"progresses,omitempty"`
	Skills     []UserSkill `json:"skills,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
}

type Lesson struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Level       string         `json:"level" gorm:"index;not null;default:level1"`
	Module      string         `json:"module" gorm:"index;not null;default:core"`
	TopicID     *uint          `json:"topicId" gorm:"index"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Title       string         `json:"title" gorm:"not null"`
	Description string         `json:"description"`
	Content     string         `json:"content" gorm:"type:text"`
	Order       int            `json:"order" gorm:"not null"`
	Category    string         `json:"category" gorm:"not null"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Exercise struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	Level          string         `json:"level" gorm:"index;not null;default:level1"`
	Module         string         `json:"module" gorm:"index;not null;default:core"`
	TrainerTopicID *uint          `json:"trainerTopicId" gorm:"index"`
	Title          string         `json:"title" gorm:"not null"`
	Description    string         `json:"description" gorm:"type:text"`
	Difficulty     string         `json:"difficulty" gorm:"not null"` // easy | medium | hard
	Category       string         `json:"category" gorm:"not null"`
	StarterCode    string         `json:"starterCode" gorm:"type:text"`
	TrainerLayout  string         `json:"trainerLayout" gorm:"type:text"`
	SolutionCode   string         `json:"-" gorm:"type:text"`
	TestCode       string         `json:"-" gorm:"type:text"`
	Hints          string         `json:"hints" gorm:"type:text"` // JSON array
	Order          int            `json:"order" gorm:"not null"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

// TrainerTopic — педагогическая единица тренажёра:
// тема → синтаксис → объяснение → примеры → паттерны → задания
type TrainerTopic struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Module      string         `json:"module" gorm:"index;not null;default:core"`
	Title       string         `json:"title" gorm:"not null"`
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Syntax      string         `json:"syntax" gorm:"type:text"`      // markdown/code блок синтаксиса
	Explanation string         `json:"explanation" gorm:"type:text"` // простое объяснение
	Examples    string         `json:"examples" gorm:"type:text"`    // JSON: [{title,code,description}]
	Patterns    string         `json:"patterns" gorm:"type:text"`    // markdown паттерны
	Order       int            `json:"order" gorm:"not null;default:0"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Exercises   []Exercise     `json:"exercises,omitempty" gorm:"foreignKey:TrainerTopicID"`
}

type Progress struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"userId" gorm:"not null;index"`
	EntityType string         `json:"entityType" gorm:"not null"` // "lesson" | "exercise" | "exercise_tasks"
	EntityID   uint           `json:"entityId" gorm:"not null"`
	Status     string         `json:"status" gorm:"not null"` // "started" | "completed"
	Payload    string         `json:"payload" gorm:"type:text"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type Project struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	Kind           string         `json:"kind" gorm:"index;not null"`  // free_project | bootcamp_project | checkpoint
	Level          string         `json:"level" gorm:"index;not null"` // free-go | go-junior
	Slug           string         `json:"slug" gorm:"uniqueIndex;not null"`
	Title          string         `json:"title" gorm:"not null"`
	Description    string         `json:"description" gorm:"type:text"`
	Requirements   string         `json:"requirements" gorm:"type:text"`
	ExpectedResult string         `json:"expectedResult" gorm:"type:text"`
	Checklist      string         `json:"checklist" gorm:"type:text"`
	Solution       string         `json:"solution" gorm:"type:text"`
	Order          int            `json:"order" gorm:"not null;default:0"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

type ProjectSubmission struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"userId" gorm:"not null;index;uniqueIndex:idx_user_project_submission"`
	ProjectID uint           `json:"projectId" gorm:"not null;index;uniqueIndex:idx_user_project_submission"`
	Status    string         `json:"status" gorm:"not null;default:started"` // started | completed
	GithubURL string         `json:"githubUrl" gorm:"type:text"`
	Note      string         `json:"note" gorm:"type:text"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	Project *Project `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
}

type Certificate struct {
	ID               uint           `json:"id" gorm:"primaryKey"`
	CertificateID    string         `json:"certificateId" gorm:"uniqueIndex;not null"`
	UserID           uint           `json:"userId" gorm:"not null;index"`
	Type             string         `json:"type" gorm:"index;not null"` // go-junior
	Status           string         `json:"status" gorm:"not null;default:issued"`
	IssuedAt         time.Time      `json:"issuedAt" gorm:"index"`
	ProjectsSnapshot string         `json:"projectsSnapshot" gorm:"type:text"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// Skill — навык (го структуры, горутины, интерфейсы и т.д.)
type Skill struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"uniqueIndex;not null"` // "Go Basics", "Goroutines", "HTTP Handlers"
	Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
	Category    string         `json:"category" gorm:"index"` // "Language" | "Concurrency" | "Web" | "Database" | "Testing"
	Description string         `json:"description" gorm:"type:text"`
	Icon        string         `json:"icon"` // emoji или иконка (например, "🔀" для concurrency)
	Order       int            `json:"order" gorm:"default:0"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// UserSkill — скилл пользователя с уровнем владения (0-100%)
type UserSkill struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"userId" gorm:"not null;index"`
	SkillID     uint           `json:"skillId" gorm:"not null;index"`
	Proficiency int            `json:"proficiency" gorm:"default:0"` // 0-100%
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Skill *Skill `json:"skill,omitempty" gorm:"foreignKey:SkillID;constraint:OnDelete:CASCADE"`
}

type PasswordResetToken struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"userId" gorm:"not null;index"`
	TokenHash string         `json:"-" gorm:"not null;uniqueIndex"`
	ExpiresAt time.Time      `json:"expiresAt" gorm:"index"`
	UsedAt    *time.Time     `json:"usedAt"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type EmailVerificationToken struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"userId" gorm:"not null;index"`
	TokenHash string         `json:"-" gorm:"not null;uniqueIndex"`
	ExpiresAt time.Time      `json:"expiresAt" gorm:"index"`
	UsedAt    *time.Time     `json:"usedAt"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
