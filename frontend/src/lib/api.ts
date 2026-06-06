function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || ''
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : ''
const BACKEND_URL = trimTrailingSlash(envBackendUrl || browserOrigin)
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 10000)

export interface User {
  id: number
  email: string
  username: string
  fullName?: string
  isPremium: boolean
  premiumUntil?: string
  createdAt: string
}

export interface Lesson {
  id: number
  level: string
  module: string
  slug: string
  title: string
  description: string
  content: string
  order: number
  category: string
}

export interface Exercise {
  id: number
  level: string
  module: string
  trainerTopicId?: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  starterCode: string
  trainerLayout: string
  hints: string
  order: number
}

export interface TopicExample {
  title: string
  code: string
  description: string
}

export interface TrainerTopic {
  id: number
  module: string
  title: string
  slug: string
  syntax: string
  explanation: string
  examples: string  // JSON: TopicExample[]
  patterns: string
  order: number
  exercises?: Exercise[]
}

export interface Progress {
  id: number
  entityType: 'lesson' | 'exercise' | 'exercise_tasks'
  entityId: number
  status: 'started' | 'completed'
  payload?: string
  createdAt: string
  updatedAt: string
}

export interface UserSkill {
  id: number
  name: string
  category: string
  icon: string
  proficiency: number
}

export interface UserCourseProgress {
  module: string
  title: string
  progress: number
  completed: boolean
  lessonsDone: number
  totalLessons: number
}

export interface UserProfile {
  user: {
    id: number
    email: string
    username: string
    fullName?: string
    isPremium: boolean
  }
  juniorReadiness: number
  personaType: 'newbie' | 'junior' | 'mid' | 'senior' | 'neo'
  skills: UserSkill[]
  courseProgress: UserCourseProgress[]
  completedSprints: number
  totalLessonsCount: number
  completedLessons: number
}

export interface RunResult {
  output: string
  error: string
  passed: boolean
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const apiBaseForMessage = BACKEND_URL || '(same-origin)'

