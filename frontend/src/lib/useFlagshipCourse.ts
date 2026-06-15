'use client'

import { useEffect, useState } from 'react'
import { api, getLevels, type AdminLevel, type Lesson } from '@/lib/api'
import { storyCourseLessons, storyCourseLevels } from '@/lib/storyCourse'

export const FLAGSHIP_LEVEL_SLUG = 'internship-track'

function selectFlagshipLessons(lessons: Lesson[]): Lesson[] {
  return lessons
    .filter((lesson) => lesson.level === FLAGSHIP_LEVEL_SLUG)
    .sort((left, right) => left.order - right.order || left.id - right.id)
}

export function useFlagshipCourse() {
  const [lessons, setLessons] = useState<Lesson[]>(storyCourseLessons)
  const [levels, setLevels] = useState<AdminLevel[]>(storyCourseLevels)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([api.getLessons(), getLevels()])
      .then(([allLessons, allLevels]) => {
        if (cancelled) return
        const flagshipLessons = selectFlagshipLessons(allLessons)
        if (flagshipLessons.length > 0) {
          setLessons(flagshipLessons)
        }

        const flagshipLevels = allLevels.filter((level) => level.slug === FLAGSHIP_LEVEL_SLUG)
        if (flagshipLevels.length > 0) {
          setLevels(flagshipLevels)
        }
      })
      .catch(() => {
        // The bundled course keeps the free flagship route usable during API outages.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { lessons, levels, loading }
}
