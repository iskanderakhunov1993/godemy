export type PratkorDifficulty = 'easy' | 'medium' | 'hard'
export type PratkorStatus = 'completed' | 'in_progress' | 'available' | 'locked'

export type PratkorExercise = {
  id: number
  slug: string
  title: string
  summary: string
  instructions: string[]
  category: string
  difficulty: PratkorDifficulty
  starterCode: string
  requiredPatterns: string[]
  displayName: string
  icon: string
}

export type PratkorProgress = {
  completedSlugs: string[]
  drafts: Record<string, string>
}

const PRATKOR_PROGRESS_KEY = 'pratkor-progress-v1'
const PRATKOR_ADMIN_EXERCISES_KEY = 'pratkor-admin-exercises-v1'

const exerciseNames: string[] = [
  'Echo',
  'Two Fer',
  'Hamming',
  'Raindrops',
  'Leap',
  'Scrabble Score',
  'Elon\'s Toys',
  'Difference of Squares',
  'Isogram',
  'Collatz Conjecture',
  'Pangram',
  'RNA Transcription',
  'Triangle',
  'Anagram',
  'Atbash Cipher',
  'Beer Song',
  'Roman Numerals',
  'Space Age',
  'Luhn',
  'Protein Translation',
  'Crypto Square',
  'Sum of Multiples',
  'Largest Series',
  'Nth Prime',
  'Prime Factors',
  'Perfect Numbers',
  'Counting Cards',
  'Phone Number',
  'Palindrome Products',
  'Sparkly Numbers',
  'Grains',
  'Clock',
  'Minesweeper',
  'Sieve',
  'Word Count',
  'Gigasecond',
  'Reverse String',
  'Resistor Color',
  'Robot Name',
  'Pythagorean Triplet',
  'Bowling',
  'Matrix',
  'Parallel Letter Frequency',
  'Pig Latin',
  'Rotational Cipher',
  'Tournament',
  'Twelve Days',
  'Acronym',
  'Allergies',
  'Yacht',
]

const categoryIcons: Record<string, string> = {
  functions: '⚙️',
  conditionals: '🔀',
  loops: '🔁',
  strings: '📝',
  'slices-maps': '📦',
  structs: '🏗️',
  errors: '⚠️',
  interfaces: '🔌',
  concurrency: '⚡',
  architecture: '🏢',
}

const categorySpecs: Array<{
  key: string
  title: string
  summary: string
  hardPattern: string
}> = [
  {
    key: 'functions',
    title: 'Функции и сигнатуры',
    summary: 'Параметры, возврат, базовые вычисления.',
    hardPattern: 'switch\\s+',
  },
  {
    key: 'conditionals',
    title: 'Условия и ветвления',
    summary: 'if, guard clauses, принятие решений.',
    hardPattern: 'else\\s+if|switch\\s+',
  },
  {
    key: 'loops',
    title: 'Циклы и range',
    summary: 'Проход по данным, агрегирование, фильтрация.',
    hardPattern: 'for\\s+.*range',
  },
  {
    key: 'strings',
    title: 'Строки и руны',
    summary: 'Обработка текста, нормализация, подсчеты.',
    hardPattern: 'map\\s*\\[rune\\]int|rune',
  },
  {
    key: 'slices-maps',
    title: 'Слайсы и map',
    summary: 'Коллекции, словари, частотный анализ.',
    hardPattern: 'make\\s*\\(\\s*map',
  },
  {
    key: 'structs',
    title: 'Структуры и методы',
    summary: 'Моделирование сущностей и поведение.',
    hardPattern: 'type\\s+\\w+\\s+struct|func\\s*\\(\\s*\\w+\\s+\\*?\\w+\\s*\\)',
  },
  {
    key: 'errors',
    title: 'Ошибки и валидация',
    summary: 'Предсказуемые ошибки и безопасный код.',
    hardPattern: 'error|fmt\\.Errorf|errors\\.New',
  },
  {
    key: 'interfaces',
    title: 'Интерфейсы',
    summary: 'Контракты, полиморфизм и композиция.',
    hardPattern: 'interface\\s*\\{|type\\s+\\w+\\s+interface',
  },
  {
    key: 'concurrency',
    title: 'Горутины и каналы',
    summary: 'Параллелизм, синхронизация и пайплайны.',
    hardPattern: 'go\\s+\\w+\\(|chan\\s+',
  },
  {
    key: 'architecture',
    title: 'Архитектурные задачи',
    summary: 'Комбинированные задания, близкие к реальным API.',
    hardPattern: 'struct|interface|error|go\\s+',
  },
]

function titleFor(category: string, step: number): string {
  return `${category}: шаг ${step}`
}

function summaryFor(categorySummary: string, globalIndex: number): string {
  return `${categorySummary} Задача #${globalIndex}: отработай решение и проверь его в песочнице.`
}

