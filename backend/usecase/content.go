package usecase

import (
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"golanger/backend/models"
	"golanger/backend/repository"
)

type AdminCourseModule struct {
	Name           string `json:"name"`
	LessonsCount   int    `json:"lessonsCount"`
	ExercisesCount int    `json:"exercisesCount"`
}

type CourseProgress struct {
	Module       string `json:"module"`
	Title        string `json:"title"`
	Progress     int    `json:"progress"`
	Completed    bool   `json:"completed"`
	LessonsDone  int    `json:"lessonsDone"`
	TotalLessons int    `json:"totalLessons"`
}

type CertificateProjectStatus struct {
	ID        uint   `json:"id"`
	Title     string `json:"title"`
	Slug      string `json:"slug"`
	Kind      string `json:"kind"`
	Status    string `json:"status"`
	GithubURL string `json:"githubUrl,omitempty"`
}

type GoJuniorCertificateStatus struct {
	ID               string                     `json:"id"`
	Title            string                     `json:"title"`
	Subtitle         string                     `json:"subtitle"`
	CourseName       string                     `json:"courseName"`
	Description      string                     `json:"description"`
	Earned           bool                       `json:"earned"`
	Progress         int                        `json:"progress"`
	Total            int                        `json:"total"`
	EarnedAt         string                     `json:"earnedAt,omitempty"`
	CertificateID    string                     `json:"certificateId,omitempty"`
	PreviewAllowed   bool                       `json:"previewAllowed"`
	DownloadAllowed  bool                       `json:"downloadAllowed"`
	EmailAllowed     bool                       `json:"emailAllowed"`
	RequiresPremium  bool                       `json:"requiresPremium"`
	FullNameRequired bool                       `json:"fullNameRequired"`
	LockedReason     string                     `json:"lockedReason,omitempty"`
	CtaLabel         string                     `json:"ctaLabel"`
	CtaHref          string                     `json:"ctaHref"`
	Projects         []CertificateProjectStatus `json:"projects"`
	ProjectsSnapshot string                     `json:"-"`
}

type ContentUseCase struct {
	lessons       repository.LessonRepository
	exercises     repository.ExerciseRepository
	progress      repository.ProgressRepository
	levels        repository.LevelRepository
	trainerTopics repository.TrainerTopicRepository
	skillRepo     *repository.SkillRepo // для работы со скилами
	projects      repository.ProjectRepository
	submissions   repository.ProjectSubmissionRepository
	certificates  repository.CertificateRepository
}

func NewContentUseCase(
	lessons repository.LessonRepository,
	exercises repository.ExerciseRepository,
	progress repository.ProgressRepository,
	levels repository.LevelRepository,
	trainerTopics repository.TrainerTopicRepository,
	skillRepo *repository.SkillRepo,
	projects repository.ProjectRepository,
	submissions repository.ProjectSubmissionRepository,
	certificates repository.CertificateRepository,
) *ContentUseCase {
	return &ContentUseCase{
		lessons:       lessons,
		exercises:     exercises,
		progress:      progress,
		levels:        levels,
		trainerTopics: trainerTopics,
		skillRepo:     skillRepo,
		projects:      projects,
		submissions:   submissions,
		certificates:  certificates,
	}
}

func (u *ContentUseCase) GetLessons(module string) ([]models.Lesson, error) {
	return u.lessons.FindAll(module)
}

func (u *ContentUseCase) GetLesson(slug, module string) (*models.Lesson, error) {
	lesson, err := u.lessons.FindBySlug(slug, module)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return lesson, err
}

func (u *ContentUseCase) GetExercises(module, category, difficulty string) ([]models.Exercise, error) {
	return u.exercises.FindAll(module, category, difficulty)
}

