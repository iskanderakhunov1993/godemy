package usecase

import (
	"errors"
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

type ContentUseCase struct {
	lessons       repository.LessonRepository
	exercises     repository.ExerciseRepository
	progress      repository.ProgressRepository
	levels        repository.LevelRepository
	trainerTopics repository.TrainerTopicRepository
	skillRepo     *repository.SkillRepo // для работы со скилами
}

func NewContentUseCase(
	lessons repository.LessonRepository,
	exercises repository.ExerciseRepository,
	progress repository.ProgressRepository,
	levels repository.LevelRepository,
	trainerTopics repository.TrainerTopicRepository,
	skillRepo *repository.SkillRepo,
) *ContentUseCase {
	return &ContentUseCase{
		lessons:       lessons,
		exercises:     exercises,
		progress:      progress,
		levels:        levels,
		trainerTopics: trainerTopics,
		skillRepo:     skillRepo,
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
