function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

const envBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || ''
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : ''

function getCanonicalOrigin(origin: string): string {
  try {
    const parsed = new URL(origin)
    if (!parsed.hostname.startsWith('www.')) return ''
    parsed.hostname = parsed.hostname.slice(4)
    return parsed.origin
  } catch {
    return ''
  }
}

function getBackendUrlCandidates(): string[] {
  // Production serves the API through nginx on the same origin. Prefer it so a
  // stale or invalid public env value cannot break auth and other core flows.
  const candidates = [browserOrigin, getCanonicalOrigin(browserOrigin), envBackendUrl]
    .map(trimTrailingSlash)
    .filter(Boolean)

  return Array.from(new Set(candidates))
}

const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 45000)

export interface User {
  id: number
  email: string
  username: string
  fullName?: string
  isPremium: boolean
  isAdmin: boolean
  emailVerified: boolean
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

export interface CertificateStatus {
  id: 'course' | 'trainer' | 'bootcamp'
  title: string
  subtitle: string
  courseName: string
  description: string
  earned: boolean
  progress: number
  total: number
  earnedAt?: string
  certificateNumber?: string
  previewAllowed: boolean
  downloadAllowed: boolean
  emailAllowed: boolean
  requiresPremium: boolean
  fullNameRequired: boolean
  lockedReason?: string
  ctaLabel: string
  ctaHref: string
}

export interface UserProfile {
  user: {
    id: number
    email: string
    username: string
    fullName?: string
    isPremium: boolean
    isAdmin: boolean
  }
  juniorReadiness: number
  personaType: 'newbie' | 'junior' | 'mid' | 'senior' | 'neo'
  skills: UserSkill[]
  courseProgress: UserCourseProgress[]
  completedSprints: number
  totalLessonsCount: number
  completedLessons: number
  certificates: CertificateStatus[]
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
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const baseCandidates = getBackendUrlCandidates()

  let lastError: unknown = null