func (u *ContentUseCase) GetExercise(id uint) (*models.Exercise, error) {
	exercise, err := u.exercises.FindByID(id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return exercise, err
}

func (u *ContentUseCase) GetProgress(userID uint) ([]models.Progress, error) {
	return u.progress.FindByUser(userID)
}

func (u *ContentUseCase) UpdateProgress(userID uint, entityType string, entityID uint, status string, payload string) (*models.Progress, error) {
	if entityType != "lesson" && entityType != "exercise" && entityType != "exercise_tasks" {
		return nil, ErrInvalidInput
	}
	if status != "started" && status != "completed" {
		return nil, ErrInvalidInput
	}
	return u.progress.Upsert(userID, entityType, entityID, status, payload)
}

func (u *ContentUseCase) GetProjects(level string) ([]models.Project, error) {
	return u.projects.FindAll(level)
}

func (u *ContentUseCase) GetProject(slug string) (*models.Project, error) {
	project, err := u.projects.FindBySlug(slug)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return project, err
}

func (u *ContentUseCase) GetProjectByID(id uint) (*models.Project, error) {
	project, err := u.projects.FindByID(id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return project, err
}

func (u *ContentUseCase) CreateProject(project *models.Project) error {
	return u.projects.Create(project)
}

func (u *ContentUseCase) UpdateProject(project *models.Project) error {
	return u.projects.Update(project)
}

func (u *ContentUseCase) DeleteProject(id uint) error {
	return u.projects.Delete(id)
}

func (u *ContentUseCase) GetProjectSubmissions(userID uint) ([]models.ProjectSubmission, error) {
	return u.submissions.FindByUser(userID)
}

func (u *ContentUseCase) UpsertProjectSubmission(userID uint, projectID uint, status string, githubURL string, note string) (*models.ProjectSubmission, error) {
	if status != "started" && status != "completed" {
		return nil, ErrInvalidInput
	}
	if _, err := u.projects.FindByID(projectID); errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	} else if err != nil {
		return nil, err
	}
	return u.submissions.Upsert(userID, projectID, status, strings.TrimSpace(githubURL), strings.TrimSpace(note))
}

func (u *ContentUseCase) FindCertificateByPublicID(certificateID string) (*models.Certificate, error) {
	certificate, err := u.certificates.FindByCertificateID(certificateID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return certificate, err
}

func (u *ContentUseCase) EnsureGoJuniorCertificate(user *models.User) (*models.Certificate, error) {
	status, err := u.BuildGoJuniorCertificateStatus(user)
	if err != nil {
		return nil, err
	}
	if !status.Earned || status.FullNameRequired {
		return nil, ErrInvalidInput
	}
	existing, err := u.certificates.FindByUserAndType(user.ID, "go-junior")
	if err == nil {
		return existing, nil
	}
	if !errors.Is(err, repository.ErrNotFound) {
		return nil, err
	}
	certificate := &models.Certificate{
		CertificateID:    makeCertificateID(user.ID, "go-junior", time.Now()),
		UserID:           user.ID,
		Type:             "go-junior",
		Status:           "issued",
		IssuedAt:         time.Now(),
		ProjectsSnapshot: status.ProjectsSnapshot,
	}
	if err := u.certificates.Create(certificate); err != nil {
		return nil, err
	}
	return certificate, nil
}

func (u *ContentUseCase) BuildGoJuniorCertificateStatus(user *models.User) (*GoJuniorCertificateStatus, error) {
	progresses, err := u.progress.FindByUser(user.ID)
	if err != nil {
		return nil, err
	}
	lessons, err := u.lessons.FindAll("bootcamp")
	if err != nil {
		return nil, err
	}
	exercises, err := u.exercises.FindAll("bootcamp", "", "")
	if err != nil {
		return nil, err
	}
	projects, err := u.projects.FindAll("go-junior")
	if err != nil {
		return nil, err
	}
	submissions, err := u.submissions.FindByUser(user.ID)
	if err != nil {
		return nil, err
	}

	completedLessons := map[uint]bool{}
	completedExercises := map[uint]bool{}
	for _, progress := range progresses {
		if progress.Status != "completed" {
			continue
		}
		switch progress.EntityType {
		case "lesson":
			completedLessons[progress.EntityID] = true
		case "exercise":
			completedExercises[progress.EntityID] = true
		}
	}

	submissionByProject := map[uint]models.ProjectSubmission{}
	for _, submission := range submissions {
		submissionByProject[submission.ProjectID] = submission
	}

	progress := 0
	total := len(lessons) + len(exercises) + len(projects)
	for _, lesson := range lessons {
		if completedLessons[lesson.ID] {
			progress++
		}
	}
	for _, exercise := range exercises {
		if completedExercises[exercise.ID] {
			progress++
		}
	}

	projectStatuses := make([]CertificateProjectStatus, 0, len(projects))
	for _, project := range projects {
		status := "started"
		githubURL := ""
		if submission, ok := submissionByProject[project.ID]; ok {
			status = submission.Status
			githubURL = submission.GithubURL
			if submission.Status == "completed" {
				progress++
			}
		}
		projectStatuses = append(projectStatuses, CertificateProjectStatus{
			ID:        project.ID,
			Title:     project.Title,
			Slug:      project.Slug,
			Kind:      project.Kind,
			Status:    status,
			GithubURL: githubURL,
		})
	}

	fullNameReady := len(strings.Fields(strings.TrimSpace(user.FullName))) >= 2
	earned := total > 0 && progress >= total
	certificate, certErr := u.certificates.FindByUserAndType(user.ID, "go-junior")
	if certErr != nil && !errors.Is(certErr, repository.ErrNotFound) {
		return nil, certErr
	}
	issued := certErr == nil

	lockedReason := ""
	switch {
	case !earned:
		lockedReason = "Заверши Go Junior Bootcamp, четыре проекта и финальный checkpoint."
	case !fullNameReady:
		lockedReason = "Добавь имя и фамилию в профиле, чтобы выпустить сертификат."
	}

	earnedAt := ""
	certificateID := ""
	if issued {
		earnedAt = certificate.IssuedAt.Format(time.RFC3339)
		certificateID = certificate.CertificateID
	}

	return &GoJuniorCertificateStatus{
		ID:               "go-junior",
		Title:            "Go Junior Certificate",
		Subtitle:         "Go Junior Bootcamp завершён",
		CourseName:       "Go Junior Bootcamp",
		Description:      "Выдаётся бесплатно после завершения Bootcamp, обязательных проектов и финального checkpoint.",
		Earned:           earned,
		Progress:         progress,
		Total:            total,
		EarnedAt:         earnedAt,
		CertificateID:    certificateID,
		PreviewAllowed:   issued,
		DownloadAllowed:  issued,
		EmailAllowed:     issued,
		RequiresPremium:  false,
		FullNameRequired: !fullNameReady,
		LockedReason:     lockedReason,
		CtaLabel:         "Продолжить Bootcamp",
		CtaHref:          "/junior",
		Projects:         projectStatuses,
		ProjectsSnapshot: buildProjectsSnapshot(projectStatuses),
	}, nil
}

func buildProjectsSnapshot(projects []CertificateProjectStatus) string {
	parts := make([]string, 0, len(projects))
	for _, project := range projects {
		if project.Status == "completed" {
			parts = append(parts, fmt.Sprintf("%s|%s|%s", project.Title, project.Kind, project.GithubURL))
		}
	}
	return strings.Join(parts, "\n")
}

func makeCertificateID(userID uint, certType string, issuedAt time.Time) string {
	raw := fmt.Sprintf("%d:%s:%s", userID, certType, issuedAt.Format(time.RFC3339Nano))
	sum := sha1.Sum([]byte(raw))
	return fmt.Sprintf("GDMY-%d-%s", issuedAt.Year(), strings.ToUpper(hex.EncodeToString(sum[:4])))
}

// Admin: Lessons

func (u *ContentUseCase) GetAllLessons() ([]models.Lesson, error) {
	return u.lessons.FindAll("")
}

func (u *ContentUseCase) GetLessonByID(id uint) (*models.Lesson, error) {
	lesson, err := u.lessons.FindByID(id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return lesson, err
}

func (u *ContentUseCase) CreateLesson(lesson *models.Lesson) error {
	return u.lessons.Create(lesson)
}

func (u *ContentUseCase) UpdateLesson(lesson *models.Lesson) error {
	return u.lessons.Update(lesson)
}

func (u *ContentUseCase) DeleteLesson(id uint) error {
	return u.lessons.Delete(id)
}

// Admin: Exercises

func (u *ContentUseCase) GetAllExercises() ([]models.Exercise, error) {
	return u.exercises.FindAll("", "", "")
}

func (u *ContentUseCase) CreateExercise(exercise *models.Exercise) error {
	return u.exercises.Create(exercise)
}

func (u *ContentUseCase) UpdateExercise(exercise *models.Exercise) error {
	return u.exercises.Update(exercise)
}

func (u *ContentUseCase) DeleteExercise(id uint) error {
	return u.exercises.Delete(id)
}

// Admin: Modules (derived from lessons/exercises)

func (u *ContentUseCase) GetAllModules() ([]AdminCourseModule, error) {
	lessons, err := u.lessons.FindAll("")
	if err != nil {
		return nil, err
	}
	exercises, err := u.exercises.FindAll("", "", "")
	if err != nil {
		return nil, err
	}

	moduleMap := make(map[string]*AdminCourseModule)
	for _, lesson := range lessons {
		if lesson.Module == "" {
			continue
		}
		if _, ok := moduleMap[lesson.Module]; !ok {
			moduleMap[lesson.Module] = &AdminCourseModule{Name: lesson.Module}
		}
		moduleMap[lesson.Module].LessonsCount++
	}
	for _, exercise := range exercises {
		if exercise.Module == "" {
			continue
		}
		if _, ok := moduleMap[exercise.Module]; !ok {
			moduleMap[exercise.Module] = &AdminCourseModule{Name: exercise.Module}
		}
		moduleMap[exercise.Module].ExercisesCount++
	}

	result := make([]AdminCourseModule, 0, len(moduleMap))
	for _, module := range moduleMap {
		result = append(result, *module)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})

	return result, nil
}

func (u *ContentUseCase) CreateModule(moduleName, level, category, firstLessonTitle string) (*models.Lesson, error) {
	baseSlug := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(firstLessonTitle), " ", "-"))
	if baseSlug == "" {
		baseSlug = "new-lesson"
	}
	slug := baseSlug + "-" + strconv.FormatInt(time.Now().UnixNano(), 10)

	lesson := &models.Lesson{
		Level:       level,
		Module:      moduleName,
		Category:    category,
		Slug:        slug,
		Title:       firstLessonTitle,
		Description: "",
		Content:     "",
		Order:       0,
	}

	if lesson.Level == "" {
		lesson.Level = "level1"
	}
	if lesson.Category == "" {
		lesson.Category = "Основы"
	}

	if err := u.lessons.Create(lesson); err != nil {
		return nil, err
	}

	return lesson, nil
}

