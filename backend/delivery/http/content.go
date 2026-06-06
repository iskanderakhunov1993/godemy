package http

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golanger/backend/usecase"
)

func (h *Handler) GetLessons() gin.HandlerFunc {
	return func(c *gin.Context) {
		lessons, err := h.content.GetLessons(c.Query("module"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lessons"})
			return
		}
		c.JSON(http.StatusOK, lessons)
	}
}

func (h *Handler) GetLesson() gin.HandlerFunc {
	return func(c *gin.Context) {
		lesson, err := h.content.GetLesson(c.Param("slug"), c.Query("module"))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Lesson not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lesson"})
			return
		}
		c.JSON(http.StatusOK, lesson)
	}
}

func (h *Handler) GetExercises() gin.HandlerFunc {
	return func(c *gin.Context) {
		exercises, err := h.content.GetExercises(c.Query("module"), c.Query("category"), c.Query("difficulty"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exercises"})
			return
		}
		c.JSON(http.StatusOK, exercises)
	}
}

func (h *Handler) GetExercise() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid exercise ID"})
			return
		}

		exercise, err := h.content.GetExercise(uint(id))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exercise"})
			return
		}
		c.JSON(http.StatusOK, exercise)
	}
}

func (h *Handler) GetProgress() gin.HandlerFunc {
	return func(c *gin.Context) {
		progresses, err := h.content.GetProgress(c.GetUint("userId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch progress"})
			return
		}
		c.JSON(http.StatusOK, progresses)
	}
}

func (h *Handler) UpdateProgress() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			EntityType string `json:"entityType" binding:"required"`
			EntityID   uint   `json:"entityId" binding:"required"`
			Status     string `json:"status" binding:"required"`
			Payload    string `json:"payload"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		progress, err := h.content.UpdateProgress(c.GetUint("userId"), input.EntityType, input.EntityID, input.Status, input.Payload)
		if errors.Is(err, usecase.ErrInvalidInput) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entity type or status"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update progress"})
			return
		}

		c.JSON(http.StatusOK, progress)
	}
}
