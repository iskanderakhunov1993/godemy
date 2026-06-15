import type { BuiltInTrainerConcept } from './trainerConcepts'

type RoadmapDefinition = {
  category: string
  title: string
  slug: string
  note?: 'optional' | 'minimal'
}

const roadmapGroups: Array<{
  category: string
  concepts: Array<[title: string, slug: string, note?: RoadmapDefinition['note']]>
}> = [
  {
    category: 'Foundations',
    concepts: [
      ['Go Program Structure', 'go-program-structure'],
      ['Variables', 'variables'],
      ['Data Types', 'data-types'],
      ['Constants', 'constants'],
      ['Input / Output', 'input-output'],
      ['String Formatting', 'string-formatting'],
      ['Comments', 'comments'],
    ],
  },
  {
    category: 'Logic',
    concepts: [
      ['If / Else', 'if-else'],
      ['Switch', 'switch'],
      ['Loops', 'loops'],
      ['Range', 'range'],
      ['Comparison Operators', 'comparison-operators'],
      ['Boolean Logic', 'boolean-logic'],
    ],
  },
  {
    category: 'Functions',
    concepts: [
      ['Functions', 'functions'],
      ['Parameters', 'parameters'],
      ['Return Values', 'return-values'],
      ['Multiple Returns', 'multiple-returns'],
      ['Variadic Functions', 'variadic-functions', 'optional'],
    ],
  },
  {
    category: 'Working With Data',
    concepts: [
      ['Structs', 'structs'],
      ['Slices', 'slices'],
      ['Maps', 'maps', 'minimal'],
      ['Nested Structs', 'nested-structs', 'optional'],
    ],
  },
  {
    category: 'Packages & Project Organization',
    concepts: [
      ['Packages', 'packages'],
      ['Import', 'import'],
      ['Project Structure', 'project-structure'],
      ['Standard Library Basics', 'standard-library-basics'],
    ],
  },
  {
    category: 'Error Handling',
    concepts: [
      ['Errors', 'errors'],
      ['Error Handling (if err != nil)', 'error-handling'],
      ['Logging', 'logging'],
    ],
  },
  {
    category: 'Files & Data Storage',
    concepts: [
      ['File Handling', 'file-handling'],
      ['Reading Files', 'reading-files'],
      ['Writing Files', 'writing-files'],
      ['JSON Basics', 'json-basics'],
      ['JSON Marshal', 'json-marshal'],
      ['JSON Unmarshal', 'json-unmarshal'],
      ['Struct Tags (json:"field")', 'json-struct-tags'],
    ],
  },
  {
    category: 'HTTP & APIs',
    concepts: [
      ['HTTP Basics', 'http-basics'],
      ['HTTP Requests', 'http-requests'],
      ['HTTP Responses', 'http-responses'],
      ['Status Codes', 'status-codes'],
      ['API Endpoints', 'api-endpoints'],
      ['Query Parameters', 'query-parameters'],
      ['Request Headers', 'request-headers'],
      ['Response Parsing', 'response-parsing'],
    ],
  },
  {
    category: 'Environment',
    concepts: [['Environment Variables', 'environment-variables']],
  },
  {
    category: 'Backend Development',
    concepts: [
      ['HTTP Server', 'http-server'],
      ['Routes', 'routes'],
      ['Handlers', 'handlers'],
      ['Request Body', 'request-body'],
      ['Response Body', 'response-body'],
      ['CRUD Operations', 'crud-operations'],
      ['Validation', 'validation'],
      ['Middleware Basics', 'middleware-basics', 'minimal'],
    ],
  },
  {
    category: 'Database',
    concepts: [
      ['Database Basics', 'database-basics'],
      ['PostgreSQL Basics', 'postgresql-basics'],
      ['Tables', 'database-tables'],
      ['Rows & Columns', 'rows-columns'],
      ['SQL Basics', 'sql-basics'],
      ['SELECT', 'sql-select'],
      ['INSERT', 'sql-insert'],
      ['UPDATE', 'sql-update'],
      ['DELETE', 'sql-delete'],
      ['Database Connection', 'database-connection'],
      ['Query Execution', 'query-execution'],
      ['Scan Rows', 'scan-rows'],
    ],
  },
  {
    category: 'Testing & Debugging',
    concepts: [
      ['Reading Errors', 'reading-errors'],
      ['Debugging Basics', 'debugging-basics'],
      ['API Debugging', 'api-debugging'],
      ['Postman Basics', 'postman-basics'],
    ],
  },
  {
    category: 'Docker',
    concepts: [
      ['What is Docker', 'what-is-docker'],
      ['Image vs Container', 'image-vs-container'],
      ['Dockerfile Basics', 'dockerfile-basics'],
      ['Docker Run', 'docker-run'],
      ['Docker Compose Basics', 'docker-compose-basics', 'minimal'],
    ],
  },
  {
    category: 'Career / Real Work',
    concepts: [
      ['README', 'readme'],
      ['Git Basics', 'git-basics'],
      ['GitHub Basics', 'github-basics'],
      ['Commit Strategy', 'commit-strategy'],
      ['Branches', 'branches', 'minimal'],
      ['Pull Requests', 'pull-requests', 'minimal'],
    ],
  },
]