func (u *ContentUseCase) RenameModule(oldName, newName string) error {
	lessons, err := u.lessons.FindAll(oldName)
	if err != nil {
		return err
	}
	for i := range lessons {
		lessons[i].Module = newName
		if err := u.lessons.Update(&lessons[i]); err != nil {
			return err
		}
	}

	exercises, err := u.exercises.FindByModule(oldName)
	if err != nil {
		return err
	}
	for i := range exercises {
		exercises[i].Module = newName
		if err := u.exercises.Update(&exercises[i]); err != nil {
			return err
		}
	}

	return nil
}

func (u *ContentUseCase) DeleteModule(moduleName string) error {
	lessons, err := u.lessons.FindAll(moduleName)
	if err != nil {
		return err
	}
	for _, lesson := range lessons {
		if err := u.lessons.Delete(lesson.ID); err != nil {
			return err
		}
	}

	exercises, err := u.exercises.FindByModule(moduleName)
	if err != nil {
		return err
	}
	for _, exercise := range exercises {
		if err := u.exercises.Delete(exercise.ID); err != nil {
			return err
		}
	}

	return nil
}

// Admin: Levels

func (u *ContentUseCase) GetAllLevels() ([]models.Level, error) {
	return u.levels.FindAll()
}

func (u *ContentUseCase) GetLevelByID(id uint) (*models.Level, error) {
	level, err := u.levels.FindByID(id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return level, err
}

func (u *ContentUseCase) CreateLevel(level *models.Level) error {
	return u.levels.Create(level)
}

func (u *ContentUseCase) UpdateLevel(level *models.Level) error {
	return u.levels.Update(level)
}

func (u *ContentUseCase) DeleteLevel(id uint) error {
	return u.levels.Delete(id)
}

// MoveModuleToLevel updates the level field on all lessons in a module
func (u *ContentUseCase) MoveModuleToLevel(moduleName, newLevel string) error {
	lessons, err := u.lessons.FindAll(moduleName)
	if err != nil {
		return err
	}
	for i := range lessons {
		lessons[i].Level = newLevel
		if err := u.lessons.Update(&lessons[i]); err != nil {
			return err
		}
	}
	return nil
}

// TrainerTopics

func (u *ContentUseCase) GetTrainerTopics(module string) ([]models.TrainerTopic, error) {
	return u.trainerTopics.FindAll(module)
}

func (u *ContentUseCase) GetTrainerTopicBySlug(slug string) (*models.TrainerTopic, error) {
	t, err := u.trainerTopics.FindBySlug(slug)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return t, err
}

func (u *ContentUseCase) GetTrainerTopicByID(id uint) (*models.TrainerTopic, error) {
	t, err := u.trainerTopics.FindByID(id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return t, err
}

func (u *ContentUseCase) CreateTrainerTopic(t *models.TrainerTopic) error {
	return u.trainerTopics.Create(t)
}

func (u *ContentUseCase) UpdateTrainerTopic(t *models.TrainerTopic) error {
	return u.trainerTopics.Update(t)
}

func (u *ContentUseCase) DeleteTrainerTopic(id uint) error {
	return u.trainerTopics.Delete(id)
}

// Skills - методы для работы со скилами пользователя

func (u *ContentUseCase) GetUserSkills(userID uint) ([]models.UserSkill, error) {
	return u.skillRepo.GetUserSkills(userID)
}

func (u *ContentUseCase) GetCourseProgress(userID uint) ([]CourseProgress, int, int, int, error) {
	// Получаем прогресс пользователя
	allProgress, err := u.progress.FindByUser(userID)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	// Подсчитываем завершенные спринты (курсы)
	completedModules := make(map[string]bool)
	completedLessons := 0

	progressMap := make(map[string]int) // module -> completed count
	for _, p := range allProgress {
		if p.EntityType == "lesson" && p.Status == "completed" {
			completedLessons++
			// Получаем информацию о уроке для определения модуля
			lesson, err := u.lessons.FindByID(p.EntityID)
			if err == nil && lesson != nil {
				progressMap[lesson.Module]++
			}
		}
	}

	// Получаем все уроки
	allLessons, err := u.lessons.FindAll("")
	if err != nil {
		return nil, 0, 0, 0, err
	}

	// Группируем уроки по модулям
	moduleMap := make(map[string][]models.Lesson)
	for _, lesson := range allLessons {
		moduleMap[lesson.Module] = append(moduleMap[lesson.Module], lesson)
	}

	// Строим результат
	result := make([]CourseProgress, 0)
	completedSprints := 0
	totalLessons := 0

	for moduleName, lessons := range moduleMap {
		if len(lessons) == 0 {
			continue
		}

		done := progressMap[moduleName]
		total := len(lessons)
		percent := 0
		if total > 0 {
			percent = (done * 100) / total
		}
		completed := done == total && total > 0

		if completed {
			completedSprints++
			completedModules[moduleName] = true
		}

		result = append(result, CourseProgress{
			Module:       moduleName,
			Title:        moduleName, // можно улучшить если будет title в модуле
			Progress:     percent,
			Completed:    completed,
			LessonsDone:  done,
			TotalLessons: total,
		})
		totalLessons += total
	}

	// Сортируем по имени модуля
	sort.Slice(result, func(i, j int) bool {
		return result[i].Module < result[j].Module
	})

	return result, completedSprints, totalLessons, completedLessons, nil
}
