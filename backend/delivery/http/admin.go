package http

import (
	"net/http"
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
