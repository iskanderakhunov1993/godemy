'use client'

import { useEffect, useMemo, useState } from 'react'
import { adminApi, AdminUser } from '@/lib/api'

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDateInput(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function activityLabel(type: string) {
  if (type === 'lesson') return 'Урок'
  if (type === 'exercise') return 'Задача'
  if (type === 'exercise_tasks') return 'Блок задач'
  return type
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    emailVerified: false,
    adminDescription: '',
    isPremium: false,
    premiumUntil: '',
    juniorReadiness: 0,
  })

  useEffect(() => {
    adminApi
      .getUsers()
      .then((loaded) => {
        setUsers(loaded)
        if (loaded.length > 0) setSelectedId(loaded[0].id)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    Promise.resolve()
      .then(() => {
        setDetailsLoading(true)
        setMessage('')
        return adminApi.getUser(selectedId)
      })
      .then((user) => {
        setSelectedUser(user)
        setForm({
          fullName: user.fullName || '',
          emailVerified: user.emailVerified,
          adminDescription: user.adminDescription || '',
          isPremium: user.isPremium,
          premiumUntil: formatDateInput(user.premiumUntil),
          juniorReadiness: user.juniorReadiness,
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setDetailsLoading(false))
  }, [selectedId])

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return users
    return users.filter((user) =>
      [user.email, user.username, user.fullName, String(user.id)]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    )
  }, [query, users])

  const stats = useMemo(() => {
    const subscriptions = users.filter((user) => user.plan === 'subscription').length
    const verified = users.filter((user) => user.emailVerified).length
    const withCertificates = users.filter((user) => user.hasCertificate).length
    return { subscriptions, verified, withCertificates }
  }, [users])

  const saveUser = async () => {
    if (!selectedUser) return
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const updated = await adminApi.updateUser(selectedUser.id, {
        fullName: form.fullName,
        emailVerified: form.emailVerified,
        adminDescription: form.adminDescription,
        isPremium: form.isPremium,
        premiumUntil: form.isPremium ? form.premiumUntil || null : null,
        juniorReadiness: form.juniorReadiness,
      })
      setSelectedUser(updated)
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)))
      setMessage('Пользователь сохранён')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить пользователя')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">Загрузка пользователей...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Пользователи</h1>
        <p className="mt-2 text-sm text-gray-400">
          Профили, тарифы, заметки администратора, сертификаты и активность пользователей.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs uppercase text-gray-500">Всего</p>
          <p className="mt-2 text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs uppercase text-gray-500">Подписка</p>
          <p className="mt-2 text-2xl font-bold text-violet-300">{stats.subscriptions}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs uppercase text-gray-500">Почта актуальна</p>
          <p className="mt-2 text-2xl font-bold text-cyan-300">{stats.verified}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs uppercase text-gray-500">С сертификатом</p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{stats.withCertificates}</p>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">Ошибка: {error}</div>}
      {message && <div className="rounded-lg border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-300">{message}</div>}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="border-b border-gray-800 p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по id, email, имени"
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            />
          </div>
          <div className="max-h-[680px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedId(user.id)}
                className={`w-full border-b border-gray-800 p-4 text-left transition-colors ${
                  selectedId === user.id ? 'bg-cyan-950/40' : 'hover:bg-gray-800/70'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-white">{user.email}</p>
                  <span className="shrink-0 rounded-full bg-gray-950 px-2 py-1 text-xs text-gray-400">id {user.id}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={user.plan === 'subscription' ? 'text-violet-300' : 'text-gray-400'}>
                    {user.plan === 'subscription' ? 'Подписка' : 'Базовый'}
                  </span>
                  <span className={user.emailVerified ? 'text-cyan-300' : 'text-gray-500'}>
                    {user.emailVerified ? 'email актуален' : 'email не отмечен'}
                  </span>
                  <span className={user.hasCertificate ? 'text-emerald-300' : 'text-gray-500'}>
                    {user.certificatesEarned} сертификатов
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">Последняя активность: {formatDate(user.lastActivityAt)}</p>
              </button>
            ))}
            {filteredUsers.length === 0 && <div className="p-4 text-sm text-gray-500">Ничего не найдено</div>}
          </div>
        </aside>

        <section className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          {detailsLoading && <div className="text-gray-400">Загрузка карточки...</div>}
          {!detailsLoading && selectedUser && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUser.email}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    id {selectedUser.id} · @{selectedUser.username} · регистрация {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={saveUser}
                  disabled={saving}
                  className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <p className="text-xs uppercase text-gray-500">Тариф</p>
                  <p className="mt-2 font-semibold text-white">{selectedUser.plan === 'subscription' ? 'Подписка' : 'Базовый'}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <p className="text-xs uppercase text-gray-500">Прогресс</p>
                  <p className="mt-2 font-semibold text-white">{selectedUser.completedTotal} / {selectedUser.progressTotal}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <p className="text-xs uppercase text-gray-500">Сертификаты</p>
                  <p className="mt-2 font-semibold text-white">{selectedUser.certificatesEarned}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <p className="text-xs uppercase text-gray-500">Активность</p>
                  <p className="mt-2 font-semibold text-white">{formatDate(selectedUser.lastActivityAt)}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-gray-400">ФИО</span>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
                    className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Готовность Junior, %</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.juniorReadiness}
                    onChange={(e) => setForm((current) => ({ ...current, juniorReadiness: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <input
                    type="checkbox"
                    checked={form.emailVerified}
                    onChange={(e) => setForm((current) => ({ ...current, emailVerified: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-200">Почта актуальная</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <input
                    type="checkbox"
                    checked={form.isPremium}
                    onChange={(e) => setForm((current) => ({ ...current, isPremium: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-200">Подписка активна</span>
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-gray-400">Подписка до</span>
                <input
                  type="date"
                  value={form.premiumUntil}
                  onChange={(e) => setForm((current) => ({ ...current, premiumUntil: e.target.value }))}
                  disabled={!form.isPremium}
                  className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-cyan-500 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-400">Описание пользователя</span>
                <textarea
                  value={form.adminDescription}
                  onChange={(e) => setForm((current) => ({ ...current, adminDescription: e.target.value }))}
                  rows={5}
                  placeholder="Например: интересуется backend, просил созвон, оплату проверили вручную"
                  className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </label>

              <div>
                <h3 className="text-lg font-semibold text-white">Последняя активность</h3>
                <div className="mt-3 overflow-hidden rounded-lg border border-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-950 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-2">Тип</th>
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Статус</th>
                        <th className="px-3 py-2">Дата</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {(selectedUser.recentActivity ?? []).map((activity) => (
                        <tr key={activity.id} className="text-gray-300">
                          <td className="px-3 py-2">{activityLabel(activity.entityType)}</td>
                          <td className="px-3 py-2">{activity.entityId}</td>
                          <td className="px-3 py-2">{activity.status === 'completed' ? 'Завершено' : 'Начато'}</td>
                          <td className="px-3 py-2">{formatDate(activity.updatedAt)}</td>
                        </tr>
                      ))}
                      {(selectedUser.recentActivity ?? []).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-5 text-center text-gray-500">Активности пока нет</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
