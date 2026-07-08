package repository

import (
	"errors"

	"golanger/backend/models"
	"gorm.io/gorm"
)

type projectRepo struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) ProjectRepository {
	return &projectRepo{db: db}
}

func (r *projectRepo) FindAll(level string) ([]models.Project, error) {
	var projects []models.Project
	q := r.db.Order("\"order\" ASC, id ASC")
	if level != "" {
		q = q.Where("level = ?", level)
	}
	return projects, q.Find(&projects).Error
}

func (r *projectRepo) FindBySlug(slug string) (*models.Project, error) {
	var project models.Project
	err := r.db.Where("slug = ?", slug).First(&project).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &project, err
}

func (r *projectRepo) FindByID(id uint) (*models.Project, error) {
	var project models.Project
	err := r.db.First(&project, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &project, err
}

func (r *projectRepo) Create(project *models.Project) error {
	return r.db.Create(project).Error
}

func (r *projectRepo) Update(project *models.Project) error {
	return r.db.Save(project).Error
}

func (r *projectRepo) Delete(id uint) error {
	return r.db.Delete(&models.Project{}, id).Error
}

func (r *projectRepo) SeedDefaults(projects []models.Project) error {
	for i := range projects {
		var existing models.Project
		err := r.db.Where("slug = ?", projects[i].Slug).First(&existing).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			if err := r.db.Create(&projects[i]).Error; err != nil {
				return err
			}
			continue
		}
		if err != nil {
			return err
		}
	}
	return nil
}

type projectSubmissionRepo struct {
	db *gorm.DB
}

func NewProjectSubmissionRepository(db *gorm.DB) ProjectSubmissionRepository {
	return &projectSubmissionRepo{db: db}
}

func (r *projectSubmissionRepo) FindByUser(userID uint) ([]models.ProjectSubmission, error) {
	var submissions []models.ProjectSubmission
	return submissions, r.db.Preload("Project").Where("user_id = ?", userID).Find(&submissions).Error
}

func (r *projectSubmissionRepo) FindOne(userID uint, projectID uint) (*models.ProjectSubmission, error) {
	var submission models.ProjectSubmission
	err := r.db.Preload("Project").Where("user_id = ? AND project_id = ?", userID, projectID).First(&submission).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	return &submission, err
}

func (r *projectSubmissionRepo) Upsert(userID uint, projectID uint, status string, githubURL string, note string) (*models.ProjectSubmission, error) {
	submission, err := r.FindOne(userID, projectID)
	if errors.Is(err, ErrNotFound) {
		next := &models.ProjectSubmission{
			UserID:    userID,
			ProjectID: projectID,
			Status:    status,
			GithubURL: githubURL,
			Note:      note,
		}
		if err := r.db.Create(next).Error; err != nil {
			return nil, err
		}
		return r.FindOne(userID, projectID)
	}
	if err != nil {
		return nil, err
	}
	submission.Status = status
	submission.GithubURL = githubURL
	submission.Note = note
	if err := r.db.Model(submission).Updates(map[string]any{
		"status":     status,
		"github_url": githubURL,
		"note":       note,
	}).Error; err != nil {
		return nil, err
	}
	return r.FindOne(userID, projectID)
}
