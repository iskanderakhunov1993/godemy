package data

import (
	"strings"
	"testing"
)

func TestBankInternshipCourseStructure(t *testing.T) {
	lessons := bankInternshipLessons()
	if len(lessons) != 20 {
		t.Fatalf("expected 20 lessons, got %d", len(lessons))
	}

	seenSlugs := make(map[string]struct{}, len(lessons))
	requiredModules := map[string]bool{
		"Спринт 0 · Project ZERO":       false,
		"Спринт 1 · Limit Guard CLI":    false,
		"Спринт 2 · Release Pipeline":   false,
		"Спринт 3 · Transfer Rules API": false,
		"Спринт 4 · Production Review":  false,
	}

	for _, lesson := range lessons {
		if _, exists := seenSlugs[lesson.Slug]; exists {
			t.Fatalf("duplicate lesson slug %q", lesson.Slug)
		}
		seenSlugs[lesson.Slug] = struct{}{}

		if lesson.Level != flagshipLevelSlug {
			t.Errorf("lesson %q has unexpected level %q", lesson.Slug, lesson.Level)
		}
		if strings.TrimSpace(lesson.Content) == "" {
			t.Errorf("lesson %q has empty content", lesson.Slug)
		}
		if _, exists := requiredModules[lesson.Module]; exists {
			requiredModules[lesson.Module] = true
		}
	}

	for module, found := range requiredModules {
		if !found {
			t.Errorf("missing required module %q", module)
		}
	}
}