function functionName(categoryKey: string, categoryIndex: number, step: number): string {
  const prefix = categoryKey.replace(/[^a-z]/g, '')
  return `Solve${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}${categoryIndex}${step}`
}

function randomName(id: number): string {
  return exerciseNames[(id - 1) % exerciseNames.length]
}

function difficultyFor(globalIndex: number): PratkorDifficulty {
  if (globalIndex <= 40) {
    return 'easy'
  }
  if (globalIndex <= 75) {
    return 'medium'
  }
  return 'hard'
}

function buildStarterCode(
  categoryKey: string,
  funcName: string,
  difficulty: PratkorDifficulty,
  globalIndex: number
): string {
  if (categoryKey === 'concurrency') {
    return `package main

import "fmt"

func ${funcName}(values []int) int {
	// TODO: запусти горутину(ы), собери результат через канал
	return 0
}

func main() {
	fmt.Println(${funcName}([]int{1, 2, 3, 4}))
}
`
  }

  if (categoryKey === 'interfaces') {
    return `package main

import "fmt"

type Processor interface {
	Process(value int) int
}

func ${funcName}(p Processor, values []int) int {
	// TODO: вызови Process для каждого значения и верни итог
	return 0
}

func main() {
	fmt.Println("implement Processor and run")
}
`
  }

  if (categoryKey === 'structs' || categoryKey === 'architecture') {
    return `package main

import "fmt"

type Item struct {
	Value int
	Label string
}

func ${funcName}(items []Item) int {
	// TODO: реализуй бизнес-логику для структуры Item
	return 0
}

func main() {
	fmt.Println(${funcName}([]Item{{Value: 2, Label: "go"}, {Value: ${globalIndex % 7}, Label: "api"}}))
}
`
  }

  if (categoryKey === 'errors') {
    return `package main

import (
	"errors"
	"fmt"
)

func ${funcName}(value int) (int, error) {
	// TODO: верни ошибку при невалидном значении и корректный результат иначе
	return 0, errors.New("not implemented")
}

func main() {
	result, err := ${funcName}(${globalIndex % 9})
	fmt.Println(result, err)
}
`
  }

  if (difficulty === 'easy') {
    return `package main

import "fmt"

func ${funcName}(value int) int {
	// TODO: верни преобразованное значение
	return value
}

func main() {
	fmt.Println(${funcName}(${globalIndex % 9}))
}
`
  }

  if (difficulty === 'medium') {
    return `package main

import "fmt"

func ${funcName}(values []int) int {
	// TODO: используй цикл и условие
	sum := 0
	for _, value := range values {
		sum += value
	}
	return sum
}

func main() {
	fmt.Println(${funcName}([]int{1, 2, 3, ${globalIndex % 5}}))
}
`
  }

  return `package main

import "fmt"

func ${funcName}(values []int) int {
	// TODO: продвинутая версия с map/switch/комбинацией подходов
	result := 0
	for _, value := range values {
		switch {
		case value%2 == 0:
			result += value
		default:
			result -= value
		}
	}
	return result
}

func main() {
	fmt.Println(${funcName}([]int{2, 5, 8, ${globalIndex % 11}}))
}
`
}

function buildInstructions(
  categoryTitle: string,
  difficulty: PratkorDifficulty,
  funcName: string,
  globalIndex: number
): string[] {
  const common = [
    `Реализуй функцию ${funcName} без изменения ее имени.`,
    'Сохрани читаемость: короткие шаги, понятные переменные, ранний выход при необходимости.',
  ]

  if (difficulty === 'easy') {
    return [
      ...common,
      `Уровень easy. Сфокусируйся на базовой логике категории «${categoryTitle}».`,
      `Добавь минимум одну проверку в коде и верни результат для сценария #${globalIndex}.`,
    ]
  }

  if (difficulty === 'medium') {
    return [
      ...common,
      `Уровень medium. Используй цикл и условие, чтобы обработать данные корректно.`,
      'Покрой граничные случаи: пустой вход, нулевые значения, повторяющиеся элементы.',
    ]
  }

  return [
    ...common,
    `Уровень hard. Скомбинируй несколько конструкций Go и учти edge cases.`,
    'Сделай решение расширяемым: его должно быть легко доработать под новый формат входных данных.',
  ]
}

function requiredPatterns(
  basePattern: string,
  difficulty: PratkorDifficulty,
  funcName: string
): string[] {
  const base = [`func\\s+${funcName}\\s*\\(`]

  if (difficulty === 'easy') {
    return [...base, 'return\\s+']
  }

  if (difficulty === 'medium') {
    return [...base, 'for\\s+', 'if\\s+']
  }

  return [...base, 'for\\s+', basePattern]
}

