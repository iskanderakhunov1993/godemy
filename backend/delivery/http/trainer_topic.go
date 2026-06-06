package http

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golanger/backend/models"
	"golanger/backend/usecase"
)

// Public: GET /api/trainer/topics?module=core
func (h *Handler) GetTrainerTopics() gin.HandlerFunc {
	return func(c *gin.Context) {
		module := c.DefaultQuery("module", "core")
		topics, err := h.content.GetTrainerTopics(module)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, topics)
	}
}

// Public: GET /api/trainer/topics/:slug — with exercises preloaded
func (h *Handler) GetTrainerTopic() gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")
		topic, err := h.content.GetTrainerTopicBySlug(slug)
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "topic not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, topic)
	}
}

// Admin: GET /api/admin/trainer-topics
func (h *Handler) AdminGetTrainerTopics() gin.HandlerFunc {
	return func(c *gin.Context) {
		module := c.DefaultQuery("module", "")
		topics, err := h.content.GetTrainerTopics(module)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, topics)
	}
}

// Admin: GET /api/admin/trainer-topics/:id
func (h *Handler) AdminGetTrainerTopic() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		topic, err := h.content.GetTrainerTopicByID(uint(id))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "topic not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, topic)
	}
}

// Admin: POST /api/admin/trainer-topics
func (h *Handler) AdminCreateTrainerTopic() gin.HandlerFunc {
	return func(c *gin.Context) {
		var t models.TrainerTopic
		if err := c.ShouldBindJSON(&t); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		t.ID = 0
		if err := h.content.CreateTrainerTopic(&t); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, t)
	}
}

// Admin: PUT /api/admin/trainer-topics/:id
func (h *Handler) AdminUpdateTrainerTopic() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		existing, err := h.content.GetTrainerTopicByID(uint(id))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "topic not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err := c.ShouldBindJSON(existing); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		existing.ID = uint(id)
		if err := h.content.UpdateTrainerTopic(existing); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, existing)
	}
}

// Admin: DELETE /api/admin/trainer-topics/:id
func (h *Handler) AdminDeleteTrainerTopic() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
			return
		}
		if err := h.content.DeleteTrainerTopic(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}
