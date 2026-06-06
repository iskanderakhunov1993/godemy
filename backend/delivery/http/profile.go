package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
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
		}

		c.JSON(http.StatusOK, profile)
	}
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
