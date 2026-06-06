'use client'

import React from 'react'

interface CourseProgressDTO {
  module: string
  title: string
  progress: number
  completed: boolean
  lessonsDone: number
  totalLessons: number
}

interface CoursesProgressProps {
  courseProgress: CourseProgressDTO[]
  completedSprints: number
  totalLessonsCount: number
  completedLessons: number
}

export default function CoursesProgress({
  courseProgress,
  completedSprints,
  totalLessonsCount,
  completedLessons,
}: CoursesProgressProps) {
  const overallProgress =
    totalLessonsCount > 0 ? Math.round((completedLessons / totalLessonsCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {completedSprints}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Завершено спринтов
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedLessons}/{totalLessonsCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Уроков завершено</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {overallProgress}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Общий прогресс</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {courseProgress.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Доступно курсов</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Общий прогресс обучения
          </h3>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {completedLessons}/{totalLessonsCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Твои спринты</h3>

        {courseProgress.length > 0 ? (
          <div className="space-y-3">
            {courseProgress.map((course) => (
              <div
                key={course.module}
                className={`
                  rounded-lg p-4 transition-all
                  ${
                    course.completed
                      ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 capitalize">
                        {course.module}
                      </h4>
                      {course.completed && (
                        <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                          ✓ Завершен
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.lessonsDone} из {course.totalLessons} уроков
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {course.progress}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`
                      h-2 rounded-full transition-all duration-500
                      ${
                        course.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }
                    `}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                {/* Completion status */}
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  {course.completed ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      🎉 Спринт успешно завершен! Ты заработал новые навыки.
                    </span>
                  ) : (
                    <span>
                      Осталось {course.totalLessons - course.lessonsDone} уроков до завершения
                      спринта
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Спринты еще не начаты. Начни обучение!</p>
          </div>
        )}
      </div>
    </div>
  )
}
