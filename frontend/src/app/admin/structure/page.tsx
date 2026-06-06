"use client"

import React, { useEffect, useMemo, useState } from "react"
import { adminApi, AdminLesson, AdminLevel } from "@/lib/api"
import LessonEditor from "@/components/LessonEditor"

type TopicGroup = {
  name: string
  lessons: AdminLesson[]
}

type ModuleGroup = {
  name: string
  level: string
  topics: TopicGroup[]
  firstOrder: number
}

export type AdminEditorMode = "course" | "bootcamp"

function moveByIndex<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

function slugPart(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildLessonSlug(level: string, moduleName: string, topicName: string, title: string, order: number): string {
  const pieces = [level, moduleName, topicName, title].map(slugPart).filter(Boolean)
  const base = pieces.length > 0 ? pieces.join("-") : "lesson"
  return `${base}-${order}`
}

function buildModules(lessons: AdminLesson[]): ModuleGroup[] {
  const modMap = new Map<string, Map<string, AdminLesson[]>>()

  for (const lesson of lessons) {
    const modKey = `${lesson.level}::${lesson.module}`
    if (!modMap.has(modKey)) modMap.set(modKey, new Map())
    const topicName = lesson.category || "Основы"
    const topicMap = modMap.get(modKey)!
    if (!topicMap.has(topicName)) topicMap.set(topicName, [])
    topicMap.get(topicName)!.push(lesson)
  }

  const modules: ModuleGroup[] = []
  for (const [modKey, topicMap] of modMap) {
    const sepIdx = modKey.indexOf("::")
    const level = modKey.slice(0, sepIdx)
    const name = modKey.slice(sepIdx + 2)
    const topics: TopicGroup[] = []
    for (const [topicName, topicLessons] of topicMap) {
      topicLessons.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      topics.push({ name: topicName, lessons: topicLessons })
    }
    topics.sort((a, b) => (a.lessons[0]?.order ?? 0) - (b.lessons[0]?.order ?? 0))
    const firstOrder = topics.reduce((min, topic) => {
      const topicFirstOrder = topic.lessons[0]?.order ?? Number.MAX_SAFE_INTEGER
      return Math.min(min, topicFirstOrder)
    }, Number.MAX_SAFE_INTEGER)
    modules.push({ name, level, topics, firstOrder })
  }

  // Keep module ordering consistent with production pages where modules are
  // derived from lessons ordered by lesson.order.
  modules.sort((a, b) => {
    if (a.level !== b.level) return a.level.localeCompare(b.level)
    if (a.firstOrder !== b.firstOrder) return a.firstOrder - b.firstOrder
    return a.name.localeCompare(b.name)
  })
  return modules
}

function lessonsByMode(lessons: AdminLesson[], mode: AdminEditorMode): AdminLesson[] {
  if (mode === "bootcamp") {
    return lessons.filter((lesson) => lesson.module === "bootcamp")
  }
  return lessons.filter(
    (lesson) => lesson.module !== "core" && lesson.module !== "junior" && lesson.module !== "bootcamp"
  )
}

function levelsByMode(levels: AdminLevel[], lessons: AdminLesson[], mode: AdminEditorMode): AdminLevel[] {
  if (mode === "bootcamp") {
    const lessonLevelSlugs = new Set(lessons.map((lesson) => lesson.level))
    return levels.filter((level) => lessonLevelSlugs.has(level.slug) || level.slug.startsWith("bootcamp-"))
  }

  return levels.filter((level) => !level.slug.startsWith("bootcamp-"))
}

export function AdminStructureEditor({ mode = "course" }: { mode?: AdminEditorMode }) {
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [modules, setModules] = useState<ModuleGroup[]>([])
  const [levels, setLevels] = useState<AdminLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [newLessonByTopic, setNewLessonByTopic] = useState<Record<string, string>>({})
  const [editingTopicKey, setEditingTopicKey] = useState<string | null>(null)
  const [editingTopicValue, setEditingTopicValue] = useState("")
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [editingLessonTitle, setEditingLessonTitle] = useState("")
  const [openedLessonId, setOpenedLessonId] = useState<number | null>(null)
  const [openedLessonTitle, setOpenedLessonTitle] = useState("")
  const [openedLessonContent, setOpenedLessonContent] = useState("")
  const [editingModuleName, setEditingModuleName] = useState<string | null>(null)
  const [editingModuleValue, setEditingModuleValue] = useState("")
  // Level management state
  const [editingLevelId, setEditingLevelId] = useState<number | null>(null)
  const [editingLevelTitle, setEditingLevelTitle] = useState("")
  const [newLevelTitle, setNewLevelTitle] = useState("")
  const [newLevelSlug, setNewLevelSlug] = useState("")
  const [showNewLevelForm, setShowNewLevelForm] = useState(false)
  // Move module state
  const [movingModule, setMovingModule] = useState<string | null>(null)
  const [moveTargetLevel, setMoveTargetLevel] = useState("")
  const [draggingModule, setDraggingModule] = useState<{ level: string; moduleName: string } | null>(null)
  const [draggingTopic, setDraggingTopic] = useState<{
    level: string
    moduleName: string
    topicName: string
  } | null>(null)
  const [draggingLesson, setDraggingLesson] = useState<{
    level: string
    moduleName: string
    topicName: string
    lessonId: number
  } | null>(null)
  const [dragOverModuleKey, setDragOverModuleKey] = useState<string | null>(null)
  const [dragOverTopicKey, setDragOverTopicKey] = useState<string | null>(null)
  const [dragOverLessonId, setDragOverLessonId] = useState<number | null>(null)
  const [movingTopicKey, setMovingTopicKey] = useState<string | null>(null)
  const [moveTopicTargetModuleKey, setMoveTopicTargetModuleKey] = useState("")

  const secret = typeof window !== "undefined" ? sessionStorage.getItem("admin_secret") || "" : ""

  async function refreshData() {
    const [data, lvls] = await Promise.all([
      adminApi.getLessons(secret),
      adminApi.getLevels(secret),
    ])
    const filtered = lessonsByMode(data, mode)
    setLessons(filtered)
    setModules(buildModules(filtered))
    setLevels(levelsByMode(lvls, filtered, mode).sort((a, b) => a.order - b.order))
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([adminApi.getLessons(secret), adminApi.getLevels(secret)])
      .then(([data, lvls]) => {
        if (!cancelled) {
          const filtered = lessonsByMode(data, mode)
          setLessons(filtered)
          setModules(buildModules(filtered))
          setLevels(levelsByMode(lvls, filtered, mode).sort((a, b) => a.order - b.order))
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [secret, mode])

  const editorTitle = mode === "bootcamp" ? "Программа буткемпа" : "Программа курса"
  const levelsTitle = mode === "bootcamp" ? "Управление уровнями буткемпа" : "Управление уровнями"

  const levelBySlug = useMemo(() => {
    const map = new Map<string, AdminLevel>()
    for (const l of levels) map.set(l.slug, l)
    return map
  }, [levels])

  const levelTitle = (slug: string) => {
    const found = levelBySlug.get(slug)
    if (found) return `${found.order}. ${found.title}`
    return slug
  }

  const moduleKey = (level: string, moduleName: string) => `${level}::${moduleName}`

  // Group modules by level slug, order by level.order
  const modulesByLevel = useMemo(() => {
    const map = new Map<string, ModuleGroup[]>()
    for (const m of modules) {
      if (!map.has(m.level)) map.set(m.level, [])
      map.get(m.level)!.push(m)
    }
    return map
  }, [modules])

  const managedLevels = useMemo(() => {
    if (mode !== "bootcamp") {
      return levels
    }

    return levels.filter((level) => {
      const hasModules = (modulesByLevel.get(level.slug) || []).length > 0
      return hasModules || level.slug.startsWith("bootcamp-")
    })
  }, [levels, mode, modulesByLevel])

  // All unique level slugs from lessons (may include levels not in DB)
  const allLevelSlugs = useMemo(() => {
    const slugsFromModules = new Set(modules.map((m) => m.level))
    // Combine with DB levels
    const ordered: string[] = []
    for (const l of levels) {
      ordered.push(l.slug)
      slugsFromModules.delete(l.slug)
    }
    // Remaining slugs from lessons that have no DB level
    for (const s of slugsFromModules) ordered.push(s)
    return ordered
  }, [modules, levels])

  function flashSuccess(message: string) {
    setSuccessMsg(message)
    setTimeout(() => setSuccessMsg(""), 2200)
  }

  // --- Level CRUD ---

  async function handleCreateLevel() {
    const title = newLevelTitle.trim()
    if (!title) return
    let slug = newLevelSlug.trim() || title.toLowerCase().replace(/\s+/g, "-")
    if (mode === "bootcamp" && !slug.startsWith("bootcamp-")) {
      slug = `bootcamp-${slug}`
    }
    const maxOrder = levels.reduce((acc, l) => Math.max(acc, l.order), 0)
    setSaving(true)
    try {
      await adminApi.createLevel(secret, { title, slug, order: maxOrder + 1 })

      if (mode === "bootcamp") {
        await adminApi.createModule(secret, {
          name: "bootcamp",
          level: slug,
          category: "Sprint 0",
          firstLessonTitle: "Sprint 0: Новый урок",
        })
      }

      setNewLevelTitle("")
      setNewLevelSlug("")
      setShowNewLevelForm(false)
      await refreshData()
      flashSuccess("Уровень создан")
    } catch {
      flashSuccess("Ошибка при создании уровня")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateLevel(level: AdminLevel) {
    const title = editingLevelTitle.trim()
    if (!title) {
      setEditingLevelId(null)
      return
    }
    setSaving(true)
    try {
      await adminApi.updateLevel(secret, level.id, { title, slug: level.slug, order: level.order })
      await refreshData()
      setEditingLevelId(null)
      setEditingLevelTitle("")
      flashSuccess("Уровень сохранён")
    } catch {
      flashSuccess("Ошибка при сохранении уровня")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLevel(level: AdminLevel) {
    if (!window.confirm(`Удалить уровень "${level.title}" и уроки этого уровня?`)) return
    setSaving(true)
    try {
      const allLessons = await adminApi.getLessons(secret)
      const levelLessons = mode === "bootcamp"
        ? allLessons.filter((l) => l.level === level.slug && l.module === "bootcamp")
        : allLessons.filter((l) => l.level === level.slug)

      if (levelLessons.length > 0) {
        await Promise.all(levelLessons.map((lesson) => adminApi.deleteLesson(secret, lesson.id)))
      }

      const remainingLessonsInLevel = allLessons.filter(
        (lesson) => lesson.level === level.slug && !levelLessons.some((deleted) => deleted.id === lesson.id)
      )

      if (remainingLessonsInLevel.length === 0) {
        await adminApi.deleteLevel(secret, level.id)
      }

      await refreshData()
      flashSuccess("Уровень обновлен")
    } catch {
      flashSuccess("Ошибка при удалении уровня")
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveLevelUp(idx: number) {
    if (idx === 0) return
    const a = levels[idx]
    const b = levels[idx - 1]
    setSaving(true)
    try {
      await Promise.all([
        adminApi.updateLevel(secret, a.id, { title: a.title, slug: a.slug, order: b.order }),
        adminApi.updateLevel(secret, b.id, { title: b.title, slug: b.slug, order: a.order }),
      ])
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении")
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveLevelDown(idx: number) {
    if (idx >= levels.length - 1) return
    const a = levels[idx]
    const b = levels[idx + 1]
    setSaving(true)
    try {
      await Promise.all([
        adminApi.updateLevel(secret, a.id, { title: a.title, slug: a.slug, order: b.order }),
        adminApi.updateLevel(secret, b.id, { title: b.title, slug: b.slug, order: a.order }),
      ])
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении")
    } finally {
      setSaving(false)
    }
  }

  // --- Module helpers ---

  async function handleAddModule(level: string) {
    if (mode === "bootcamp") {
      const hasBootcampModule = lessons.some((lesson) => lesson.level === level && lesson.module === "bootcamp")
      if (hasBootcampModule) {
        flashSuccess("В уровне уже есть модуль bootcamp")
        return
      }

      setSaving(true)
      try {
        await adminApi.createModule(secret, {
          name: "bootcamp",
          level,
          category: "Sprint 0",
          firstLessonTitle: "Sprint 0: Новый урок",
        })
        await refreshData()
        flashSuccess("Модуль bootcamp добавлен")
      } catch {
        flashSuccess("Ошибка при добавлении модуля")
      } finally {
        setSaving(false)
      }
      return
    }

    const moduleName = window.prompt(`Новый модуль для уровня ${levelTitle(level)}`, "Новый модуль")?.trim()
    if (!moduleName) return

    const topicName = window.prompt("Название первой темы", "Основы")?.trim() || "Основы"
    const firstLessonTitle = window.prompt("Название первого урока", "Новый урок")?.trim() || "Новый урок"

    setSaving(true)
    try {
      await adminApi.createModule(secret, {
        name: moduleName,
        level,
        category: topicName,
        firstLessonTitle,
      })
      await refreshData()
      flashSuccess("Модуль добавлен")
    } catch {
      flashSuccess("Ошибка при добавлении модуля")
    } finally {
      setSaving(false)
    }
  }

  async function handleAddTopicToModule(levelSlug: string, moduleName: string) {
    const topicName = window.prompt(`Новая тема в модуле ${moduleName}`, "Новая тема")?.trim()
    if (!topicName) return

    const firstLessonTitle = window.prompt("Название первого урока", "Новый урок")?.trim()
    if (!firstLessonTitle) {
      flashSuccess("Тема не создана: добавь название первого урока")
      return
    }

    const moduleLessons = lessons.filter((l) => l.level === levelSlug && l.module === moduleName)
    const maxOrder = moduleLessons.reduce((acc, l) => Math.max(acc, l.order ?? 0), 0)
    const nextOrder = maxOrder + 1
    const slug = buildLessonSlug(levelSlug, moduleName, topicName, firstLessonTitle, nextOrder)

    setSaving(true)
    try {
      await adminApi.createLesson(secret, {
        level: levelSlug,
        module: moduleName,
        category: topicName,
        slug,
        title: firstLessonTitle,
        description: "",
        content: "",
        order: nextOrder,
      })
      await refreshData()
      flashSuccess("Тема создана")
    } catch {
      flashSuccess("Ошибка при создании темы")
    } finally {
      setSaving(false)
    }
  }

  async function handleRenameTopic(level: string, moduleName: string, oldTopic: string, newTopic: string) {
    if (!newTopic.trim() || newTopic.trim() === oldTopic) {
      setEditingTopicKey(null)
      setEditingTopicValue("")
      return
    }
    const topicLessons = lessons.filter(
      (l) => l.level === level && l.module === moduleName && l.category === oldTopic
    )
    setSaving(true)
    try {
      await Promise.all(
        topicLessons.map((l) => adminApi.updateLesson(secret, l.id, { category: newTopic.trim() }))
      )
      await refreshData()
      flashSuccess("Тема переименована")
    } catch {
      flashSuccess("Ошибка при переименовании темы")
    } finally {
      setSaving(false)
      setEditingTopicKey(null)
      setEditingTopicValue("")
    }
  }

  async function handleCreateLessonInTopic(
    level: string,
    moduleName: string,
    topicName: string
  ) {
    const topicKey = `${level}::${moduleName}::${topicName}`
    const title = (newLessonByTopic[topicKey] || "").trim()
    if (!title) return
    const moduleLessons = lessons.filter((l) => l.level === level && l.module === moduleName)
    const maxOrder = moduleLessons.reduce((acc, l) => Math.max(acc, l.order ?? 0), 0)
    const nextOrder = maxOrder + 1
    const slug = buildLessonSlug(level, moduleName, topicName, title, nextOrder)
    setSaving(true)
    try {
      await adminApi.createLesson(secret, {
        level,
        module: moduleName,
        category: topicName,
        slug,
        title,
        description: "",
        content: "",
        order: nextOrder,
      })
      setNewLessonByTopic((prev) => ({ ...prev, [topicKey]: "" }))
      await refreshData()
      flashSuccess("Урок создан")
    } catch {
      flashSuccess("Ошибка при создании урока")
    } finally {
      setSaving(false)
    }
  }

  function handleOpenLesson(lesson: AdminLesson) {
    setOpenedLessonId(lesson.id)
    setOpenedLessonTitle(lesson.title)
    setOpenedLessonContent(lesson.content || "")
  }

  async function handleSaveLessonContent(lesson: AdminLesson) {
    setSaving(true)
    try {
      await adminApi.updateLesson(secret, lesson.id, { content: openedLessonContent })
      await refreshData()
      flashSuccess("Текст урока сохранен")
    } catch {
      flashSuccess("Ошибка при сохранении текста")
    } finally {
      setSaving(false)
    }
  }

  async function handleRenameModule(level: string, oldName: string) {
    const nextName = editingModuleValue.trim()
    if (!nextName || nextName === oldName) {
      setEditingModuleName(null)
      setEditingModuleValue("")
      return
    }

    const lessonsToRename = lessons.filter((lesson) => lesson.level === level && lesson.module === oldName)
    if (lessonsToRename.length === 0) {
      setEditingModuleName(null)
      setEditingModuleValue("")
      return
    }

    setSaving(true)
    try {
      await Promise.all(
        lessonsToRename.map((lesson) =>
          adminApi.updateLesson(secret, lesson.id, { module: nextName })
        )
      )
      await refreshData()
      flashSuccess("Модуль переименован")
    } catch {
      flashSuccess("Ошибка при переименовании модуля")
    } finally {
      setSaving(false)
      setEditingModuleName(null)
      setEditingModuleValue("")
    }
  }

  async function handleMoveModule(moduleName: string) {
    if (!moveTargetLevel) return
    setSaving(true)
    try {
      await adminApi.moveModule(secret, moduleName, moveTargetLevel)
      await refreshData()
      setMovingModule(null)
      setMoveTargetLevel("")
      flashSuccess(`Модуль перемещён в ${levelTitle(moveTargetLevel)}`)
    } catch {
      flashSuccess("Ошибка при перемещении модуля")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteModule(moduleName: string) {
    if (!window.confirm(`Удалить модуль "${moduleName}" и все его уроки/упражнения?`)) return
    setSaving(true)
    try {
      await adminApi.deleteModule(secret, moduleName)
      await refreshData()
      flashSuccess("Модуль удалён")
    } catch {
      flashSuccess("Ошибка при удалении модуля")
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveLessonInTopic(
    level: string,
    moduleName: string,
    topicName: string,
    lessonId: number,
    direction: "up" | "down"
  ) {
    const topicLessons = lessons
      .filter((l) => l.level === level && l.module === moduleName && l.category === topicName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    const idx = topicLessons.findIndex((l) => l.id === lessonId)
    if (idx < 0) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= topicLessons.length) return

    const current = topicLessons[idx]
    const target = topicLessons[swapIdx]

    setSaving(true)
    try {
      await Promise.all([
        adminApi.updateLesson(secret, current.id, { order: target.order }),
        adminApi.updateLesson(secret, target.id, { order: current.order }),
      ])
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении урока")
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveTopicInModule(
    level: string,
    moduleName: string,
    topicName: string,
    direction: "up" | "down"
  ) {
    const moduleGroup = modules.find((m) => m.level === level && m.name === moduleName)
    if (!moduleGroup) return

    const topicNames = moduleGroup.topics.map((t) => t.name)
    const idx = topicNames.findIndex((name) => name === topicName)
    if (idx < 0) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= topicNames.length) return

    const reordered = [...topicNames]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]

    const moduleLessons = lessons
      .filter((l) => l.level === level && l.module === moduleName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    if (moduleLessons.length === 0) return

    let nextOrder = moduleLessons[0].order ?? 0
    const updates: Array<Promise<unknown>> = []

    for (const name of reordered) {
      const topicLessons = moduleLessons
        .filter((l) => l.category === name)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      for (const lesson of topicLessons) {
        if ((lesson.order ?? 0) !== nextOrder) {
          updates.push(adminApi.updateLesson(secret, lesson.id, { order: nextOrder }))
        }
        nextOrder++
      }
    }

    if (updates.length === 0) return

    setSaving(true)
    try {
      await Promise.all(updates)
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении темы")
    } finally {
      setSaving(false)
    }
  }

  async function handleReorderTopicInModule(
    level: string,
    moduleName: string,
    sourceTopicName: string,
    targetTopicName: string
  ) {
    if (sourceTopicName === targetTopicName) return
    const moduleGroup = modules.find((m) => m.level === level && m.name === moduleName)
    if (!moduleGroup) return

    const topicNames = moduleGroup.topics.map((t) => t.name)
    const sourceIdx = topicNames.findIndex((name) => name === sourceTopicName)
    const targetIdx = topicNames.findIndex((name) => name === targetTopicName)
    if (sourceIdx < 0 || targetIdx < 0 || sourceIdx === targetIdx) return

    const reordered = moveByIndex(topicNames, sourceIdx, targetIdx)

    const moduleLessons = lessons
      .filter((l) => l.level === level && l.module === moduleName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    if (moduleLessons.length === 0) return

    let nextOrder = moduleLessons[0].order ?? 0
    const updates: Array<Promise<unknown>> = []

    for (const name of reordered) {
      const topicLessons = moduleLessons
        .filter((l) => l.category === name)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      for (const lesson of topicLessons) {
        if ((lesson.order ?? 0) !== nextOrder) {
          updates.push(adminApi.updateLesson(secret, lesson.id, { order: nextOrder }))
        }
        nextOrder++
      }
    }

    if (updates.length === 0) return

    setSaving(true)
    try {
      await Promise.all(updates)
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении темы")
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveTopicToModule(
    sourceLevel: string,
    sourceModuleName: string,
    topicName: string,
    targetLevel: string,
    targetModuleName: string
  ) {
    if (sourceLevel === targetLevel && sourceModuleName === targetModuleName) {
      setMovingTopicKey(null)
      setMoveTopicTargetModuleKey("")
      return
    }

    const topicLessons = lessons
      .filter((l) => l.level === sourceLevel && l.module === sourceModuleName && l.category === topicName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    if (topicLessons.length === 0) {
      setMovingTopicKey(null)
      setMoveTopicTargetModuleKey("")
      return
    }

    const targetModuleLessons = lessons
      .filter((l) => l.level === targetLevel && l.module === targetModuleName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    const maxTargetOrder = targetModuleLessons.reduce((acc, lesson) => Math.max(acc, lesson.order ?? 0), 0)
    let nextOrder = targetModuleLessons.length > 0 ? maxTargetOrder + 1 : 1

    setSaving(true)
    try {
      await Promise.all(
        topicLessons.map((lesson) => {
          const patch: Partial<AdminLesson> = {
            level: targetLevel,
            module: targetModuleName,
            order: nextOrder,
          }
          nextOrder++
          return adminApi.updateLesson(secret, lesson.id, patch)
        })
      )
      await refreshData()
      flashSuccess(`Тема перенесена в модуль ${targetModuleName}`)
    } catch {
      flashSuccess("Ошибка при переносе темы в модуль")
    } finally {
      setSaving(false)
      setMovingTopicKey(null)
      setMoveTopicTargetModuleKey("")
    }
  }

  async function handleMoveModuleInLevel(level: string, moduleName: string, direction: "up" | "down") {
    const levelModules = (modulesByLevel.get(level) || []).map((m) => m.name)
    const idx = levelModules.findIndex((name) => name === moduleName)
    if (idx < 0) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= levelModules.length) return

    const reordered = [...levelModules]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]

    const levelLessons = lessons
      .filter((l) => l.level === level)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    if (levelLessons.length === 0) return

    let nextOrder = levelLessons[0].order ?? 0
    const updates: Array<Promise<unknown>> = []

    for (const name of reordered) {
      const moduleLessons = levelLessons
        .filter((l) => l.module === name)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      for (const lesson of moduleLessons) {
        if ((lesson.order ?? 0) !== nextOrder) {
          updates.push(adminApi.updateLesson(secret, lesson.id, { order: nextOrder }))
        }
        nextOrder++
      }
    }

    if (updates.length === 0) return

    setSaving(true)
    try {
      await Promise.all(updates)
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении модуля")
    } finally {
      setSaving(false)
    }
  }

  async function handleReorderModuleInLevel(level: string, sourceModuleName: string, targetModuleName: string) {
    if (sourceModuleName === targetModuleName) return
    const levelModules = (modulesByLevel.get(level) || []).map((m) => m.name)
    const sourceIdx = levelModules.findIndex((name) => name === sourceModuleName)
    const targetIdx = levelModules.findIndex((name) => name === targetModuleName)
    if (sourceIdx < 0 || targetIdx < 0 || sourceIdx === targetIdx) return

    const reordered = moveByIndex(levelModules, sourceIdx, targetIdx)

    const levelLessons = lessons
      .filter((l) => l.level === level)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    if (levelLessons.length === 0) return

    let nextOrder = levelLessons[0].order ?? 0
    const updates: Array<Promise<unknown>> = []

    for (const name of reordered) {
      const moduleLessons = levelLessons
        .filter((l) => l.module === name)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      for (const lesson of moduleLessons) {
        if ((lesson.order ?? 0) !== nextOrder) {
          updates.push(adminApi.updateLesson(secret, lesson.id, { order: nextOrder }))
        }
        nextOrder++
      }
    }

    if (updates.length === 0) return

    setSaving(true)
    try {
      await Promise.all(updates)
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении модуля")
    } finally {
      setSaving(false)
    }
  }

  async function handleReorderLessonInTopic(
    level: string,
    moduleName: string,
    topicName: string,
    sourceLessonId: number,
    targetLessonId: number
  ) {
    if (sourceLessonId === targetLessonId) return

    const topicLessons = lessons
      .filter((l) => l.level === level && l.module === moduleName && l.category === topicName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)

    const sourceIdx = topicLessons.findIndex((l) => l.id === sourceLessonId)
    const targetIdx = topicLessons.findIndex((l) => l.id === targetLessonId)
    if (sourceIdx < 0 || targetIdx < 0 || sourceIdx === targetIdx) return

    const reordered = moveByIndex(topicLessons, sourceIdx, targetIdx)
    const baseOrder = topicLessons[0]?.order ?? 0
    const updates: Array<Promise<unknown>> = []

    reordered.forEach((lesson, idx) => {
      const nextOrder = baseOrder + idx
      if ((lesson.order ?? 0) !== nextOrder) {
        updates.push(adminApi.updateLesson(secret, lesson.id, { order: nextOrder }))
      }
    })

    if (updates.length === 0) return

    setSaving(true)
    try {
      await Promise.all(updates)
      await refreshData()
    } catch {
      flashSuccess("Ошибка при перемещении урока")
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveLessonToTopic(
    level: string,
    moduleName: string,
    sourceTopicName: string,
    targetTopicName: string,
    lessonId: number,
    targetLessonId?: number
  ) {
    if (sourceTopicName === targetTopicName) return

    const moduleGroup = modules.find((m) => m.level === level && m.name === moduleName)
    if (!moduleGroup) return

    const moduleLessons = lessons
      .filter((l) => l.level === level && l.module === moduleName)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
    if (moduleLessons.length === 0) return

    const moved = moduleLessons.find((l) => l.id === lessonId)
    if (!moved) return

    const topicOrder = moduleGroup.topics.map((t) => t.name)
    const grouped = new Map<string, AdminLesson[]>()
    for (const topic of topicOrder) {
      grouped.set(topic, moduleLessons.filter((l) => l.category === topic))
    }

    const sourceList = grouped.get(sourceTopicName)
    const targetList = grouped.get(targetTopicName)
    if (!sourceList || !targetList) return

    const sourceIdx = sourceList.findIndex((l) => l.id === lessonId)
    if (sourceIdx < 0) return

    const [removed] = sourceList.splice(sourceIdx, 1)
    const movedLesson = { ...removed, category: targetTopicName }

    if (targetLessonId) {
      const targetIdx = targetList.findIndex((l) => l.id === targetLessonId)
      if (targetIdx >= 0) {
        targetList.splice(targetIdx, 0, movedLesson)
      } else {
        targetList.push(movedLesson)
      }
    } else {
      targetList.push(movedLesson)
    }

    const reordered: AdminLesson[] = []
    for (const topicName of topicOrder) {
      const topicLessons = (grouped.get(topicName) || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      reordered.push(...topicLessons)
    }

    const baseOrder = moduleLessons[0].order ?? 0
    const updates: Array<Promise<unknown>> = []

    reordered.forEach((lesson, idx) => {
      const nextOrder = baseOrder + idx
      const patch: Partial<AdminLesson> = {}
      if (lesson.id === lessonId) {
        patch.category = targetTopicName
      }
      if ((lesson.order ?? 0) !== nextOrder) {
        patch.order = nextOrder
      }
      if (Object.keys(patch).length > 0) {
        updates.push(adminApi.updateLesson(secret, lesson.id, patch))
      }
    })

    if (updates.length === 0) return

    setSaving(true)
    try {
      await Promise.all(updates)
      await refreshData()
    } catch {
      flashSuccess("Ошибка при переносе урока")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateLesson(lesson: AdminLesson) {
    const newTitle = editingLessonTitle.trim()
    if (!newTitle || newTitle === lesson.title) {
      setEditingLessonId(null)
      setEditingLessonTitle("")
      return
    }

    setSaving(true)
    try {
      await adminApi.updateLesson(secret, lesson.id, { title: newTitle })
      await refreshData()
      flashSuccess("Урок обновлен")
    } catch {
      flashSuccess("Ошибка при обновлении урока")
    } finally {
      setSaving(false)
      setEditingLessonId(null)
      setEditingLessonTitle("")
    }
  }

  async function handleDeleteLesson(lessonId: number, lessonTitle: string) {
    if (!window.confirm(`Удалить урок "${lessonTitle}"?`)) return

    setSaving(true)
    try {
      await adminApi.deleteLesson(secret, lessonId)
      await refreshData()
      flashSuccess("Урок удален")
    } catch {
      flashSuccess("Ошибка при удалении урока")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">Загрузка структуры...</div>
  if (error) return <div className="text-red-400">Ошибка: {error}</div>

  return (
    <div className="space-y-8">
      {/* Level management panel */}
      <div className="rounded-2xl border border-purple-900 bg-purple-950/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-purple-200">{levelsTitle}</h2>
          <button
            onClick={() => setShowNewLevelForm((v) => !v)}
            disabled={saving}
            className="bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 text-sm"
          >
            + Новый уровень
          </button>
        </div>

        {showNewLevelForm && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <input
              value={newLevelTitle}
              onChange={(e) => setNewLevelTitle(e.target.value)}
              placeholder="Название уровня (напр. Конкурентность)"
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm flex-1 min-w-40"
            />
            <input
              value={newLevelSlug}
              onChange={(e) => setNewLevelSlug(e.target.value)}
              placeholder="Slug (напр. level9 — необязательно)"
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm w-56"
            />
            <button
              onClick={handleCreateLevel}
              disabled={saving || !newLevelTitle.trim()}
              className="bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white rounded px-3 py-1.5 text-sm"
            >
              Создать
            </button>
            <button
              onClick={() => { setShowNewLevelForm(false); setNewLevelTitle(""); setNewLevelSlug("") }}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1.5 text-sm"
            >
              Отмена
            </button>
          </div>
        )}

        {managedLevels.length === 0 ? (
          <p className="text-gray-400 text-sm">Уровней нет. Создайте уровень, чтобы привязать к нему модули.</p>
        ) : (
          <div className="space-y-2">
            {managedLevels.map((level) => {
              const idx = levels.findIndex((item) => item.id === level.id)

              return (
              <div key={level.id} className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg p-2">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveLevelUp(idx)}
                    disabled={saving || idx === 0}
                    className="text-gray-400 hover:text-white disabled:opacity-20 text-xs leading-none px-1"
                    title="Переместить вверх"
                  >▲</button>
                  <button
                    onClick={() => handleMoveLevelDown(idx)}
                    disabled={saving || idx === levels.length - 1}
                    className="text-gray-400 hover:text-white disabled:opacity-20 text-xs leading-none px-1"
                    title="Переместить вниз"
                  >▼</button>
                </div>
                <span className="text-gray-500 text-sm w-6 text-center">{level.order}</span>
                {editingLevelId === level.id ? (
                  <input
                    value={editingLevelTitle}
                    onChange={(e) => setEditingLevelTitle(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm flex-1"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleUpdateLevel(level) }}
                  />
                ) : (
                  <span className="flex-1 text-white font-medium">{level.title}</span>
                )}
                <span className="text-gray-500 text-xs">[{level.slug}]</span>
                {editingLevelId === level.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateLevel(level)}
                      disabled={saving}
                      className="text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded px-2 py-1"
                    >Сохранить</button>
                    <button
                      onClick={() => { setEditingLevelId(null); setEditingLevelTitle("") }}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1"
                    >Отмена</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingLevelId(level.id); setEditingLevelTitle(level.title) }}
                      disabled={saving}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1"
                    >Редактировать</button>
                    <button
                      onClick={() => handleDeleteLevel(level)}
                      disabled={saving}
                      className="text-xs text-red-400 hover:text-red-300"
                    >✕</button>
                  </>
                )}
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Course structure */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl font-bold">{editorTitle}</h2>
        </div>
        <div className="text-xs text-gray-400 bg-gray-900/70 border border-gray-700 rounded-lg px-3 py-2 inline-block">
          Перетащи карточки мышкой: модуль внутри уровня, тему внутри модуля, урок внутри темы.
        </div>

        {successMsg && (
          <div className="text-green-400 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 inline-block">
            {successMsg}
          </div>
        )}

        <div className="space-y-10">
          {allLevelSlugs.length === 0 && (
            <div className="text-gray-400">В БД нет уроков. Добавь модуль и создай первый урок.</div>
          )}

          {allLevelSlugs.map((levelSlug) => {
            const levelInfo = levelBySlug.get(levelSlug)
            const levelModules = modulesByLevel.get(levelSlug) || []

            return (
              <div key={levelSlug}>
                {/* Level header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-700" />
                  <h3 className="text-xl font-bold text-purple-300 whitespace-nowrap">
                    {levelInfo ? `${levelInfo.order}. ${levelInfo.title}` : levelSlug}
                  </h3>
                  <div className="h-px flex-1 bg-gray-700" />
                  <button
                    onClick={() => handleAddModule(levelSlug)}
                    disabled={saving}
                    className="text-sm bg-purple-800 hover:bg-purple-700 text-white rounded px-3 py-1"
                  >+ Модуль</button>
                </div>

                {levelModules.length === 0 && (
                  <p className="text-gray-500 text-sm pl-4">Модулей в этом уровне нет</p>
                )}

                <div className="space-y-6">
                  {levelModules.map((module, moduleIndex) => {
                    const key = `${module.level}::${module.name}`

                    return (
                      <section
                        key={key}
                        className={`border border-gray-700 rounded-lg bg-gray-900 ${
                          draggingModule?.level === module.level && draggingModule?.moduleName === module.name
                            ? "opacity-60"
                            : ""
                        } ${
                          dragOverModuleKey === key ? "ring-2 ring-amber-500/70 border-amber-500/70" : ""
                        }`}
                        draggable={!saving}
                        onDragStart={() => {
                          setDraggingModule({ level: module.level, moduleName: module.name })
                          setDragOverModuleKey(null)
                        }}
                        onDragEnd={() => {
                          setDraggingModule(null)
                          setDragOverModuleKey(null)
                        }}
                        onDragOver={(e) => {
                          if (saving || !draggingModule || draggingModule.level !== module.level) return
                          e.preventDefault()
                          setDragOverModuleKey(key)
                        }}
                        onDrop={async (e) => {
                          e.preventDefault()
                          if (!draggingModule || saving) return
                          if (draggingModule.level !== module.level) return
                          await handleReorderModuleInLevel(module.level, draggingModule.moduleName, module.name)
                          setDraggingModule(null)
                          setDragOverModuleKey(null)
                        }}
                      >
                        <div className="p-4 border-b border-gray-700">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-xl text-gray-400 w-8 text-right">{moduleIndex + 1}</span>
                              {editingModuleName === moduleKey(module.level, module.name) ? (
                                <input
                                  value={editingModuleValue}
                                  onChange={(e) => setEditingModuleValue(e.target.value)}
                                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-lg w-full"
                                  autoFocus
                                />
                              ) : (
                                <div className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-2xl font-semibold w-full">
                                  {module.name}
                                </div>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm whitespace-nowrap">Тем: {module.topics.length} · Уроков: {module.topics.reduce((s, t) => s + t.lessons.length, 0)}</div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500">{module.level}</span>
                            <span className="text-xs text-amber-300/80">↕ Перетащи модуль</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {editingModuleName === moduleKey(module.level, module.name) ? (
                              <>
                                <button
                                  onClick={() => handleRenameModule(module.level, module.name)}
                                  disabled={saving}
                                  className="text-sm bg-cyan-700 hover:bg-cyan-600 text-white rounded px-3 py-1"
                                >
                                  Сохранить
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingModuleName(null)
                                    setEditingModuleValue("")
                                  }}
                                  disabled={saving}
                                  className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1"
                                >
                                  Отмена
                                </button>
                              </>
                            ) : mode !== "bootcamp" ? (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingModuleName(moduleKey(module.level, module.name))
                                    setEditingModuleValue(module.name)
                                  }}
                                  disabled={saving}
                                  className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-1"
                                >
                                  Переименовать
                                </button>

                                {movingModule === module.name ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={moveTargetLevel}
                                      onChange={(e) => setMoveTargetLevel(e.target.value)}
                                      className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
                                    >
                                      <option value="">— выбери уровень —</option>
                                      {levels.map((l) => (
                                        <option key={l.id} value={l.slug}>
                                          {l.order}. {l.title} [{l.slug}]
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleMoveModule(module.name)}
                                      disabled={saving || !moveTargetLevel}
                                      className="text-sm bg-amber-700 hover:bg-amber-600 disabled:opacity-60 text-white rounded px-3 py-1"
                                    >
                                      Переместить
                                    </button>
                                    <button
                                      onClick={() => {
                                        setMovingModule(null)
                                        setMoveTargetLevel("")
                                      }}
                                      className="text-sm bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setMovingModule(module.name)
                                        setMoveTargetLevel("")
                                      }}
                                      disabled={saving}
                                      className="text-sm bg-amber-800 hover:bg-amber-700 text-white rounded px-3 py-1"
                                    >
                                      Переместить в уровень
                                    </button>
                                    <button
                                      onClick={() => handleMoveModuleInLevel(module.level, module.name, "up")}
                                      disabled={saving || moduleIndex === 0}
                                      className="text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded px-2 py-1"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      onClick={() => handleMoveModuleInLevel(module.level, module.name, "down")}
                                      disabled={saving || moduleIndex === levelModules.length - 1}
                                      className="text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded px-2 py-1"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      onClick={() => handleDeleteModule(module.name)}
                                      disabled={saving}
                                      className="text-sm bg-red-800 hover:bg-red-700 text-white rounded px-3 py-1"
                                    >
                                      Удалить модуль
                                    </button>
                                  </>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="divide-y divide-gray-800">
                          {/* Real topics */}
                          {module.topics.map((topic, topicIdx) => {
                            const topicKey = `${module.level}::${module.name}::${topic.name}`
                            const isEditingTopic = editingTopicKey === topicKey
                            return (
                              <div
                                key={topic.name}
                                className={`p-4 ${
                                  draggingTopic?.level === module.level &&
                                  draggingTopic?.moduleName === module.name &&
                                  draggingTopic?.topicName === topic.name
                                    ? "opacity-60"
                                    : ""
                                } ${
                                  dragOverTopicKey === topicKey ? "bg-sky-950/40 ring-1 ring-sky-500/80" : ""
                                }`}
                                draggable={!saving}
                                onDragStart={() =>
                                  setDraggingTopic({
                                    level: module.level,
                                    moduleName: module.name,
                                    topicName: topic.name,
                                  })
                                }
                                onDragEnd={() => {
                                  setDraggingTopic(null)
                                  setDragOverTopicKey(null)
                                }}
                                onDragOver={(e) => {
                                  const canDragTopic =
                                    !!draggingTopic &&
                                    draggingTopic.level === module.level &&
                                    draggingTopic.moduleName === module.name
                                  const canDragLesson =
                                    !!draggingLesson &&
                                    draggingLesson.level === module.level &&
                                    draggingLesson.moduleName === module.name
                                  if (saving || (!canDragTopic && !canDragLesson)) return
                                  e.preventDefault()
                                  setDragOverTopicKey(topicKey)
                                }}
                                onDrop={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (saving) return

                                  if (
                                    draggingTopic &&
                                    draggingTopic.level === module.level &&
                                    draggingTopic.moduleName === module.name
                                  ) {
                                    await handleReorderTopicInModule(
                                      module.level,
                                      module.name,
                                      draggingTopic.topicName,
                                      topic.name
                                    )
                                  } else if (
                                    draggingLesson &&
                                    draggingLesson.level === module.level &&
                                    draggingLesson.moduleName === module.name
                                  ) {
                                    await handleMoveLessonToTopic(
                                      module.level,
                                      module.name,
                                      draggingLesson.topicName,
                                      topic.name,
                                      draggingLesson.lessonId
                                    )
                                  }

                                  setDraggingTopic(null)
                                  setDraggingLesson(null)
                                  setDragOverTopicKey(null)
                                  setDragOverLessonId(null)
                                }}
                              >
                                {/* Topic header */}
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                                  {isEditingTopic ? (
                                    <input
                                      value={editingTopicValue}
                                      onChange={(e) => setEditingTopicValue(e.target.value)}
                                      className="bg-gray-800 border border-sky-600 rounded px-2 py-0.5 text-sm text-sky-200 flex-1"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleRenameTopic(module.level, module.name, topic.name, editingTopicValue)
                                        if (e.key === "Escape") { setEditingTopicKey(null); setEditingTopicValue("") }
                                      }}
                                    />
                                  ) : (
                                    <span className="text-sky-300 font-medium text-sm flex-1">{topic.name}</span>
                                  )}
                                  <span className="text-xs text-sky-300/70">↕ Перетащи</span>
                                  {isEditingTopic ? (
                                    <>
                                      <button onClick={() => handleRenameTopic(module.level, module.name, topic.name, editingTopicValue)} disabled={saving} className="text-xs bg-sky-700 hover:bg-sky-600 text-white rounded px-2 py-0.5">Сохранить</button>
                                      <button onClick={() => { setEditingTopicKey(null); setEditingTopicValue("") }} className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-0.5">Отмена</button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => { setEditingTopicKey(topicKey); setEditingTopicValue(topic.name) }} disabled={saving} className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-0.5">Переименовать</button>
                                      {movingTopicKey === topicKey ? (
                                        <>
                                          <select
                                            value={moveTopicTargetModuleKey}
                                            onChange={(e) => setMoveTopicTargetModuleKey(e.target.value)}
                                            className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-white"
                                          >
                                            <option value="">Выбери модуль</option>
                                            {modules
                                              .filter((m) => !(m.level === module.level && m.name === module.name))
                                              .map((m) => {
                                                const targetKey = moduleKey(m.level, m.name)
                                                return (
                                                  <option key={targetKey} value={targetKey}>
                                                    {levelTitle(m.level)} / {m.name}
                                                  </option>
                                                )
                                              })}
                                          </select>
                                          <button
                                            onClick={async () => {
                                              if (!moveTopicTargetModuleKey) return
                                              const sepIdx = moveTopicTargetModuleKey.indexOf("::")
                                              if (sepIdx < 0) return
                                              const targetLevel = moveTopicTargetModuleKey.slice(0, sepIdx)
                                              const targetModuleName = moveTopicTargetModuleKey.slice(sepIdx + 2)
                                              await handleMoveTopicToModule(
                                                module.level,
                                                module.name,
                                                topic.name,
                                                targetLevel,
                                                targetModuleName
                                              )
                                            }}
                                            disabled={saving || !moveTopicTargetModuleKey}
                                            className="text-xs bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white rounded px-2 py-0.5"
                                          >
                                            Перенести
                                          </button>
                                          <button
                                            onClick={() => {
                                              setMovingTopicKey(null)
                                              setMoveTopicTargetModuleKey("")
                                            }}
                                            disabled={saving}
                                            className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-0.5"
                                          >
                                            ✕
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setMovingTopicKey(topicKey)
                                            setMoveTopicTargetModuleKey("")
                                          }}
                                          disabled={saving || modules.length < 2}
                                          className="text-xs bg-amber-800 hover:bg-amber-700 disabled:opacity-40 text-white rounded px-2 py-0.5"
                                        >
                                          В модуль
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleMoveTopicInModule(module.level, module.name, topic.name, "up")}
                                        disabled={saving || topicIdx === 0}
                                        className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded px-2 py-0.5"
                                      >
                                        ↑
                                      </button>
                                      <button
                                        onClick={() => handleMoveTopicInModule(module.level, module.name, topic.name, "down")}
                                        disabled={saving || topicIdx === module.topics.length - 1}
                                        className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded px-2 py-0.5"
                                      >
                                        ↓
                                      </button>
                                    </>
                                  )}
                                </div>

                                {/* Lessons in this topic */}
                                <div className="space-y-2 ml-4">
                                  {topic.lessons.map((lesson, lessonIdx) => (
                                    <React.Fragment key={lesson.id}>
                                      <div
                                        className={`flex items-center justify-between gap-3 border-b border-gray-800 pb-2 ${
                                          draggingLesson?.lessonId === lesson.id ? "opacity-60" : ""
                                        } ${
                                          dragOverLessonId === lesson.id ? "bg-indigo-950/40 ring-1 ring-indigo-500/80 rounded" : ""
                                        }`}
                                        draggable={!saving}
                                        onDragStart={(e) => {
                                          e.stopPropagation()
                                          setDraggingLesson({
                                            level: module.level,
                                            moduleName: module.name,
                                            topicName: topic.name,
                                            lessonId: lesson.id,
                                          })
                                        }}
                                        onDragEnd={(e) => {
                                          e.stopPropagation()
                                          setDraggingLesson(null)
                                          setDragOverLessonId(null)
                                        }}
                                        onDragOver={(e) => {
                                          e.stopPropagation()
                                          if (
                                            saving ||
                                            !draggingLesson ||
                                            draggingLesson.level !== module.level ||
                                            draggingLesson.moduleName !== module.name ||
                                            draggingLesson.lessonId === lesson.id
                                          ) {
                                            return
                                          }
                                          e.preventDefault()
                                          setDragOverLessonId(lesson.id)
                                        }}
                                        onDrop={async (e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (!draggingLesson || saving) return
                                          if (
                                            draggingLesson.level !== module.level ||
                                            draggingLesson.moduleName !== module.name
                                          ) {
                                            return
                                          }

                                          if (draggingLesson.topicName === topic.name) {
                                            await handleReorderLessonInTopic(
                                              module.level,
                                              module.name,
                                              topic.name,
                                              draggingLesson.lessonId,
                                              lesson.id
                                            )
                                          } else {
                                            await handleMoveLessonToTopic(
                                              module.level,
                                              module.name,
                                              draggingLesson.topicName,
                                              topic.name,
                                              draggingLesson.lessonId,
                                              lesson.id
                                            )
                                          }
                                          setDraggingLesson(null)
                                          setDragOverLessonId(null)
                                        }}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <span className="text-gray-500 text-xs w-8 text-right flex-shrink-0">{topicIdx + 1}.{lessonIdx + 1}</span>
                                          {editingLessonId === lesson.id ? (
                                            <input value={editingLessonTitle} onChange={(e) => setEditingLessonTitle(e.target.value)} className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white w-full text-sm" autoFocus />
                                          ) : (
                                            <span className="text-gray-200 text-sm">{lesson.title} <span className="text-indigo-300/70 text-xs">↕</span></span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {editingLessonId === lesson.id ? (
                                            <>
                                              <button onClick={() => handleUpdateLesson(lesson)} disabled={saving} className="text-xs bg-cyan-700 hover:bg-cyan-600 text-white rounded px-2 py-1">Сохранить</button>
                                              <button onClick={() => { setEditingLessonId(null); setEditingLessonTitle("") }} disabled={saving} className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1">Отмена</button>
                                            </>
                                          ) : (
                                            <>
                                              <button onClick={() => { setEditingLessonId(lesson.id); setEditingLessonTitle(lesson.title) }} disabled={saving} className="text-xs bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1">Редактировать</button>
                                              <button
                                                onClick={() => handleMoveLessonInTopic(module.level, module.name, topic.name, lesson.id, "up")}
                                                disabled={saving || lessonIdx === 0}
                                                className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded px-2 py-1"
                                              >
                                                ↑
                                              </button>
                                              <button
                                                onClick={() => handleMoveLessonInTopic(module.level, module.name, topic.name, lesson.id, "down")}
                                                disabled={saving || lessonIdx === topic.lessons.length - 1}
                                                className="text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white rounded px-2 py-1"
                                              >
                                                ↓
                                              </button>
                                              <select
                                                value={topic.name}
                                                onChange={async (e) => {
                                                  const targetTopic = e.target.value
                                                  if (targetTopic === topic.name || saving) return
                                                  await handleMoveLessonToTopic(
                                                    module.level,
                                                    module.name,
                                                    topic.name,
                                                    targetTopic,
                                                    lesson.id
                                                  )
                                                }}
                                                disabled={saving || module.topics.length < 2}
                                                className="text-xs bg-amber-900/60 border border-amber-700/60 rounded px-2 py-1 text-amber-100 disabled:opacity-40"
                                                title="Перенести урок в другой спринт/тему"
                                              >
                                                {module.topics.map((t) => (
                                                  <option key={t.name} value={t.name}>
                                                    {t.name}
                                                  </option>
                                                ))}
                                              </select>
                                            </>
                                          )}
                                          <button onClick={() => handleOpenLesson(lesson)} disabled={saving} className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white rounded px-2 py-1">Открыть</button>
                                          <button onClick={() => handleDeleteLesson(lesson.id, lesson.title)} disabled={saving} className="text-xs text-red-300 hover:text-red-200">✕</button>
                                        </div>
                                      </div>
                                      {openedLessonId === lesson.id && (
                                        <LessonEditor
                                          value={openedLessonContent}
                                          onChange={setOpenedLessonContent}
                                          onSave={() => handleSaveLessonContent(lesson)}
                                          saving={saving}
                                          lessonTitle={openedLessonTitle}
                                          onClose={() => { setOpenedLessonId(null); setOpenedLessonTitle(""); setOpenedLessonContent("") }}
                                          secret={secret}
                                        />
                                      )}
                                    </React.Fragment>
                                  ))}
                                  {/* Create lesson in this topic */}
                                  <div className="flex items-center gap-2 pt-1">
                                    <input
                                      value={newLessonByTopic[topicKey] || ""}
                                      onChange={(e) => setNewLessonByTopic((prev) => ({ ...prev, [topicKey]: e.target.value }))}
                                      placeholder="Название нового урока"
                                      className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm flex-1"
                                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateLessonInTopic(module.level, module.name, topic.name) }}
                                    />
                                    <button
                                      onClick={() => handleCreateLessonInTopic(module.level, module.name, topic.name)}
                                      disabled={saving || !(newLessonByTopic[topicKey] || "").trim()}
                                      className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white rounded px-3 py-1.5 text-sm whitespace-nowrap"
                                    >+ Урок</button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {/* Add topic button */}
                          <div className="p-3">
                            <button
                              onClick={() => handleAddTopicToModule(module.level, module.name)}
                              disabled={saving}
                              className="text-sm bg-sky-900 hover:bg-sky-800 text-sky-300 rounded px-3 py-1.5"
                            >+ Тема</button>
                          </div>
                        </div>
                      </section>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AdminStructurePage() {
  return <AdminStructureEditor mode="course" />
}

