import type { Exercise } from './api'

export type TrainerTaskCheckStatus = 'idle' | 'passed' | 'failed'

export type TrainerPracticeExample = {
  title: string
  code: string
  description?: string
}

export type TrainerPracticeTask = {
  title: string
  description?: string
  placeholder: string
  requiredPatterns: string[]
  forbiddenPatterns?: string[]
}

export type TrainerPracticeLayout = {
  title?: string
  theme?: string
  heroDescription?: string
  firstExample?: {
    title: string
    code: string
    result: string
  }
  shortTheory?: string
  syntax?: string
  implementations?: TrainerPracticeExample[]
  pattern?: string
  taskSectionTitle?: string
  tasks: TrainerPracticeTask[]
}

export type StoredTrainerProgress = {
  answers: string[]
  completed: boolean[]
  statuses: TrainerTaskCheckStatus[]
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function extractFunctionName(starterCode: string): string {
  const match = starterCode.match(/func\s+([A-Za-z0-9_]+)/)
  return match?.[1] || 'Solve'
}

const legacyLayouts: Record<number, TrainerPracticeLayout> = {
  2: {
    title: 'Тренажер 2: Цикл for и слайсы в Go',
    theme: 'Тема: проход по данным и фильтрация значений',
    heroDescription: 'Практика по циклу for, слайсам, фильтрации и подсчету значений.',
    firstExample: {
      title: 'Базовый пример: сумма элементов слайса',
      code: `func Sum(nums []int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}`,
      result: 'Sum([]int{2, 3, 5}) -> 10',
    },
    shortTheory:
      'for — единственный цикл в Go. Для массивов и слайсов чаще всего используют range, который дает индекс и значение.',
    syntax: `for i, value := range collection {
    // действие с value
}`,
    implementations: [
      {
        title: 'Поиск максимума в слайсе',
        code: `func Max(nums []int) int {
    max := nums[0]
    for _, n := range nums {
        if n > max {
            max = n
        }
    }
    return max
}`,
      },
      {
        title: 'Подсчет четных чисел',
        code: `func CountEven(nums []int) int {
    count := 0
    for _, n := range nums {
        if n%2 == 0 {
            count++
        }
    }
    return count
}`,
      },
      {
        title: 'Фильтрация положительных',
        code: `func PositiveOnly(nums []int) []int {
    out := make([]int, 0)
    for _, n := range nums {
        if n > 0 {
            out = append(out, n)
        }
    }
    return out
}`,
      },
    ],
    pattern: `func Solve(items []int) int {
    result := 0
    for _, item := range items {
        if <условие> {
            result = <обновление>
        }
    }
    return result
}`,
    taskSectionTitle: '5 задач для закрепления',
    tasks: [
      {
        title: 'Напиши функцию Average(nums []int) float64, которая возвращает среднее значение.',
        placeholder: `func Average(nums []int) float64 {
    sum := 0
    for _, n := range nums {
        sum += n
    }
    return float64(sum) / float64(len(nums))
}`,
        requiredPatterns: ['func\\s+Average\\s*\\(', 'len\\s*\\(\\s*nums\\s*\\)', 'float64\\s*\\(', 'sum\\s*\\+='],
      },
      {
        title: 'Напиши функцию CountGreater(nums []int, limit int) int — сколько чисел больше limit.',
        placeholder: `func CountGreater(nums []int, limit int) int {
    count := 0
    for _, n := range nums {
        if n > limit {
            count++
        }
    }
    return count
}`,
        requiredPatterns: ['func\\s+CountGreater\\s*\\(', 'for\\s+_,\\s*n\\s*:=\\s*range\\s+nums', 'n\\s*>\\s*limit', 'count\\+\\+|count\\s*\\+=\\s*1'],
      },
      {
        title: 'Напиши функцию ReverseCopy(nums []int) []int — новый слайс в обратном порядке.',
        placeholder: `func ReverseCopy(nums []int) []int {
    result := make([]int, len(nums))
    for i, n := range nums {
        result[len(nums)-1-i] = n
    }
    return result
}`,
        requiredPatterns: ['func\\s+ReverseCopy\\s*\\(', 'make\\s*\\(\\s*\\[\\]int', 'len\\s*\\(\\s*nums\\s*\\)\\s*-\\s*1\\s*-\\s*i'],
      },
      {
        title: 'Напиши функцию HasDuplicate(nums []int) bool — есть ли дубликат в слайсе.',
        placeholder: `func HasDuplicate(nums []int) bool {
    seen := make(map[int]bool)
    for _, n := range nums {
        if seen[n] {
            return true
        }
        seen[n] = true
    }
    return false
}`,
        requiredPatterns: ['func\\s+HasDuplicate\\s*\\(', 'make\\s*\\(\\s*map', 'seen\\s*\\[\\s*n\\s*\\]', 'return\\s+true'],
      },
      {
        title: 'Напиши функцию SumOdd(nums []int) int — сумма только нечетных чисел.',
        placeholder: `func SumOdd(nums []int) int {
    sum := 0
    for _, n := range nums {
        if n%2 != 0 {
            sum += n
        }
    }
    return sum
}`,
        requiredPatterns: ['func\\s+SumOdd\\s*\\(', 'for\\s+_,\\s*n\\s*:=\\s*range\\s+nums', 'n\\s*%\\s*2\\s*!=\\s*0|n\\s*%\\s*2\\s*==\\s*1', 'sum\\s*\\+='],
      },
    ],
  },
}

export function buildTrainerStorageKey(exerciseId: number): string {
  return `trainer-practice-${exerciseId}`
}

export function emptyStoredTrainerProgress(taskCount: number): StoredTrainerProgress {
  return {
    answers: Array.from({ length: taskCount }, () => ''),
    completed: Array.from({ length: taskCount }, () => false),
    statuses: Array.from({ length: taskCount }, () => 'idle'),
  }
}

export function normalizeStoredTrainerProgress(
  value: Partial<StoredTrainerProgress> | null | undefined,
  taskCount: number
): StoredTrainerProgress {
  const empty = emptyStoredTrainerProgress(taskCount)
  if (!value) {
    return empty
  }

  return {
    answers: Array.from({ length: taskCount }, (_, index) => value.answers?.[index] || ''),
    completed: Array.from({ length: taskCount }, (_, index) => Boolean(value.completed?.[index])),
    statuses: Array.from({ length: taskCount }, (_, index) => {
      const status = value.statuses?.[index]
      return status === 'passed' || status === 'failed' ? status : 'idle'
    }),
  }
}

export function readStoredTrainerProgress(raw: string | undefined, taskCount: number): StoredTrainerProgress {
  if (!raw) {
    return emptyStoredTrainerProgress(taskCount)
  }

  return normalizeStoredTrainerProgress(parseJson<StoredTrainerProgress | null>(raw, null), taskCount)
}

export function buildDefaultTrainerLayout(exercise: Exercise): TrainerPracticeLayout {
  const functionName = extractFunctionName(exercise.starterCode)
  const hints = parseJson<string[]>(exercise.hints || '[]', [])

  return {
    title: exercise.title,
    theme: `${exercise.category} • ${exercise.difficulty}`,
    heroDescription: exercise.description || 'Практика с автопроверкой и mini-задачами по Go.',
    firstExample: {
      title: 'Стартовая функция',
      code: exercise.starterCode,
      result: 'Сначала реши mini-задачи, затем проверь полное решение в редакторе.',
    },
    shortTheory: hints[0] || 'Разбей решение на короткие шаги: имя функции, цикл/условие, возврат результата.',
    syntax: exercise.starterCode,
    implementations: hints.map((hint, index) => ({
      title: `Подсказка ${index + 1}`,
      code: `// ${hint}`,
    })),
    pattern: `func ${functionName}(...) {
    // logic
    return result
}`,
    taskSectionTitle: 'Mini-задача по функции',
    tasks: [
      {
        title: exercise.description || `Реализуй функцию ${functionName}.`,
        description: 'Можно вставить функцию целиком или ключевой фрагмент решения.',
        placeholder: exercise.starterCode,
        requiredPatterns: [`func\\s+${functionName}\\s*\\(`],
      },
    ],
  }
}

export function parseTrainerLayout(exercise: Exercise): TrainerPracticeLayout {
  const fallback = legacyLayouts[exercise.id] || buildDefaultTrainerLayout(exercise)
  if (!exercise.trainerLayout?.trim()) {
    return fallback
  }

  const parsed = parseJson<Partial<TrainerPracticeLayout> | null>(exercise.trainerLayout, null)
  if (!parsed) {
    return fallback
  }

  return {
    ...fallback,
    ...parsed,
    firstExample: parsed.firstExample || fallback.firstExample,
    implementations: parsed.implementations?.length ? parsed.implementations : fallback.implementations,
    tasks: parsed.tasks?.length ? parsed.tasks : fallback.tasks,
  }
}

export function validateTrainerTaskAnswer(answer: string, task: TrainerPracticeTask): boolean {
  const trimmed = answer.trim()
  if (!trimmed) {
    return false
  }

  const requiredOk = task.requiredPatterns.every((pattern) => new RegExp(pattern, 'im').test(trimmed))
  const forbiddenOk = (task.forbiddenPatterns || []).every((pattern) => !new RegExp(pattern, 'im').test(trimmed))
  return requiredOk && forbiddenOk
}