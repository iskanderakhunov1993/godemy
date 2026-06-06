package usecase

import (
	"errors"
	"sort"

	"golanger/backend/repository"
	"golanger/backend/sandbox"
)

type RunnerUseCase struct {
	exercises repository.ExerciseRepository
	progress  repository.ProgressRepository
}

func NewRunnerUseCase(exercises repository.ExerciseRepository, progress repository.ProgressRepository) *RunnerUseCase {
	return &RunnerUseCase{exercises: exercises, progress: progress}
}

func (u *RunnerUseCase) RunCode(code string) sandbox.RunResult {
	return sandbox.RunCode(code)
}

func (u *RunnerUseCase) SubmitExercise(userID *uint, code string, exerciseID uint) (sandbox.RunResult, error) {
	exercise, err := u.exercises.FindByID(exerciseID)
	if errors.Is(err, repository.ErrNotFound) {
		return sandbox.RunResult{}, ErrNotFound
	}
	if err != nil {
		return sandbox.RunResult{}, err
	}

	if exercise.Module == "junior" {
		if userID == nil {
			return sandbox.RunResult{}, ErrUnauthorized
		}

		allowed, err := u.isJuniorExerciseUnlocked(*userID, exercise.ID)
		if err != nil {
			return sandbox.RunResult{}, err
		}
		if !allowed {
			return sandbox.RunResult{}, ErrForbidden
		}
	}

	var result sandbox.RunResult
	if exercise.TestCode != "" {
		result = sandbox.RunCodeWithTests(code, exercise.TestCode)
	} else {
		result = sandbox.RunCode(code)
	}

	if userID != nil && result.Passed {
		_, _ = u.progress.Upsert(*userID, "exercise", exerciseID, "completed", "")
	}

	return result, nil
}

func (u *RunnerUseCase) isJuniorExerciseUnlocked(userID uint, exerciseID uint) (bool, error) {
	exercises, err := u.exercises.FindByModule("junior")
	if err != nil {
		return false, err
	}
	if len(exercises) == 0 {
		return false, nil
	}

	sort.Slice(exercises, func(i, j int) bool {
		if exercises[i].Order == exercises[j].Order {
			return exercises[i].ID < exercises[j].ID
		}
		return exercises[i].Order < exercises[j].Order
	})

	currentIndex := -1
	for idx, ex := range exercises {
		if ex.ID == exerciseID {
			currentIndex = idx
			break
		}
	}
	if currentIndex == -1 {
		return false, nil
	}
	if currentIndex == 0 {
		return true, nil
	}

	for _, previous := range exercises[:currentIndex] {
		p, err := u.progress.FindOne(userID, "exercise", previous.ID)
		if errors.Is(err, repository.ErrNotFound) {
			return false, nil
		}
		if err != nil {
			return false, err
		}
		if p.Status != "completed" {
			return false, nil
		}
	}

	return true, nil
}
