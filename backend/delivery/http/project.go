package http

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"golanger/backend/models"
	"golanger/backend/usecase"
)

type projectSubmissionInput struct {
	Status    string `json:"status" binding:"required"`
	GithubURL string `json:"githubUrl"`
	Note      string `json:"note"`
}

func (h *Handler) GetProjects() gin.HandlerFunc {
	return func(c *gin.Context) {
		projects, err := h.content.GetProjects(c.Query("level"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
			return
		}
		c.JSON(http.StatusOK, projects)
	}
}

func (h *Handler) GetProject() gin.HandlerFunc {
	return func(c *gin.Context) {
		project, err := h.content.GetProject(c.Param("slug"))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
			return
		}
		c.JSON(http.StatusOK, project)
	}
}

func (h *Handler) GetProjectSubmissions() gin.HandlerFunc {
	return func(c *gin.Context) {
		submissions, err := h.content.GetProjectSubmissions(c.GetUint("userId"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project submissions"})
			return
		}
		c.JSON(http.StatusOK, submissions)
	}
}

func (h *Handler) UpsertProjectSubmission() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}
		var input projectSubmissionInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		submission, err := h.content.UpsertProjectSubmission(c.GetUint("userId"), uint(id), strings.TrimSpace(input.Status), input.GithubURL, input.Note)
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		if errors.Is(err, usecase.ErrInvalidInput) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project status"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save project submission"})
			return
		}
		c.JSON(http.StatusOK, submission)
	}
}

func (h *Handler) AdminGetProjects() gin.HandlerFunc {
	return func(c *gin.Context) {
		projects, err := h.content.GetProjects(c.Query("level"))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
			return
		}
		c.JSON(http.StatusOK, projects)
	}
}

func (h *Handler) AdminGetProject() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}
		project, err := h.content.GetProjectByID(uint(id))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
			return
		}
		c.JSON(http.StatusOK, project)
	}
}

func (h *Handler) AdminCreateProject() gin.HandlerFunc {
	return func(c *gin.Context) {
		var project models.Project
		if err := c.ShouldBindJSON(&project); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		normalizeProject(&project)
		if err := validateProject(project); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := h.content.CreateProject(&project); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
			return
		}
		c.JSON(http.StatusCreated, project)
	}
}

func (h *Handler) AdminUpdateProject() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}
		existing, err := h.content.GetProjectByID(uint(id))
		if errors.Is(err, usecase.ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
			return
		}
		var input models.Project
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		input.ID = existing.ID
		normalizeProject(&input)
		if err := validateProject(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := h.content.UpdateProject(&input); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
			return
		}
		c.JSON(http.StatusOK, input)
	}
}

func (h *Handler) AdminDeleteProject() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}
		if err := h.content.DeleteProject(uint(id)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"ok": true})
	}
}

func normalizeProject(project *models.Project) {
	project.Kind = strings.TrimSpace(project.Kind)
	project.Level = strings.TrimSpace(project.Level)
	project.Slug = strings.TrimSpace(project.Slug)
	project.Title = strings.TrimSpace(project.Title)
}

func validateProject(project models.Project) error {
	if project.Kind != "free_project" && project.Kind != "bootcamp_project" && project.Kind != "checkpoint" {
		return usecase.ErrInvalidInput
	}
	if project.Level != "free-go" && project.Level != "go-junior" {
		return usecase.ErrInvalidInput
	}
	if project.Slug == "" || project.Title == "" {
		return usecase.ErrInvalidInput
	}
	return nil
}
