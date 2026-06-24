package data

import (
	"golanger/backend/models"
	"gorm.io/gorm"
)

func SeedSprint8to9Content(db *gorm.DB) {
	lessons := map[string]string{

		"8-1-project-requirements": `# Требование проекта: Todo-list API

Третий проект — самый серьёзный. Мы создадим **REST API для списка задач** с полноценной базой данных.

---

## Что должен уметь сервис

| Действие | Метод | URL |
|----------|-------|-----|
| Все задачи | GET | /api/tasks |
| Одна задача | GET | /api/tasks/:id |
| Создать | POST | /api/tasks |
| Обновить | PUT | /api/tasks/:id |
| Удалить | DELETE | /api/tasks/:id |

---

## Технологии

- **Go** — язык
- **PostgreSQL** — база данных
- **Docker Compose** — запуск app + БД вместе
- **Чистая архитектура** — разделение на слои

---

## Модель задачи

Каждая задача содержит:
- ID (автогенерация)
- Заголовок (title)
- Описание (description)
- Статус (status): new, in_progress, done
- Дата создания, дата обновления

---

## Результат

После этого проекта у тебя будет:
- Полноценный REST API
- Работа с PostgreSQL
- Docker Compose для запуска
- Третий репозиторий на GitHub
`,

		"8-2-simple-explanation": `# Архитектура проекта

Прежде чем писать код, разберём как будет устроен проект внутри.

---

## Слои приложения

` + "```" + `
HTTP-запрос
    ↓
Handler (обработчик)  — принимает запрос, парсит данные
    ↓
Service (бизнес-логика) — валидация, правила
    ↓
Repository (хранилище) — работа с БД
    ↓
PostgreSQL
` + "```" + `

---

## Зачем разделять на слои

1. **Handler** знает только про HTTP — не знает про БД
2. **Service** знает бизнес-правила — не знает про HTTP
3. **Repository** знает только про SQL — не знает про бизнес-логику

Это позволяет:
- Менять БД не трогая хендлеры
- Тестировать каждый слой отдельно
- Понимать где что находится

---

## Структура папок

` + "```" + `
todo-api/
├── main.go
├── handlers/
│   └── task.go
├── services/
│   └── task.go
├── repository/
│   └── task.go
├── models/
│   └── task.go
├── migrations/
│   └── 001_create_tasks.sql
├── Dockerfile
├── docker-compose.yml
└── README.md
` + "```" + `

Каждая папка — один слой. Зависимости идут только вниз: handler → service → repository.
`,

		"8-3-structs-methods": `# Структуры и методы

Структура — основной способ описания данных в Go. Модель задачи будет структурой.

---

## Объявление структуры

` + "```go" + `
type Task struct {
    ID          int       ` + "`json:\"id\"`" + `
    Title       string    ` + "`json:\"title\"`" + `
    Description string    ` + "`json:\"description\"`" + `
    Status      string    ` + "`json:\"status\"`" + `
    CreatedAt   time.Time ` + "`json:\"createdAt\"`" + `
    UpdatedAt   time.Time ` + "`json:\"updatedAt\"`" + `
}
` + "```" + `

Теги ` + "`json:\"...\"`" + ` говорят Go как называть поля при конвертации в JSON.

---

## Методы

` + "```go" + `
func (t Task) IsCompleted() bool {
    return t.Status == "done"
}

func (t *Task) Complete() {
    t.Status = "done"
    t.UpdatedAt = time.Now()
}
` + "```" + `

- **Value receiver** ` + "`(t Task)`" + ` — не меняет оригинал
- **Pointer receiver** ` + "`(t *Task)`" + ` — меняет оригинал

Правило: если метод меняет данные — pointer receiver.

---

## Конструктор

` + "```go" + `
func NewTask(title, description string) Task {
    now := time.Now()
    return Task{
        Title:       title,
        Description: description,
        Status:      "new",
        CreatedAt:   now,
        UpdatedAt:   now,
    }
}
` + "```" + `

В Go нет ключевого слова ` + "`new`" + ` для структур — вместо этого пишут функцию-конструктор.
`,

		"8-4-clean-architecture": `# Чистая архитектура

Чистая архитектура — это способ организации кода, где каждый слой имеет одну ответственность.

---

## Интерфейсы между слоями

` + "```go" + `
// repository/task.go
type TaskRepository interface {
    GetAll() ([]Task, error)
    GetByID(id int) (*Task, error)
    Create(task *Task) error
    Update(task *Task) error
    Delete(id int) error
}
` + "```" + `

` + "```go" + `
// services/task.go
type TaskService struct {
    repo TaskRepository
}

func NewTaskService(repo TaskRepository) *TaskService {
    return &TaskService{repo: repo}
}

func (s *TaskService) GetAll() ([]Task, error) {
    return s.repo.GetAll()
}
` + "```" + `

---

## Dependency Injection

Зависимости передаются снаружи, а не создаются внутри:

` + "```go" + `
// main.go
func main() {
    db := connectDB()
    repo := repository.NewPostgresTaskRepo(db)
    service := services.NewTaskService(repo)
    handler := handlers.NewTaskHandler(service)
    // ...
}
` + "```" + `

Это позволяет при тестировании подставить мок вместо реальной БД.
`,

		"8-5-sql-basics": `# Работа с SQL в Go

Go работает с базами данных через пакет ` + "`database/sql`" + ` и драйвер для конкретной БД.

---

## Подключение к PostgreSQL

` + "```go" + `
import (
    "database/sql"
    _ "github.com/jackc/pgx/v5/stdlib"
)

func connectDB() (*sql.DB, error) {
    dsn := "host=localhost port=5432 user=app password=secret dbname=todo sslmode=disable"
    db, err := sql.Open("pgx", dsn)
    if err != nil {
        return nil, err
    }
    return db, db.Ping()
}
` + "```" + `

---

## Основные операции

### SELECT

` + "```go" + `
rows, err := db.Query("SELECT id, title, status FROM tasks")
if err != nil {
    return nil, err
}
defer rows.Close()

var tasks []Task
for rows.Next() {
    var t Task
    err := rows.Scan(&t.ID, &t.Title, &t.Status)
    if err != nil {
        return nil, err
    }
    tasks = append(tasks, t)
}
` + "```" + `

### INSERT

` + "```go" + `
err := db.QueryRow(
    "INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING id",
    task.Title, task.Description, task.Status,
).Scan(&task.ID)
` + "```" + `

Всегда используй ` + "`$1, $2`" + ` (параметризованные запросы) — никогда не вставляй данные в SQL строкой. Это защита от SQL-инъекций.
`,

		"8-6-migrations": `# Миграции базы данных

Миграция — это SQL-файл, который создаёт или изменяет таблицы.

---

## Первая миграция

Создай файл ` + "`migrations/001_create_tasks.sql`" + `:

` + "```sql" + `
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
` + "```" + `

---

## Запуск миграции

Самый простой способ — выполнить файл через psql:

` + "```bash" + `
psql -U app -d todo -f migrations/001_create_tasks.sql
` + "```" + `

Или из Go при старте приложения:

` + "```go" + `
func runMigrations(db *sql.DB) error {
    migration, err := os.ReadFile("migrations/001_create_tasks.sql")
    if err != nil {
        return err
    }
    _, err = db.Exec(string(migration))
    return err
}
` + "```" + `

---

## Правила миграций

1. **Не редактируй** старые миграции — создавай новые
2. Используй ` + "`IF NOT EXISTS`" + ` чтобы миграцию можно было запускать повторно
3. Нумеруй файлы: 001_, 002_, 003_
`,

		"8-7-crud": `# CRUD-операции в Go

CRUD — Create, Read, Update, Delete. Четыре базовых операции с данными.

---

## Create (INSERT)

` + "```go" + `
func (r *PostgresRepo) Create(task *Task) error {
    return r.db.QueryRow(
        "INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        task.Title, task.Description, task.Status, task.CreatedAt, task.UpdatedAt,
    ).Scan(&task.ID)
}
` + "```" + `

## Read (SELECT)

` + "```go" + `
func (r *PostgresRepo) GetByID(id int) (*Task, error) {
    var t Task
    err := r.db.QueryRow(
        "SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE id = $1",
        id,
    ).Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.CreatedAt, &t.UpdatedAt)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &t, err
}
` + "```" + `

## Update

` + "```go" + `
func (r *PostgresRepo) Update(task *Task) error {
    task.UpdatedAt = time.Now()
    _, err := r.db.Exec(
        "UPDATE tasks SET title=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5",
        task.Title, task.Description, task.Status, task.UpdatedAt, task.ID,
    )
    return err
}
` + "```" + `

## Delete

` + "```go" + `
func (r *PostgresRepo) Delete(id int) error {
    _, err := r.db.Exec("DELETE FROM tasks WHERE id = $1", id)
    return err
}
` + "```" + `

Каждая операция — одна функция. Простой SQL, параметризованные запросы, обработка ошибок.
`,

		"8-8-middleware": `# Middleware в Go

Middleware — это функция, которая оборачивает хендлер и добавляет поведение до/после обработки запроса.

---

## Логирование запросов

` + "```go" + `
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
    })
}
` + "```" + `

## CORS

` + "```go" + `
func CORSMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        next.ServeHTTP(w, r)
    })
}
` + "```" + `

## Recovery (защита от паники)

` + "```go" + `
func RecoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("panic: %v", err)
                http.Error(w, "Internal Server Error", 500)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
` + "```" + `

## Подключение

` + "```go" + `
mux := http.NewServeMux()
mux.HandleFunc("/api/tasks", handleTasks)

handler := LoggingMiddleware(CORSMiddleware(RecoveryMiddleware(mux)))
http.ListenAndServe(":8080", handler)
` + "```" + `
`,

		"8-9-docker-compose": `# Docker Compose

Docker Compose позволяет запустить несколько сервисов одной командой — приложение и базу данных вместе.

---

## docker-compose.yml

` + "```yaml" + `
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: todo
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: "host=db port=5432 user=app password=secret dbname=todo sslmode=disable"
    depends_on:
      - db

volumes:
  pgdata:
` + "```" + `

---

## Dockerfile (напоминание)

` + "```dockerfile" + `
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
` + "```" + `

---

## Команды

` + "```bash" + `
docker compose up -d        # запустить в фоне
docker compose logs -f app   # логи приложения
docker compose down          # остановить всё
docker compose up --build    # пересобрать и запустить
` + "```" + `

После ` + "`docker compose up`" + ` у тебя работают и PostgreSQL на порту 5432, и твой API на порту 8080.
`,

		"8-10-checklist": `# Чеклист перед проектом Todo-list

Проверь, что ты понимаешь каждый пункт перед началом.

---

## Архитектура

- [ ] Понимаю разделение Handler → Service → Repository
- [ ] Могу объяснить зачем интерфейсы между слоями
- [ ] Знаю что такое dependency injection

## SQL и PostgreSQL

- [ ] Могу написать CREATE TABLE
- [ ] Умею SELECT, INSERT, UPDATE, DELETE
- [ ] Знаю про параметризованные запросы ($1, $2)
- [ ] Понимаю зачем нужны миграции

## Go

- [ ] Умею создавать структуры с JSON-тегами
- [ ] Могу подключиться к PostgreSQL из Go
- [ ] Знаю как работает database/sql (Query, QueryRow, Exec)
- [ ] Умею писать middleware

## Docker

- [ ] Могу написать Dockerfile для Go
- [ ] Понимаю docker-compose.yml
- [ ] Знаю команды docker compose up/down/logs

---

Если что-то непонятно — вернись к нужному уроку. В проекте всё это пригодится.
`,

		// ── Спринт 9. Выполнение проекта Todo-list ──

		"9-1-requirement-1": `# Шаг 1: Структура проекта и модель

Создаём проект с нуля. Первый коммит — структура папок и модель данных.

---

## Инициализация

` + "```bash" + `
mkdir todo-api && cd todo-api
go mod init todo-api
mkdir handlers services repository models migrations
` + "```" + `

## Модель задачи

Файл ` + "`models/task.go`" + `:

` + "```go" + `
package models

import "time"

type Task struct {
    ID          int       ` + "`json:\"id\"`" + `
    Title       string    ` + "`json:\"title\"`" + `
    Description string    ` + "`json:\"description\"`" + `
    Status      string    ` + "`json:\"status\"`" + `
    CreatedAt   time.Time ` + "`json:\"createdAt\"`" + `
    UpdatedAt   time.Time ` + "`json:\"updatedAt\"`" + `
}
` + "```" + `

## Миграция

Файл ` + "`migrations/001_create_tasks.sql`" + `:

` + "```sql" + `
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
` + "```" + `

## Коммит

` + "```bash" + `
git init
git add .
git commit -m "feat: project structure and Task model"
` + "```" + `
`,

		"9-2-requirement-2": `# Шаг 2: Репозиторий

Создаём слой работы с базой данных.

---

## Интерфейс

Файл ` + "`repository/task.go`" + `:

` + "```go" + `
package repository

import "todo-api/models"

type TaskRepository interface {
    GetAll() ([]models.Task, error)
    GetByID(id int) (*models.Task, error)
    Create(task *models.Task) error
    Update(task *models.Task) error
    Delete(id int) error
}
` + "```" + `

## PostgreSQL реализация

Файл ` + "`repository/postgres.go`" + `:

` + "```go" + `
package repository

import (
    "database/sql"
    "time"
    "todo-api/models"
)

type PostgresTaskRepo struct {
    db *sql.DB
}

func NewPostgresTaskRepo(db *sql.DB) *PostgresTaskRepo {
    return &PostgresTaskRepo{db: db}
}

func (r *PostgresTaskRepo) GetAll() ([]models.Task, error) {
    rows, err := r.db.Query(
        "SELECT id, title, description, status, created_at, updated_at FROM tasks ORDER BY created_at DESC",
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var tasks []models.Task
    for rows.Next() {
        var t models.Task
        if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.CreatedAt, &t.UpdatedAt); err != nil {
            return nil, err
        }
        tasks = append(tasks, t)
    }
    return tasks, nil
}

func (r *PostgresTaskRepo) Create(task *models.Task) error {
    task.CreatedAt = time.Now()
    task.UpdatedAt = time.Now()
    if task.Status == "" {
        task.Status = "new"
    }
    return r.db.QueryRow(
        "INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        task.Title, task.Description, task.Status, task.CreatedAt, task.UpdatedAt,
    ).Scan(&task.ID)
}
` + "```" + `

Методы GetByID, Update, Delete реализуются аналогично — один SQL-запрос на метод.

## Коммит

` + "```bash" + `
git add .
git commit -m "feat: TaskRepository interface and PostgreSQL implementation"
` + "```" + `
`,

		"9-3-requirement-3": `# Шаг 3: Сервис и хендлеры

Связываем всё вместе: бизнес-логика + HTTP-обработчики.

---

## Сервис

Файл ` + "`services/task.go`" + `:

` + "```go" + `
package services

import (
    "errors"
    "todo-api/models"
    "todo-api/repository"
)

type TaskService struct {
    repo repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) *TaskService {
    return &TaskService{repo: repo}
}

func (s *TaskService) Create(title, description string) (*models.Task, error) {
    if title == "" {
        return nil, errors.New("title is required")
    }
    task := &models.Task{Title: title, Description: description}
    if err := s.repo.Create(task); err != nil {
        return nil, err
    }
    return task, nil
}

func (s *TaskService) GetAll() ([]models.Task, error) {
    return s.repo.GetAll()
}
` + "```" + `

## Хендлер

Файл ` + "`handlers/task.go`" + `:

` + "```go" + `
package handlers

import (
    "encoding/json"
    "net/http"
    "todo-api/services"
)

type TaskHandler struct {
    service *services.TaskService
}

func NewTaskHandler(service *services.TaskService) *TaskHandler {
    return &TaskHandler{service: service}
}

func (h *TaskHandler) GetAll(w http.ResponseWriter, r *http.Request) {
    tasks, err := h.service.GetAll()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(tasks)
}

func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
    var input struct {
        Title       string ` + "`json:\"title\"`" + `
        Description string ` + "`json:\"description\"`" + `
    }
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "invalid JSON", http.StatusBadRequest)
        return
    }
    task, err := h.service.Create(input.Title, input.Description)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(task)
}
` + "```" + `

## Роутинг в main.go

` + "```go" + `
mux := http.NewServeMux()
mux.HandleFunc("GET /api/tasks", handler.GetAll)
mux.HandleFunc("POST /api/tasks", handler.Create)

wrapped := LoggingMiddleware(CORSMiddleware(mux))
log.Println("Server starting on :8080")
http.ListenAndServe(":8080", wrapped)
` + "```" + `

## Коммит

` + "```bash" + `
git add .
git commit -m "feat: TaskService, handlers, routing and middleware"
` + "```" + `
`,

		"9-4-requirement-4": `# Шаг 4: Docker и финальная сборка

Последний шаг — контейнеризация и проверка.

---

## Dockerfile

` + "```dockerfile" + `
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o server .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .
COPY migrations/ ./migrations/
EXPOSE 8080
CMD ["./server"]
` + "```" + `

## docker-compose.yml

` + "```yaml" + `
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: todo
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: "host=db port=5432 user=app password=secret dbname=todo sslmode=disable"
    depends_on:
      - db

volumes:
  pgdata:
` + "```" + `

## Проверка

` + "```bash" + `
docker compose up --build -d
sleep 5
curl -s http://localhost:8080/api/tasks | jq .
curl -s -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Первая задача","description":"Тестируем API"}' | jq .
` + "```" + `

## Финализация

` + "```bash" + `
git add .
git commit -m "feat: Dockerfile and docker-compose"
git tag v1.0.0
git push origin main --tags
` + "```" + `

---

Готово! У тебя теперь **3 проекта на GitHub**:
1. number-guessing-go (CLI)
2. weather-service-go (HTTP + API)
3. todo-api-go (REST + PostgreSQL + Docker)

Это и есть твоё портфолио. Переходим к доработке и карьере.
`,
	}
	for slug, content := range lessons {
		db.Model(&models.Lesson{}).Where("slug = ?", slug).Update("content", content)
	}
}
