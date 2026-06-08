package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"golanger/backend/usecase"
)

type runInput struct {
	Code string `json:"code" binding:"required"`
}

type submitInput struct {
	Code       string `json:"code" binding:"required"`
	ExerciseID uint   `json:"exerciseId" binding:"required"`
}

const maxSubmittedCodeSize = 64 * 1024

func (h *Handler) RunCode() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input runInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if len(input.Code) > maxSubmittedCodeSize {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "code is too large"})
			return
		}

		result := h.runner.RunCode(input.Code)
		c.JSON(http.StatusOK, result)
	}
}

func (h *Handler) SubmitExercise() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input submitInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if len(input.Code) > maxSubmittedCodeSize {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "code is too large"})
			return
		}

		var userID *uint
		if userIDVal, exists := c.Get("userId"); exists {
			u := userIDVal.(uint)
			userID = &u
		}

		result, err := h.runner.SubmitExercise(userID, input.Code, input.ExerciseID)
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Exercise not found"})
			return
		}
		if errors.Is(err, usecase.ErrUnauthorized) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication is required for junior sprint submit"})
			return
		}
		if errors.Is(err, usecase.ErrForbidden) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Exercise is locked. Complete the previous practical task first."})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit exercise"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}