const definitions: RoadmapDefinition[] = roadmapGroups.flatMap((group) =>
  group.concepts.map(([title, slug, note]) => ({
    category: group.category,
    title,
    slug,
    note,
  }))
)

const excludedConcepts = [
  'interfaces',
  'goroutines',
  'channels',
  'mutex',
  'reflection',
  'regex',
  'context',
  'advanced-pointers',
  'generics',
  'advanced-testing',
  'microservices',
  'kubernetes',
  'clean-architecture',
  'advanced-docker',
]

const roadmapSlugs = new Set(definitions.map((definition) => definition.slug))
if (definitions.length !== 80 || roadmapSlugs.size !== 80) {
  throw new Error('Go concepts roadmap must contain exactly 80 unique concepts')
}
if (excludedConcepts.some((slug) => roadmapSlugs.has(slug))) {
  throw new Error('Go concepts roadmap contains an excluded advanced concept')
}

const categoryProjectMap: Record<string, string> = {
  Foundations: 'Project 1 · Limit Guard CLI',
  Logic: 'Project 1 · Limit Guard CLI',
  Functions: 'Project 1 · Limit Guard CLI',
  'Working With Data': 'Project 1 и Project 3',
  'Packages & Project Organization': 'Project 2 · Release Pipeline',
  'Error Handling': 'Все три проекта',
  'Files & Data Storage': 'Project 1 · локальное хранение',
  'HTTP & APIs': 'Project 3 · Transfer Rules API',
  Environment: 'Project 2 и Project 3',
  'Backend Development': 'Project 3 · Transfer Rules API',
  Database: 'Project 3 · PostgreSQL',
  'Testing & Debugging': 'Все три проекта',
  Docker: 'Project 2 и Project 3',
  'Career / Real Work': 'Project 2 · командная работа',
}

function codeFor(definition: RoadmapDefinition): string {
  const examples: Record<string, string> = {
    'go-program-structure': `package main

import "fmt"

func main() {
	fmt.Println("Project ZERO")
}`,
    variables: `clientID := "client-42"
amount := 45000
fmt.Println(clientID, amount)`,
    'if-else': `if amount <= limit {
	fmt.Println("approved")
} else {
	fmt.Println("rejected")
}`,
    functions: `func withinLimit(limit, amount int) bool {
	return amount <= limit
}`,
    structs: `type TransferCheck struct {
	ClientID string
	Amount   int64
}`,
    slices: `checks := []string{"approved", "rejected"}
fmt.Println(checks[0])`,
    errors: `value, err := strconv.Atoi(input)
if err != nil {
	return err
}`,
    'json-marshal': `body, err := json.Marshal(response)
if err != nil {
	return err
}`,
    'http-server': `mux := http.NewServeMux()
mux.HandleFunc("/health", healthHandler)
http.ListenAndServe(":8080", mux)`,
    'sql-select': `row := db.QueryRow(
	"SELECT daily_limit FROM client_limits WHERE client_id = $1",
	clientID,
)`,
    'docker-run': `docker build -t limit-guard .
docker run --rm -p 8080:8080 limit-guard`,
    'git-basics': `git status
git add .
git commit -m "add limit validation"`,
  }

  return examples[definition.slug] || `package main

import "fmt"

func main() {
	// ${definition.title}: примени концепцию в текущей задаче банка.
	fmt.Println("ready")
}`
}