  try {
    const res = await fetch(`${BACKEND_URL}${normalizedPath}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...options?.headers,
      },
      ...options,
      signal: options?.signal || controller.signal,
    })

    const text = await res.text()
    let data: unknown = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { error: text }
      }
    }

    if (!res.ok) {
      const message =
        typeof data === 'object' && data !== null && 'error' in data
          ? String((data as { error: unknown }).error)
          : `Request failed with status ${res.status}`
      throw new Error(message)
    }

    return data as T
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        `Request timeout after ${REQUEST_TIMEOUT_MS}ms. Check backend availability at ${apiBaseForMessage}.`
      )
    }

    if (error instanceof TypeError) {
      const text = error.message.toLowerCase()
      if (
        text.includes('failed to fetch') ||
        text.includes('load failed') ||
        text.includes('networkerror')
      ) {
        throw new Error(
          `Network error: API is unreachable at ${apiBaseForMessage}. Check NEXT_PUBLIC_BACKEND_URL and backend CORS_ALLOWED_ORIGINS.`
        )
      }
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  // Auth
  register: (email: string, username: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request<{ ok: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ ok: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  me: () => request<User>('/api/auth/me'),
  updateMe: (data: { fullName: string }) =>
    request<User>('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Content
  getLessons: (params?: { module?: string }) => {
    const q = new URLSearchParams()
    if (params?.module) q.set('module', params.module)
    const query = q.toString()
    return request<Lesson[]>(`/api/lessons${query ? `?${query}` : ''}`)
  },
  getLesson: (slug: string, params?: { module?: string }) => {
    const q = new URLSearchParams()
    if (params?.module) q.set('module', params.module)
    const query = q.toString()
    return request<Lesson>(`/api/lessons/${slug}${query ? `?${query}` : ''}`)
  },
  getExercises: (params?: { module?: string; category?: string; difficulty?: string }) => {
    const q = new URLSearchParams()
    if (params?.module) q.set('module', params.module)
    if (params?.category) q.set('category', params.category)
    if (params?.difficulty) q.set('difficulty', params.difficulty)
    return request<Exercise[]>(`/api/exercises?${q}`)
  },
  getExercise: (id: number) => request<Exercise>(`/api/exercises/${id}`),

  // Trainer topics
  getTrainerTopics: (module = 'core') =>
    request<TrainerTopic[]>(`/api/trainer/topics?module=${module}`),
  getTrainerTopic: (slug: string) =>
    request<TrainerTopic>(`/api/trainer/topics/${slug}`),

  // Runner
  runCode: (code: string) =>
    request<RunResult>('/api/run', { method: 'POST', body: JSON.stringify({ code }) }),

  submitExercise: (code: string, exerciseId: number) =>
    request<RunResult>('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ code, exerciseId }),
    }),

  // OAuth
  yandexExchange: (code: string) =>
    request<{ token: string; user: User }>('/api/auth/yandex', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  // Progress
  getProgress: () => request<Progress[]>('/api/progress'),
  getUserProfile: () => request<UserProfile>('/api/user/profile'),
  updateProgress: (entityType: string, entityId: number, status: string, payload = '') =>
    request<Progress>('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, status, payload }),
    }),
}

function adminHeaders(secret: string): HeadersInit {
  return { 'X-Admin-Secret': secret, 'Content-Type': 'application/json' }
}

export interface AdminLesson {
  id: number
  level: string
  module: string
  slug: string
  title: string
  description: string
  content: string
  order: number
  category: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminExercise {
  id: number
  level: string
  module: string
  trainerTopicId?: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  starterCode: string
  trainerLayout: string
  solutionCode: string
  testCode: string
  hints: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface AdminTrainerTopic {
  id: number
  module: string
  title: string
  slug: string
  syntax: string
  explanation: string
  examples: string   // JSON строка: [{title,code,description}]
  patterns: string
  order: number
  createdAt?: string
  updatedAt?: string
}

export interface AdminCourseModule {
  name: string
  lessonsCount: number
  exercisesCount: number
}

export interface AdminLevel {
  id: number
  title: string
  slug: string
  order: number
  description?: string
}

export const adminApi = {
  // Lessons
  getLessons: (secret: string) =>
    request<AdminLesson[]>('/api/admin/lessons', { headers: adminHeaders(secret) }),

  getLesson: (secret: string, id: number) =>
    request<AdminLesson>(`/api/admin/lessons/${id}`, { headers: adminHeaders(secret) }),

  createLesson: (secret: string, data: Omit<AdminLesson, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<AdminLesson>('/api/admin/lessons', {
      method: 'POST',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),

  updateLesson: (secret: string, id: number, data: Partial<AdminLesson>) =>
    request<AdminLesson>(`/api/admin/lessons/${id}`, {
      method: 'PUT',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),

  deleteLesson: (secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/lessons/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(secret),
    }),

  // Exercises
  getExercises: (secret: string) =>
    request<AdminExercise[]>('/api/admin/exercises', { headers: adminHeaders(secret) }),

  getExercise: (secret: string, id: number) =>
    request<AdminExercise>(`/api/admin/exercises/${id}`, { headers: adminHeaders(secret) }),

  createExercise: (secret: string, data: Omit<AdminExercise, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<AdminExercise>('/api/admin/exercises', {
      method: 'POST',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),

  updateExercise: (secret: string, id: number, data: Partial<AdminExercise>) =>
    request<AdminExercise>(`/api/admin/exercises/${id}`, {
      method: 'PUT',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),

  deleteExercise: (secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/exercises/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(secret),
    }),

  // TrainerTopics
  getTrainerTopics: (secret: string, module?: string) => {
    const q = module ? `?module=${module}` : ''
    return request<AdminTrainerTopic[]>(`/api/admin/trainer-topics${q}`, { headers: adminHeaders(secret) })
  },
  getTrainerTopic: (secret: string, id: number) =>
    request<AdminTrainerTopic>(`/api/admin/trainer-topics/${id}`, { headers: adminHeaders(secret) }),
  createTrainerTopic: (secret: string, data: Omit<AdminTrainerTopic, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<AdminTrainerTopic>('/api/admin/trainer-topics', {
      method: 'POST',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),
  updateTrainerTopic: (secret: string, id: number, data: Partial<AdminTrainerTopic>) =>
    request<AdminTrainerTopic>(`/api/admin/trainer-topics/${id}`, {
      method: 'PUT',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),
  deleteTrainerTopic: (secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/trainer-topics/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(secret),
    }),

  // Modules
  getModules: (secret: string) =>
    request<AdminCourseModule[]>('/api/admin/modules', { headers: adminHeaders(secret) }),

  createModule: (
    secret: string,
    data: { name: string; level?: string; category?: string; firstLessonTitle: string }
  ) =>
    request<AdminLesson>('/api/admin/modules', {
      method: 'POST',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),

  renameModule: (secret: string, oldName: string, newName: string) =>
    request<{ ok: boolean }>(`/api/admin/modules/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      headers: adminHeaders(secret),
      body: JSON.stringify({ newName }),
    }),

  deleteModule: (secret: string, name: string) =>
    request<{ ok: boolean }>(`/api/admin/modules/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: adminHeaders(secret),
    }),

  moveModule: (secret: string, name: string, newLevel: string) =>
    request<{ ok: boolean }>(`/api/admin/modules/${encodeURIComponent(name)}/move`, {
      method: 'PUT',
      headers: adminHeaders(secret),
      body: JSON.stringify({ newLevel }),
    }),

  // Levels
  getLevels: (secret: string) =>
    request<AdminLevel[]>('/api/admin/levels', { headers: adminHeaders(secret) }),

  createLevel: (secret: string, data: { title: string; slug?: string; order?: number }) =>
    request<AdminLevel>('/api/admin/levels', {
      method: 'POST',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),

  updateLevel: (secret: string, id: number, data: { title?: string; slug?: string; order: number }) =>
    request<AdminLevel>(`/api/admin/levels/${id}`, {
      method: 'PUT',
      headers: adminHeaders(secret),
      body: JSON.stringify(data),
    }),

  deleteLevel: (secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/levels/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(secret),
    }),

  uploadImage: async (secret: string, file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${BACKEND_URL}/api/admin/upload`, {
      method: 'POST',
      headers: { 'X-Admin-Secret': secret },
      body: formData,
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json() as { url: string }
    if (/^https?:\/\//i.test(data.url)) return data.url
    if (data.url.startsWith('/')) return `${BACKEND_URL}${data.url}`
    return `${BACKEND_URL}/${data.url}`
  },
}

export const getLevels = () => request<AdminLevel[]>('/api/levels')
