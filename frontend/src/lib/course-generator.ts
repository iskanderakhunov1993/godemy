export type CourseGeneratorMode = 'module' | 'lesson' | 'concept'

export type CourseGeneratorInput = {
  mode: CourseGeneratorMode
  moduleNumber: string
  moduleContext: string
  lessonTopic: string
  lessonModule: string
  projectContext: string
  concept: string
  extraContext: string
}

const COURSE_BIBLE = `Ты senior instructional designer, senior Go backend engineer, сценарист edutainment-курсов и методист bootcamp-программ.

Создавай курс Go Backend Engineer как сюжетную стажировку в крупнейшем банке страны. Курс не должен ощущаться как обучение. Он должен ощущаться как реальная стажировка junior backend developer.

КОНЦЕПЦИЯ
Студента случайно взяли в эксперимент Project ZERO -> Engineer. Банк проверяет, можно ли превратить человека без опыта в backend engineer.

В эксперименте три стажера:
- студент — главный герой;
- Данил использует AI, работает быстро, иногда выбирает shortcut solutions;
- Ленар задает простые вопросы, ошибается и показывает типичные страхи новичка.

ПЕРСОНАЖИ
- Рома, тимлид: спокойный supportive senior-ментор. Появляется при сложной теме, новой технологии, debugging и архитектуре.
- Аркадий Борисович, руководитель прайда: строгий business mindset. Объясняет impact, KPI, сроки и ценность фич.
- Юля, Project Manager: организует backlog, planning, grooming, priorities и retrospective.
- Снежана, аналитик: объясняет requirements, user stories и feature breakdown.
- Юджин, QA: учит testing mindset и любит ломать приложение.
- Юра, дизайнер: помогает понять взаимодействие frontend и backend.

МЕТОДИКА
- 90% практики, 10% теории.
- Теория появляется только по необходимости: problem -> need -> concept -> practice.
- Оставляй тему только тогда, когда без нее нельзя закончить текущий проект.
- Сюжет помогает действию, но не заменяет обучение.
- Персонажи появляются только с педагогической функцией.
- Тон friendly senior mentor: просто, конкретно, без академичности, кринжа и инфантилизации.

ПРАКТИКА
- Только realistic, useful, junior-like, business-related задачи.
- Используй банковские сервисы, внутренние инструменты, API, debugging, bug fixing и тестирование.
- Не используй калькуляторы, игрушечные приложения и абстрактные упражнения.
- Студент должен все трогать руками и получать проверяемый результат.

ПРОГРЕССИЯ ПРОЕКТОВ
- Project 1: только local development.
- Project 2: Git, GitHub, Docker.
- Project 3: PostgreSQL, Postman, REST API.

ОБЯЗАТЕЛЬНЫЙ ФОРМАТ ОТВЕТА
Module -> Themes -> Lessons -> Practice -> Deliverable -> What Student Learned -> Story Moments.

Пиши результат на русском языке. Английские технические термины используй только там, где они естественны для команды разработки.`

function optionalBlock(title: string, value: string): string {
  const normalized = value.trim()
  return normalized ? `\n${title}:\n${normalized}\n` : ''
}

export function buildCoursePrompt(input: CourseGeneratorInput): string {
  if (input.mode === 'module') {
    return `${COURSE_BIBLE}

ЗАДАЧА
Создай Module ${input.moduleNumber.trim() || 'X'} курса Go Backend Engineer.
${optionalBlock('Контекст модуля', input.moduleContext)}${optionalBlock('Дополнительный контекст', input.extraContext)}
Сделай:
1. Module Goal
2. Story Intro
3. Before We Start
4. Themes
5. Lessons
6. Practice
7. Sprint Challenge
8. Module Review
9. Retrospective

Для каждого урока обязательно добавь:
- сюжетную ситуацию;
- минимальную теорию, нужную прямо сейчас;
- реальную практику;
- проверяемый результат;
- точные действия студента руками;
- типичные ошибки или debugging moment.

В конце добавь Deliverable модуля, What Student Learned и Story Moments.`
  }

  if (input.mode === 'lesson') {
    return `${COURSE_BIBLE}

ЗАДАЧА
Создай один урок курса Go Backend Engineer.

Тема: ${input.lessonTopic.trim() || '[укажи тему]'}
Модуль: ${input.lessonModule.trim() || '[укажи модуль]'}
Контекст проекта: ${input.projectContext.trim() || '[укажи проект]'}
${optionalBlock('Дополнительный контекст', input.extraContext)}
Структура урока:
1. Story scene
2. Why this matters
3. Minimal theory
4. Demo
5. Hands-on practice
6. Real junior task
7. Mini challenge
8. Typical mistakes and debugging
9. Reflection

Для каждого практического шага укажи:
- что студент делает руками;
- какой файл, команду, endpoint или код меняет;
- как проверить результат;
- какой артефакт остается в проекте.

Избегай длинной теории. Давай только то, что нужно для текущей задачи.`
  }

  return `${COURSE_BIBLE}

ЗАДАЧА
Создай короткую concept card для курса Go Backend Engineer.

Концепция: ${input.concept.trim() || '[укажи концепцию]'}
${optionalBlock('Контекст проекта', input.projectContext)}${optionalBlock('Дополнительный контекст', input.extraContext)}
Это не документация Go. Карточка должна читаться за 3-5 минут и объяснять концепцию на уровне Exercism.

Структура:
1. Что это
2. Зачем нужно
3. Как работает
4. Mini example
5. Где используется в проекте курса
6. Common mistakes
7. Mini exercise

Объясняй очень просто. Оставь только то, что реально понадобится в проектах курса.`
}