  for (let i = 0; i < baseCandidates.length; i += 1) {
    const baseUrl = baseCandidates[i]
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(`${baseUrl}${normalizedPath}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
          ...options?.headers,
        },
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

        const shouldFallback =
          (res.status === 404 || res.status === 405) && i < baseCandidates.length - 1

        if (shouldFallback) {
          lastError = new Error(message)
          continue
        }

        throw new Error(message)
      }

      return data as T
    } catch (error) {
      lastError = error

      if (error instanceof Error && error.name === 'AbortError') {
        if (i < baseCandidates.length - 1) {
          continue
        }
        throw new Error('Сервер отвечает слишком долго. Попробуй ещё раз через несколько секунд.')
      }

      if (error instanceof TypeError) {
        const text = error.message.toLowerCase()
        if (
          text.includes('failed to fetch') ||
          text.includes('load failed') ||
          text.includes('networkerror')
        ) {
          if (i < baseCandidates.length - 1) {
            continue
          }
          throw new Error('Не удалось связаться с сервером. Попробуй ещё раз через несколько секунд.')
        }
      }

      if (i < baseCandidates.length - 1) {
        continue
      }

      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }
  throw new Error('Не удалось связаться с сервером. Попробуй ещё раз через несколько секунд.')
}

export function getBackendBaseUrl(): string {
  const candidates = getBackendUrlCandidates()
  return candidates[0] || trimTrailingSlash(browserOrigin || envBackendUrl)
}

export const api = {
  // Auth
  register: (email: string, username: string, password: string) =>
    request<{ ok: boolean; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (token: string) =>
    request<{ ok: boolean; message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email: string) =>
    request<{ ok: boolean; message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
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

  googleExchange: (code: string) =>
    request<{ token: string; user: User }>('/api/auth/google', {
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
  emailCertificate: (type: CertificateStatus['id']) =>
    request<{ ok: boolean; message: string }>(`/api/certificates/${type}/email`, {
      method: 'POST',
    }),
}

function adminHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...authHeaders(),
  }
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

export interface AdminUserActivity {
  id: number
  entityType: 'lesson' | 'exercise' | 'exercise_tasks'
  entityId: number
  status: 'started' | 'completed'
  payload?: string
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: number
  email: string
  username: string
  fullName: string
  isPremium: boolean
  isAdmin: boolean
  emailVerified: boolean
  adminDescription: string
  premiumUntil?: string | null
  juniorReadiness: number
  createdAt: string
  updatedAt: string
  plan: 'basic' | 'subscription'
  progressTotal: number
  completedTotal: number
  hasCertificate: boolean
  certificatesEarned: number
  lastActivityAt?: string | null
  recentActivity?: AdminUserActivity[]
}

export const adminApi = {
  // Users
  getUsers: () =>
    request<AdminUser[]>('/api/admin/users', { headers: adminHeaders() }),

  getUser: (id: number) =>
    request<AdminUser>(`/api/admin/users/${id}`, { headers: adminHeaders() }),

  updateUser: (
    id: number,
    data: Partial<Pick<AdminUser, 'fullName' | 'emailVerified' | 'adminDescription' | 'isPremium' | 'premiumUntil' | 'juniorReadiness'>>
  ) =>
    request<AdminUser>(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  // Lessons
  getLessons: (secret = '') => {
    void secret
    return request<AdminLesson[]>('/api/admin/lessons', { headers: adminHeaders() })
  },

  getLesson: (_secret: string, id: number) =>
    request<AdminLesson>(`/api/admin/lessons/${id}`, { headers: adminHeaders() }),

  createLesson: (_secret: string, data: Omit<AdminLesson, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<AdminLesson>('/api/admin/lessons', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  updateLesson: (_secret: string, id: number, data: Partial<AdminLesson>) =>
    request<AdminLesson>(`/api/admin/lessons/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  deleteLesson: (_secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/lessons/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }),

  // Exercises
  getExercises: (secret = '') => {
    void secret
    return request<AdminExercise[]>('/api/admin/exercises', { headers: adminHeaders() })
  },

  getExercise: (_secret: string, id: number) =>
    request<AdminExercise>(`/api/admin/exercises/${id}`, { headers: adminHeaders() }),

  createExercise: (_secret: string, data: Omit<AdminExercise, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<AdminExercise>('/api/admin/exercises', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  updateExercise: (_secret: string, id: number, data: Partial<AdminExercise>) =>
    request<AdminExercise>(`/api/admin/exercises/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  deleteExercise: (_secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/exercises/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }),

  // TrainerTopics
  getTrainerTopics: (_secret: string, module?: string) => {
    const q = module ? `?module=${module}` : ''
    return request<AdminTrainerTopic[]>(`/api/admin/trainer-topics${q}`, { headers: adminHeaders() })
  },
  getTrainerTopic: (_secret: string, id: number) =>
    request<AdminTrainerTopic>(`/api/admin/trainer-topics/${id}`, { headers: adminHeaders() }),
  createTrainerTopic: (_secret: string, data: Omit<AdminTrainerTopic, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<AdminTrainerTopic>('/api/admin/trainer-topics', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),
  updateTrainerTopic: (_secret: string, id: number, data: Partial<AdminTrainerTopic>) =>
    request<AdminTrainerTopic>(`/api/admin/trainer-topics/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),
  deleteTrainerTopic: (_secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/trainer-topics/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }),

  // Modules
  getModules: (secret = '') => {
    void secret
    return request<AdminCourseModule[]>('/api/admin/modules', { headers: adminHeaders() })
  },

  createModule: (
    _secret: string,
    data: { name: string; level?: string; category?: string; firstLessonTitle: string }
  ) =>
    request<AdminLesson>('/api/admin/modules', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  renameModule: (_secret: string, oldName: string, newName: string) =>
    request<{ ok: boolean }>(`/api/admin/modules/${encodeURIComponent(oldName)}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ newName }),
    }),

  deleteModule: (_secret: string, name: string) =>
    request<{ ok: boolean }>(`/api/admin/modules/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }),

  moveModule: (_secret: string, name: string, newLevel: string) =>
    request<{ ok: boolean }>(`/api/admin/modules/${encodeURIComponent(name)}/move`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ newLevel }),
    }),

  // Levels
  getLevels: (secret = '') => {
    void secret
    return request<AdminLevel[]>('/api/admin/levels', { headers: adminHeaders() })
  },

  createLevel: (_secret: string, data: { title: string; slug?: string; order?: number; description?: string }) =>
    request<AdminLevel>('/api/admin/levels', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  updateLevel: (_secret: string, id: number, data: { title?: string; slug?: string; order: number; description?: string }) =>
    request<AdminLevel>(`/api/admin/levels/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(data),
    }),

  deleteLevel: (_secret: string, id: number) =>
    request<{ ok: boolean }>(`/api/admin/levels/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }),

  uploadImage: async (_secret: string, file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const backendUrl = getBackendBaseUrl()
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await fetch(`${backendUrl}/api/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json() as { url: string }
    if (/^https?:\/\//i.test(data.url)) return data.url
    if (data.url.startsWith('/')) return `${backendUrl}${data.url}`
    return `${backendUrl}/${data.url}`
  },
}

export const getLevels = () => request<AdminLevel[]>('/api/levels')