function noteLabel(note?: RoadmapDefinition['note']): string {
  if (note === 'optional') return 'Опциональная тема: проходи, когда она понадобится проекту.'
  if (note === 'minimal') return 'Минимальный уровень: только сценарии, нужные в трёх проектах.'
  return 'Обязательная тема для одного из трёх проектов.'
}

function buildConcept(definition: RoadmapDefinition, index: number): BuiltInTrainerConcept {
  const title = definition.note
    ? `${definition.title} (${definition.note})`
    : definition.title
  const project = categoryProjectMap[definition.category]
  const syntax = codeFor(definition)
  const practiceCode = `package main

import "fmt"

func main() {
	// TODO: примени ${definition.title} в сценарии ${project}.
	fmt.Println("ready")
}`

  return {
    id: -(1000 + index),
    module: 'core',
    title,
    slug: definition.slug,
    conceptCode: String(index + 1).padStart(2, '0'),
    summary: `${definition.title}: коротко и только в объёме, который нужен для ${project}.`,
    explanation: `${noteLabel(definition.note)} Разбери форму решения, запусти пример и примени её к банковской задаче.`,
    syntax,
    examples: JSON.stringify([
      {
        title: `Минимальный пример: ${definition.title}`,
        code: syntax,
        description: `Измени пример так, чтобы он решал маленькую часть задачи из ${project}.`,
      },
    ]),
    patterns: syntax,
    order: index + 1,
    expectedOutput: 'ready',
    microSkills: [
      `узнать ${definition.title} в коде`,
      'изменить минимальный пример',
      'проверить результат руками',
    ],
    commonMistakes: [
      'учить синтаксис без текущей задачи',
      'добавлять сложность, которая пока не нужна проекту',
    ],
    relatedSprint: project,
    sections: [
      {
        title: 'Что это',
        paragraphs: [
          `${definition.title} — рабочая концепция из блока ${definition.category}.`,
          noteLabel(definition.note),
        ],
      },
      {
        title: 'Зачем сейчас',
        paragraphs: [
          `Она понадобится в ${project}. Цель карточки — дать ровно столько знаний, чтобы продолжить проект.`,
        ],
      },
      {
        title: 'Минимальный пример',
        paragraphs: ['Запусти пример, затем измени одно значение или условие и проверь результат.'],
        code: syntax,
      },
      {
        title: 'Mini exercise',
        paragraphs: [
          `Добавь применение темы «${definition.title}» в текущий проект и запиши в README, как проверить результат.`,
        ],
      },
    ],
    practiceRail: [
      {
        title: `${definition.title}: первый проход`,
        description: 'Запусти пример и объясни каждую значимую строку.',
        difficulty: 'easy',
        status: 'recommended',
      },
      {
        title: 'Банковский сценарий',
        description: `Примени концепцию в задаче из ${project}.`,
        difficulty: 'easy',
        status: 'learning',
      },
      {
        title: 'Пограничный случай',
        description: 'Найди один ошибочный ввод и обработай его явно.',
        difficulty: 'medium',
        status: 'locked',
      },
    ],
    exercises: [
      {
        id: -(2000 + index),
        level: 'beginner',
        module: 'core',
        title: `Примени ${definition.title}`,
        description: `Запусти пример, измени его под ${project} и добейся корректного результата.`,
        difficulty: 'easy',
        category: definition.category,
        starterCode: practiceCode,
        trainerLayout: '',
        hints: JSON.stringify([
          'Начни с запуска исходного примера.',
          'Меняй только одну часть за раз.',
          'Проверь результат до следующего изменения.',
        ]),
        order: index + 1,
      },
    ],
  }
}

export const goConceptRoadmap: BuiltInTrainerConcept[] = definitions.map(buildConcept)

const categoryBySlug = new Map(definitions.map((definition) => [definition.slug, definition.category]))

export function getGoConceptRoadmapItem(slug: string): BuiltInTrainerConcept | undefined {
  return goConceptRoadmap.find((concept) => concept.slug === slug)
}

export function getGoConceptCategory(slug: string): string {
  return categoryBySlug.get(slug) || 'Go'
}
