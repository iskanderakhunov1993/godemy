package http

import (
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golanger/backend/models"
)

type activateInput struct {
	Email string `json:"email" binding:"required,email"`
	Days  int    `json:"days" binding:"required,min=1,max=365"`
}

type createModuleInput struct {
	Name             string `json:"name" binding:"required"`
	Level            string `json:"level"`
	Category         string `json:"category"`
	FirstLessonTitle string `json:"firstLessonTitle" binding:"required"`
}

type renameModuleInput struct {
	NewName string `json:"newName" binding:"required"`
}

type adminUserInput struct {
	FullName         *string `json:"fullName"`
	EmailVerified    *bool   `json:"emailVerified"`
	AdminDescription *string `json:"adminDescription"`
	IsPremium        *bool   `json:"isPremium"`
	PremiumUntil     *string `json:"premiumUntil"`
	JuniorReadiness  *int    `json:"juniorReadiness"`
}

type adminUserActivityDTO struct {
	ID         uint      `json:"id"`
	EntityType string    `json:"entityType"`
	EntityID   uint      `json:"entityId"`
	Status     string    `json:"status"`
	Payload    string    `json:"payload,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type adminUserDTO struct {
	ID                 uint                   `json:"id"`
	Email              string                 `json:"email"`
	Username           string                 `json:"username"`
	FullName           string                 `json:"fullName"`
	IsPremium          bool                   `json:"isPremium"`
	IsAdmin            bool                   `json:"isAdmin"`
	EmailVerified      bool                   `json:"emailVerified"`
	AdminDescription   string                 `json:"adminDescription"`
	PremiumUntil       *time.Time             `json:"premiumUntil"`
	JuniorReadiness    int                    `json:"juniorReadiness"`
	CreatedAt          time.Time              `json:"createdAt"`
	UpdatedAt          time.Time              `json:"updatedAt"`
	Plan               string                 `json:"plan"`
	ProgressTotal      int                    `json:"progressTotal"`
	CompletedTotal     int                    `json:"completedTotal"`
	HasCertificate     bool                   `json:"hasCertificate"`
	CertificatesEarned int                    `json:"certificatesEarned"`
	LastActivityAt     *time.Time             `json:"lastActivityAt"`
	RecentActivity     []adminUserActivityDTO `json:"recentActivity,omitempty"`
}

// ActivatePremium godoc
// POST /api/admin/activate
func (h *Handler) ActivatePremium() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input activateInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := h.auth.FindUserByEmail(input.Email)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		until := time.Now().AddDate(0, 0, input.Days)
		user.IsPremium = true
		user.PremiumUntil = &until

		if err := h.auth.UpdateUser(user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"ok":           true,
			"email":        user.Email,
			"premiumUntil": until.Format(time.RFC3339),
		})
	}
}

func (h *Handler) AdminListUsers() gin.HandlerFunc {
	return func(c *gin.Context) {
		users, err := h.auth.ListUsers()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load users"})
			return
		}

		lessons, err := h.content.GetAllLessons()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load lessons"})
			return
		}
		exercises, err := h.content.GetAllExercises()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load exercises"})
			return
		}

		result := make([]adminUserDTO, 0, len(users))
		for i := range users {
			progresses, err := h.content.GetProgress(users[i].ID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user progress"})
				return
			}
			result = append(result, buildAdminUserDTO(&users[i], progresses, lessons, exercises, false))
		}

		c.JSON(http.StatusOK, result)
	}
}

func (h *Handler) AdminGetUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}

		user, err := h.auth.FindUserByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		progresses, err := h.content.GetProgress(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user progress"})
			return
		}
		lessons, err := h.content.GetAllLessons()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load lessons"})
			return
		}
		exercises, err := h.content.GetAllExercises()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load exercises"})
			return
		}

		c.JSON(http.StatusOK, buildAdminUserDTO(user, progresses, lessons, exercises, true))
	}
}

func (h *Handler) AdminUpdateUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}

		user, err := h.auth.FindUserByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}

		var input adminUserInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if input.FullName != nil {
			user.FullName = strings.TrimSpace(*input.FullName)
		}
		if input.EmailVerified != nil {
			user.EmailVerified = *input.EmailVerified
		}
		if input.AdminDescription != nil {
			user.AdminDescription = strings.TrimSpace(*input.AdminDescription)
		}
		if input.JuniorReadiness != nil {
			if *input.JuniorReadiness < 0 || *input.JuniorReadiness > 100 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "juniorReadiness must be between 0 and 100"})
				return
			}
			user.JuniorReadiness = *input.JuniorReadiness
		}
		if input.IsPremium != nil {
			user.IsPremium = *input.IsPremium
			if !user.IsPremium {
				user.PremiumUntil = nil
			}
		}
		if input.PremiumUntil != nil {
			premiumUntil, err := parseAdminDate(*input.PremiumUntil)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "premiumUntil must be RFC3339 or YYYY-MM-DD"})
				return
			}
			user.PremiumUntil = premiumUntil
			if premiumUntil != nil {
				user.IsPremium = true
			}
		}

		if err := h.auth.UpdateUser(user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
			return
		}

		progresses, err := h.content.GetProgress(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user progress"})
			return
		}
		lessons, err := h.content.GetAllLessons()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load lessons"})
			return
		}
		exercises, err := h.content.GetAllExercises()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load exercises"})
			return
		}

		c.JSON(http.StatusOK, buildAdminUserDTO(user, progresses, lessons, exercises, true))
	}
}

func parseAdminDate(value string) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return &parsed, nil
	}
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return nil, err
	}
	endOfDay := parsed.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	return &endOfDay, nil
}

func buildAdminUserDTO(user *models.User, progresses []models.Progress, lessons []models.Lesson, exercises []models.Exercise, includeActivity bool) adminUserDTO {
	sort.Slice(progresses, func(i, j int) bool {
		return progresses[i].UpdatedAt.After(progresses[j].UpdatedAt)
	})

	completed := 0
	var lastActivityAt *time.Time
	for i := range progresses {
		if progresses[i].Status == "completed" {
			completed++
		}
		if lastActivityAt == nil || progresses[i].UpdatedAt.After(*lastActivityAt) {
			value := progresses[i].UpdatedAt
			lastActivityAt = &value
		}
	}

	earned := 0
	certificates := buildCertificates(user, progresses, lessons, exercises)
	for i := range certificates {
		if certificates[i].Earned {
			earned++
		}
	}

	dto := adminUserDTO{
		ID:                 user.ID,
		Email:              user.Email,
		Username:           user.Username,
		FullName:           user.FullName,
		IsPremium:          user.IsPremium,
		IsAdmin:            user.IsAdmin,
		EmailVerified:      user.EmailVerified,
		AdminDescription:   user.AdminDescription,
		PremiumUntil:       user.PremiumUntil,
		JuniorReadiness:    user.JuniorReadiness,
		CreatedAt:          user.CreatedAt,
		UpdatedAt:          user.UpdatedAt,
		Plan:               adminUserPlan(user),
		ProgressTotal:      len(progresses),
		CompletedTotal:     completed,
		HasCertificate:     earned > 0,
		CertificatesEarned: earned,
		LastActivityAt:     lastActivityAt,
	}

	if includeActivity {
		limit := len(progresses)
		if limit > 20 {
			limit = 20
		}
		dto.RecentActivity = make([]adminUserActivityDTO, 0, limit)
		for i := 0; i < limit; i++ {
			dto.RecentActivity = append(dto.RecentActivity, adminUserActivityDTO{
				ID:         progresses[i].ID,
				EntityType: progresses[i].EntityType,
				EntityID:   progresses[i].EntityID,
				Status:     progresses[i].Status,
				Payload:    progresses[i].Payload,
				CreatedAt:  progresses[i].CreatedAt,
				UpdatedAt:  progresses[i].UpdatedAt,
			})
		}
	}

	return dto
}

func adminUserPlan(user *models.User) string {
	if user.IsPremium && (user.PremiumUntil == nil || user.PremiumUntil.After(time.Now())) {
		return "subscription"
	}
	return "basic"
}

// --- Lessons CRUD ---

func (h *Handler) AdminGetLessons() gin.HandlerFunc {
	return func(c *gin.Context) {
		lessons, err := h.content.GetAllLessons()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, lessons)
	}
}

func (h *Handler) AdminGetLesson() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		lesson, err := h.content.GetLessonByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "lesson not found"})
			return
		}
		c.JSON(http.StatusOK, lesson)
	}
}

func (h *Handler) AdminCreateLesson() gin.HandlerFunc {
	return func(c *gin.Context) {
		var lesson models.Lesson
		if err := c.ShouldBindJSON(&lesson); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		lesson.ID = 0
		if err := h.content.CreateLesson(&lesson); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, lesson)
	}
}

func (h *Handler) AdminUpdateLesson() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		existing, err := h.content.GetLessonByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "lesson not found"})
			return
		}
		if err := c.ShouldBindJSON(existing); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		existing.ID = uint(id)
		if err := h.content.UpdateLesson(existing); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, existing)
	}
}

func (h *Handler) AdminDeleteLesson() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		if err := h.content.DeleteLesson(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

// --- Exercises CRUD ---

func (h *Handler) AdminGetExercises() gin.HandlerFunc {
	return func(c *gin.Context) {
		exercises, err := h.content.GetAllExercises()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, exercises)
	}
}

func (h *Handler) AdminGetExercise() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		exercise, err := h.content.GetExercise(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "exercise not found"})
			return
		}
		c.JSON(http.StatusOK, exercise)
	}
}

func (h *Handler) AdminCreateExercise() gin.HandlerFunc {
	return func(c *gin.Context) {
		var exercise models.Exercise
		if err := c.ShouldBindJSON(&exercise); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		exercise.ID = 0
		if err := h.content.CreateExercise(&exercise); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, exercise)
	}
}

func (h *Handler) AdminUpdateExercise() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		existing, err := h.content.GetExercise(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "exercise not found"})
			return
		}
		if err := c.ShouldBindJSON(existing); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		existing.ID = uint(id)
		if err := h.content.UpdateExercise(existing); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, existing)
	}
}

func (h *Handler) AdminDeleteExercise() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		if err := h.content.DeleteExercise(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

// --- Modules CRUD ---

func (h *Handler) AdminGetModules() gin.HandlerFunc {
	return func(c *gin.Context) {
		modules, err := h.content.GetAllModules()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, modules)
	}
}

func (h *Handler) AdminCreateModule() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input createModuleInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		name := strings.TrimSpace(input.Name)
		title := strings.TrimSpace(input.FirstLessonTitle)
		if name == "" || title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name and firstLessonTitle are required"})
			return
		}

		lesson, err := h.content.CreateModule(
			name,
			strings.TrimSpace(input.Level),
			strings.TrimSpace(input.Category),
			title,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, lesson)
	}
}

func (h *Handler) AdminRenameModule() gin.HandlerFunc {
	return func(c *gin.Context) {
		oldName := strings.TrimSpace(c.Param("name"))
		if oldName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "module name is required"})
			return
		}

		var input renameModuleInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		newName := strings.TrimSpace(input.NewName)
		if newName == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "newName is required"})
			return
		}
		if oldName == newName {
			c.JSON(http.StatusOK, gin.H{"ok": true})
			return
		}

		if err := h.content.RenameModule(oldName, newName); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func (h *Handler) AdminDeleteModule() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := strings.TrimSpace(c.Param("name"))
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "module name is required"})
			return
		}

		if err := h.content.DeleteModule(name); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

// --- Levels CRUD ---

func (h *Handler) AdminGetLevels() gin.HandlerFunc {
	return func(c *gin.Context) {
		levels, err := h.content.GetAllLevels()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, levels)
	}
}

type createLevelInput struct {
	Title       string `json:"title" binding:"required"`
	Slug        string `json:"slug"`
	Order       int    `json:"order"`
	Description string `json:"description"`
}

func (h *Handler) AdminCreateLevel() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input createLevelInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		slug := strings.TrimSpace(input.Slug)
		if slug == "" {
			slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(input.Title), " ", "-"))
		}
		level := &models.Level{
			Title:       strings.TrimSpace(input.Title),
			Slug:        slug,
			Order:       input.Order,
			Description: strings.TrimSpace(input.Description),
		}
		if err := h.content.CreateLevel(level); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, level)
	}
}

type updateLevelInput struct {
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	Order       int    `json:"order"`
	Description string `json:"description"`
}

func (h *Handler) AdminUpdateLevel() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		existing, err := h.content.GetLevelByID(uint(id))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "level not found"})
			return
		}
		var input updateLevelInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if input.Title != "" {
			existing.Title = strings.TrimSpace(input.Title)
		}
		existing.Description = strings.TrimSpace(input.Description)
		if input.Slug != "" {
			existing.Slug = strings.TrimSpace(input.Slug)
		}
		existing.Order = input.Order
		if err := h.content.UpdateLevel(existing); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, existing)
	}
}

func (h *Handler) AdminDeleteLevel() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		if err := h.content.DeleteLevel(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

type moveModuleInput struct {
	NewLevel string `json:"newLevel" binding:"required"`
}

func (h *Handler) AdminMoveModule() gin.HandlerFunc {
	return func(c *gin.Context) {
		name := strings.TrimSpace(c.Param("name"))
		if name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "module name is required"})
			return
		}
		var input moveModuleInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := h.content.MoveModuleToLevel(name, strings.TrimSpace(input.NewLevel)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}
