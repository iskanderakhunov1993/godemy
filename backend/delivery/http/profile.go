package http

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golanger/backend/models"
	"golanger/backend/usecase"
)

type ProfileResponse struct {
	User              *profileUserDTO          `json:"user"`
	JuniorReadiness   int                      `json:"juniorReadiness"` // 0-100%
	PersonaType       string                   `json:"personaType"`     // "newbie" | "junior" | "mid" | "senior" | "neo"
	Skills            []skillDTO               `json:"skills"`
	CourseProgress    []usecase.CourseProgress `json:"courseProgress"`
	CompletedSprints  int                      `json:"completedSprints"`
	TotalLessonsCount int                      `json:"totalLessonsCount"`
	CompletedLessons  int                      `json:"completedLessons"`
	Certificates      []certificateDTO         `json:"certificates"`
}

type profileUserDTO struct {
	ID        uint   `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	FullName  string `json:"fullName"`
	IsPremium bool   `json:"isPremium"`
}

type skillDTO struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Category    string `json:"category"`
	Icon        string `json:"icon"`
	Proficiency int    `json:"proficiency"` // 0-100%
}

type certificateDTO struct {
	ID                string `json:"id"`
	Title             string `json:"title"`
	Subtitle          string `json:"subtitle"`
	CourseName        string `json:"courseName"`
	Description       string `json:"description"`
	Earned            bool   `json:"earned"`
	Progress          int    `json:"progress"`
	Total             int    `json:"total"`
	EarnedAt          string `json:"earnedAt,omitempty"`
	CertificateNumber string `json:"certificateNumber,omitempty"`
	PreviewAllowed    bool   `json:"previewAllowed"`
	DownloadAllowed   bool   `json:"downloadAllowed"`
	EmailAllowed      bool   `json:"emailAllowed"`
	RequiresPremium   bool   `json:"requiresPremium"`
	FullNameRequired  bool   `json:"fullNameRequired"`
	LockedReason      string `json:"lockedReason,omitempty"`
	CtaLabel          string `json:"ctaLabel"`
	CtaHref           string `json:"ctaHref"`
}

// GetProfile возвращает полный профиль пользователя с информацией о скилах, курсах и готовности
func (h *Handler) GetProfile() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetUint("userId")
		if userID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Получаем пользователя
		user, err := h.auth.Me(userID)
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile"})
			return
		}

		// Получаем скилы пользователя
		userSkills, err := h.content.GetUserSkills(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch skills"})
			return
		}

		// Преобразуем скилы в DTO
		skillDTOs := make([]skillDTO, len(userSkills))
		readiness := 0
		proficiencySum := 0
		for i, us := range userSkills {
			skillDTOs[i] = skillDTO{
				ID:          us.Skill.ID,
				Name:        us.Skill.Name,
				Category:    us.Skill.Category,
				Icon:        us.Skill.Icon,
				Proficiency: us.Proficiency,
			}
			proficiencySum += us.Proficiency
		}
		if len(userSkills) > 0 {
			readiness = proficiencySum / len(userSkills)
		} else {
			readiness = user.JuniorReadiness
		}

		// Получаем прогресс по курсам
		courseProgress, completedSprints, totalLessons, completedLessons, err := h.content.GetCourseProgress(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch course progress"})
			return
		}

		allProgress, err := h.content.GetProgress(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch certificate progress"})
			return
		}

		allLessons, err := h.content.GetLessons("")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lessons for certificates"})
			return
		}

		allExercises, err := h.content.GetExercises("", "", "")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exercises for certificates"})
			return
		}

		// Если пользовательские скилы еще не заполнены, выводим производные навыки из прогресса.
		if len(skillDTOs) == 0 && totalLessons > 0 {
			derivedSkills, derivedReadiness := buildDerivedSkills(completedLessons, totalLessons, completedSprints)
			skillDTOs = derivedSkills
			if derivedReadiness > readiness {
				readiness = derivedReadiness
			}
		}

		// Определяем persona на основе готовности
		persona := getPersonaType(readiness)

		profile := ProfileResponse{
			User: &profileUserDTO{
				ID:        user.ID,
				Email:     user.Email,
				Username:  user.Username,
				FullName:  user.FullName,
				IsPremium: user.IsPremium,
			},
			JuniorReadiness:   readiness,
			PersonaType:       persona,
			Skills:            skillDTOs,
			CourseProgress:    courseProgress,
			CompletedSprints:  completedSprints,
			TotalLessonsCount: totalLessons,
			CompletedLessons:  completedLessons,
			Certificates:      buildCertificates(user, allProgress, allLessons, allExercises),
		}

		c.JSON(http.StatusOK, profile)
	}
}

func buildCertificates(user *models.User, progresses []models.Progress, lessons []models.Lesson, exercises []models.Exercise) []certificateDTO {
	completedLessons := make(map[uint]time.Time)
	completedExercises := make(map[uint]time.Time)

	for _, progress := range progresses {
		if progress.Status != "completed" {
			continue
		}

		timestamp := progress.UpdatedAt
		if timestamp.IsZero() {
			timestamp = progress.CreatedAt
		}

		switch progress.EntityType {
		case "lesson":
			completedLessons[progress.EntityID] = timestamp
		case "exercise":
			completedExercises[progress.EntityID] = timestamp
		}
	}

	freeLessonIDs := make([]uint, 0)
	bootcampLessonIDs := make([]uint, 0)
	for _, lesson := range lessons {
		if lesson.Module == "bootcamp" {
			bootcampLessonIDs = append(bootcampLessonIDs, lesson.ID)
			continue
		}
		freeLessonIDs = append(freeLessonIDs, lesson.ID)
	}

	trainerExerciseIDs := make([]uint, 0)
	bootcampExerciseIDs := make([]uint, 0)
	for _, exercise := range exercises {
		switch exercise.Module {
		case "bootcamp":
			bootcampExerciseIDs = append(bootcampExerciseIDs, exercise.ID)
		case "core":
			trainerExerciseIDs = append(trainerExerciseIDs, exercise.ID)
		}
	}

	fullNameReady := hasCertificateFullName(user.FullName)

	return []certificateDTO{
		buildCertificateRecord(
			user,
			"course",
			"Сертификат курса",
			"Бесплатный курс завершён",
			"Основы Go",
			"Выдаётся за полное прохождение бесплатного курса целиком.",
			countCompletedIDs(freeLessonIDs, completedLessons),
			len(freeLessonIDs),
			latestCompletionFromLessons(freeLessonIDs, completedLessons),
			fullNameReady,
			"/guide",
			"Продолжить курс",
		),
		buildCertificateRecord(
			user,
			"trainer",
			"Сертификат тренажёра",
			"Все задачи тренажёра решены",
			"Тренажёр Go",
			"Выдаётся за прохождение всех задач тренажёра Go.",
			countCompletedIDs(trainerExerciseIDs, completedExercises),
			len(trainerExerciseIDs),
			latestCompletionFromExercises(trainerExerciseIDs, completedExercises),
			fullNameReady,
			"/trainer",
			"Открыть тренажёр",
		),
		buildCertificateRecord(
			user,
			"bootcamp",
			"Сертификат буткемпа",
			"Bootcamp Junior завершён",
			"Bootcamp Junior Go",
			"Выдаётся за прохождение всех материалов и практики уровня Junior в буткемпе.",
			countCompletedIDs(bootcampLessonIDs, completedLessons)+countCompletedIDs(bootcampExerciseIDs, completedExercises),
			len(bootcampLessonIDs)+len(bootcampExerciseIDs),
			maxTime(
				latestCompletionFromLessons(bootcampLessonIDs, completedLessons),
				latestCompletionFromExercises(bootcampExerciseIDs, completedExercises),
			),
			fullNameReady,
			bootcampCTAHref(user.IsPremium),
			userPremiumOrBuyLabel(user.IsPremium),
		),
	}
}

func buildCertificateRecord(
	user *models.User,
	id string,
	title string,
	subtitle string,
	courseName string,
	description string,
	progress int,
	total int,
	earnedAt time.Time,
	fullNameReady bool,
	ctaHref string,
	ctaLabel string,
) certificateDTO {
	earned := total > 0 && progress >= total
	previewAllowed := earned && fullNameReady
	downloadAllowed := previewAllowed && user.IsPremium
	emailAllowed := downloadAllowed

	lockedReason := ""
	switch {
	case id == "bootcamp" && !user.IsPremium && !earned:
		lockedReason = "Буткемп Junior открывается только по подписке Godemy Pro."
	case !earned:
		lockedReason = "Сначала заверши программу полностью."
	case !fullNameReady:
		lockedReason = "Добавь ФИО в профиле, чтобы выпустить сертификат."
	case !user.IsPremium:
		lockedReason = "Скачивание и отправка на почту доступны только с подпиской Godemy Pro."
	}

	earnedAtValue := ""
	certificateNumber := ""
	if earned && !earnedAt.IsZero() {
		earnedAtValue = earnedAt.Format(time.RFC3339)
		certificateNumber = makeCertificateNumber(user.ID, id, earnedAt)
	}

	return certificateDTO{
		ID:                id,
		Title:             title,
		Subtitle:          subtitle,
		CourseName:        courseName,
		Description:       description,
		Earned:            earned,
		Progress:          progress,
		Total:             total,
		EarnedAt:          earnedAtValue,
		CertificateNumber: certificateNumber,
		PreviewAllowed:    previewAllowed,
		DownloadAllowed:   downloadAllowed,
		EmailAllowed:      emailAllowed,
		RequiresPremium:   true,
		FullNameRequired:  !fullNameReady,
		LockedReason:      lockedReason,
		CtaHref:           ctaHref,
		CtaLabel:          ctaLabel,
	}
}

func hasCertificateFullName(value string) bool {
	parts := strings.Fields(strings.TrimSpace(value))
	return len(parts) >= 2
}

func countCompletedIDs[T comparable](ids []T, completed map[T]time.Time) int {
	count := 0
	for _, id := range ids {
		if _, ok := completed[id]; ok {
			count++
		}
	}
	return count
}

func latestCompletionFromLessons(ids []uint, completed map[uint]time.Time) time.Time {
	var latest time.Time
	for _, id := range ids {
		latest = maxTime(latest, completed[id])
	}
	return latest
}

func latestCompletionFromExercises(ids []uint, completed map[uint]time.Time) time.Time {
	var latest time.Time
	for _, id := range ids {
		latest = maxTime(latest, completed[id])
	}
	return latest
}

func maxTime(a time.Time, b time.Time) time.Time {
	if a.Before(b) {
		return b
	}
	return a
}

func makeCertificateNumber(userID uint, certType string, issuedAt time.Time) string {
	raw := fmt.Sprintf("%d:%s:%s", userID, certType, issuedAt.Format("2006-01-02"))
	sum := sha1.Sum([]byte(raw))
	return fmt.Sprintf("GDMY-%d-%s", issuedAt.Year(), strings.ToUpper(hex.EncodeToString(sum[:3])))
}

func userPremiumOrBuyLabel(isPremium bool) string {
	if isPremium {
		return "Открыть буткемп"
	}
	return "Оформить подписку"
}

func bootcampCTAHref(isPremium bool) string {
	if isPremium {
		return "/junior"
	}
	return "/bootcamp/buy"
}

func buildDerivedSkills(completedLessons, totalLessons, completedSprints int) ([]skillDTO, int) {
	if totalLessons <= 0 || completedLessons <= 0 {
		return []skillDTO{}, 0
	}

	readiness := (completedLessons * 100) / totalLessons
	if readiness > 100 {
		readiness = 100
	}

	// Базовый стек раскрывается по мере прохождения уроков/спринтов.
	derived := []skillDTO{
		{ID: 1001, Name: "Go Basics", Category: "Language", Icon: "🐹", Proficiency: minInt(readiness+10, 100)},
		{ID: 1002, Name: "Functions & Structs", Category: "Language", Icon: "🧱", Proficiency: minInt(readiness, 100)},
	}

	if completedLessons >= 3 {
		derived = append(derived,
			skillDTO{ID: 1003, Name: "HTTP Handlers", Category: "Web", Icon: "🌐", Proficiency: minInt(readiness-5, 90)},
		)
	}
	if completedLessons >= 5 {
		derived = append(derived,
			skillDTO{ID: 1004, Name: "PostgreSQL", Category: "Database", Icon: "🗄️", Proficiency: minInt(readiness-10, 85)},
			skillDTO{ID: 1005, Name: "Testing Basics", Category: "Testing", Icon: "✅", Proficiency: minInt(readiness-8, 88)},
		)
	}
	if completedSprints >= 2 {
		derived = append(derived,
			skillDTO{ID: 1006, Name: "Concurrency", Category: "Concurrency", Icon: "🔀", Proficiency: minInt(readiness-12, 82)},
		)
	}

	for i := range derived {
		if derived[i].Proficiency < 5 {
			derived[i].Proficiency = 5
		}
	}

	return derived, readiness
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// getPersonaType определяет тип персоны на основе процента готовности
func getPersonaType(readiness int) string {
	switch {
	case readiness < 10:
		return "newbie" // новичок
	case readiness < 35:
		return "junior" // junior
	case readiness < 65:
		return "mid" // middle
	case readiness < 90:
		return "senior" // senior
	default:
		return "neo" // "нео" в мире Go
	}
}