const exercisesCache: PratkorExercise[] = (() => {
  const list: PratkorExercise[] = []
  let globalIndex = 1

  categorySpecs.forEach((category, categoryIndex) => {
    for (let step = 1; step <= 10; step += 1) {
      const difficulty = difficultyFor(globalIndex)
      const fnName = functionName(category.key, categoryIndex + 1, step)
      const slug = `pratkor-${String(globalIndex).padStart(3, '0')}-${category.key}-${step}`

      list.push({
        id: globalIndex,
        slug,
        title: titleFor(category.title, step),
        summary: summaryFor(category.summary, globalIndex),
        instructions: buildInstructions(category.title, difficulty, fnName, globalIndex),
        category: category.title,
        difficulty,
        starterCode: buildStarterCode(category.key, fnName, difficulty, globalIndex),
        requiredPatterns: requiredPatterns(category.hardPattern, difficulty, fnName),
        displayName: randomName(globalIndex),
        icon: categoryIcons[category.key] || '✨',
      })

      globalIndex += 1
    }
  })

  return list
})()

export function getPratkorExercises(): PratkorExercise[] {
  if (typeof window === 'undefined') {
    return exercisesCache
  }

  const raw = window.localStorage.getItem(PRATKOR_ADMIN_EXERCISES_KEY)
  if (!raw) {
    return exercisesCache
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return exercisesCache
    }

    const isValid = parsed.every((item) =>
      item &&
      typeof item.id === 'number' &&
      typeof item.slug === 'string' &&
      typeof item.title === 'string' &&
      typeof item.summary === 'string' &&
      Array.isArray(item.instructions) &&
      typeof item.category === 'string' &&
      (item.difficulty === 'easy' || item.difficulty === 'medium' || item.difficulty === 'hard') &&
      typeof item.starterCode === 'string' &&
      Array.isArray(item.requiredPatterns) &&
      typeof item.displayName === 'string' &&
      typeof item.icon === 'string'
    )

    return isValid ? (parsed as PratkorExercise[]) : exercisesCache
  } catch {
    return exercisesCache
  }
}

export function getPratkorExerciseBySlug(slug: string): PratkorExercise | undefined {
  return getPratkorExercises().find((item) => item.slug === slug)
}

export function saveAdminPratkorExercises(exercises: PratkorExercise[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PRATKOR_ADMIN_EXERCISES_KEY, JSON.stringify(exercises))
}

export function clearAdminPratkorExercises(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(PRATKOR_ADMIN_EXERCISES_KEY)
}

export function getPratkorProgress(): PratkorProgress {
  if (typeof window === 'undefined') {
    return { completedSlugs: [], drafts: {} }
  }

  const raw = window.localStorage.getItem(PRATKOR_PROGRESS_KEY)
  if (!raw) {
    return { completedSlugs: [], drafts: {} }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PratkorProgress>
    return {
      completedSlugs: Array.isArray(parsed.completedSlugs)
        ? parsed.completedSlugs.filter((item): item is string => typeof item === 'string')
        : [],
      drafts: parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts as Record<string, string> : {},
    }
  } catch {
    return { completedSlugs: [], drafts: {} }
  }
}

export function savePratkorProgress(next: PratkorProgress): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PRATKOR_PROGRESS_KEY, JSON.stringify(next))
}

export function getPratkorStatusMap(
  exercises: PratkorExercise[],
  progress: PratkorProgress
): Record<string, PratkorStatus> {
  const completedSet = new Set(progress.completedSlugs)
  const completedCount = exercises.filter((item) => completedSet.has(item.slug)).length
  const availableThreshold = completedCount + 6

  return exercises.reduce<Record<string, PratkorStatus>>((acc, exercise, index) => {
    if (completedSet.has(exercise.slug)) {
      acc[exercise.slug] = 'completed'
      return acc
    }

    const draft = progress.drafts[exercise.slug]
    if (draft && draft.trim().length > 0 && draft !== exercise.starterCode) {
      acc[exercise.slug] = 'in_progress'
      return acc
    }

    acc[exercise.slug] = index <= availableThreshold ? 'available' : 'locked'
    return acc
  }, {})
}

export function getStatusCount(statusMap: Record<string, PratkorStatus>): Record<PratkorStatus, number> {
  return {
    completed: Object.values(statusMap).filter((status) => status === 'completed').length,
    in_progress: Object.values(statusMap).filter((status) => status === 'in_progress').length,
    available: Object.values(statusMap).filter((status) => status === 'available').length,
    locked: Object.values(statusMap).filter((status) => status === 'locked').length,
  }
}

export function validatePratkorSolution(code: string, exercise: PratkorExercise): boolean {
  const trimmed = code.trim()
  if (!trimmed) {
    return false
  }

  return exercise.requiredPatterns.every((pattern) => new RegExp(pattern, 'im').test(trimmed))
}
