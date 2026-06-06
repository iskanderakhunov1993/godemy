import { Exercise } from './api'

export const JUNIOR_SPRINTS = [1, 2, 3, 4, 5] as const
export const TASKS_PER_SPRINT = 2

export function getSprintNumber(category: string): number {
  const match = category.match(/Sprint\s+(\d+)/i)
  if (!match) return 1
  const n = Number(match[1])
  if (Number.isNaN(n) || n < 1) return 1
  return n
}

export function sortByOrder(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => a.order - b.order)
}

export function getNextUnlockedExerciseId(
  exercises: Exercise[],
  isCompleted: (entityType: string, entityId: number) => boolean
): number | null {
  const ordered = sortByOrder(exercises)

  for (const exercise of ordered) {
    if (!isCompleted('exercise', exercise.id)) {
      return exercise.id
    }
  }

  return ordered[0]?.id ?? null
}

export function isExerciseUnlocked(
  exerciseId: number,
  exercises: Exercise[],
  isCompleted: (entityType: string, entityId: number) => boolean
): boolean {
  const nextUnlockedId = getNextUnlockedExerciseId(exercises, isCompleted)
  if (nextUnlockedId === null) {
    return false
  }

  return exerciseId === nextUnlockedId || isCompleted('exercise', exerciseId)
}

export function buildSprintMap(
  exercises: Exercise[],
  isCompleted: (entityType: string, entityId: number) => boolean
): Record<number, { total: number; completed: number; items: Exercise[] }> {
  const map: Record<number, { total: number; completed: number; items: Exercise[] }> = {}

  for (const sprint of JUNIOR_SPRINTS) {
    map[sprint] = { total: 0, completed: 0, items: [] }
  }

  for (const ex of sortByOrder(exercises)) {
    const sprint = getSprintNumber(ex.category)
    if (!map[sprint]) {
      map[sprint] = { total: 0, completed: 0, items: [] }
    }
    map[sprint].items.push(ex)
    map[sprint].total += 1
    if (isCompleted('exercise', ex.id)) {
      map[sprint].completed += 1
    }
  }

  return map
}

export function isSprintUnlocked(
  sprint: number,
  sprintMap: Record<number, { total: number; completed: number; items: Exercise[] }>,
  hasAuth: boolean
): boolean {
  if (sprint <= 1) return true
  if (!hasAuth) return false

  for (let prev = 1; prev < sprint; prev++) {
    const block = sprintMap[prev]
    if (!block) return false
    if (block.total === 0) return false
    if (block.completed < block.total) return false
  }

  return true
}

export function canValidateCapstone(
  sprintMap: Record<number, { total: number; completed: number; items: Exercise[] }>
): boolean {
  return JUNIOR_SPRINTS.every((s) => {
    const block = sprintMap[s]
    return !!block && block.total > 0 && block.completed === block.total
  })
}
