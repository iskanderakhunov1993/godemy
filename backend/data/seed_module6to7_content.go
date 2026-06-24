package data

import (
	"golanger/backend/models"
	"gorm.io/gorm"
)

func SeedModule6to7Content(db *gorm.DB) {
	lessons := map[string]string{

		// ── Спринт 10. Подготовка: доработка Todo-list ──

		"10-1-project-requirements": `# Что мы добавим в Todo-list

В модулях 3–5 ты создал три проекта: калькулятор, URL-shortener и Todo-list. Эти три проекта — твой дипломный портфель. Теперь мы сделаем Todo-list **по-настоящему production-ready**.

---

## Зачем дорабатывать

На собеседовании джуниору часто задают вопросы:

- «Ты писал тесты?»
- «Как приложение завершает работу?»
- «Как ты логируешь ошибки?»

Если ответ — «да, вот мой проект на GitHub», это сразу выделяет тебя среди кандидатов.

---

## Что именно мы добавим

| Доработка | Зачем |
|-----------|-------|
| Unit-тесты сервисного слоя | Проверяем бизнес-логику изолированно |
| Тесты обработчиков (handlers) | Проверяем HTTP-ответы без запуска сервера |
| Интеграционные тесты | Проверяем работу с реальной базой данных |
| Graceful shutdown | Сервер корректно завершает работу, не обрывая запросы |
| Структурированное логирование | Логи в формате JSON, с уровнями и контекстом |

---

## Как будет устроена работа

В этом спринте (10) мы **изучим** каждую тему. В следующем спринте (11) ты **выполнишь** доработки шаг за шагом.

Не торопись — сначала пойми, потом делай.

---

## Структура проекта после доработки

` + "```" + `
todo-app/
├── cmd/
│   └── server/
│       └── main.go          ← graceful shutdown + slog
├── internal/
│   ├── handler/
│   │   ├── todo.go
│   │   └── todo_test.go     ← handler tests
│   ├── service/
│   │   ├── todo.go
│   │   └── todo_test.go     ← unit tests + mocks
│   └── repository/
│       ├── todo.go
│       └── todo_test.go     ← integration tests
├── go.mod
├── go.sum
└── README.md
` + "```" + `

К концу работы у тебя будет проект, который не стыдно показать на собеседовании. Приступим.
`,

		"10-2-simple-explanation": `# Зачем тесты, graceful shutdown и логи

Прежде чем погружаться в код, давай разберёмся **зачем** всё это нужно. Без понимания «зачем» инструменты кажутся бессмысленной бюрократией.

---

## Тесты: страховка от самого себя

Представь: ты добавил новую функцию в Todo-list. Всё работает. Через неделю ты меняешь другую часть кода — и создание задач ломается. Без тестов ты узнаешь об этом только когда пользователь пожалуется (или на собеседовании, когда попросят показать проект).

Тесты — это **автоматическая проверка**. Ты пишешь их один раз, а потом запускаешь после каждого изменения:

` + "```" + `bash
go test ./...
` + "```" + `

Если что-то сломалось — тесты покажут где и что.

### Виды тестов

- **Unit-тесты** — проверяют одну функцию изолированно. Быстрые, простые.
- **Тесты обработчиков** — проверяют HTTP-эндпоинты без реального сервера.
- **Интеграционные тесты** — проверяют работу с реальной базой данных.

Чем больше тестов — тем увереннее ты меняешь код.

---

## Graceful shutdown: вежливое завершение

Когда ты нажимаешь Ctrl+C или сервер получает сигнал завершения (например, при деплое), есть два варианта:

1. **Грубое завершение** — процесс убивается мгновенно. Текущие запросы обрываются. Соединения с БД не закрываются.
2. **Graceful shutdown** — сервер перестаёт принимать новые запросы, дожидается завершения текущих, закрывает соединения и только потом выключается.

В продакшене нужен второй вариант. Без него каждый деплой потенциально ломает запросы пользователей.

---

## Структурированное логирование: понятные логи

Типичный лог начинающего разработчика:

` + "```" + `
started
error happened
something went wrong
` + "```" + `

Типичный лог в продакшене:

` + "```" + `json
{"time":"2025-01-15T10:30:00Z","level":"INFO","msg":"server started","port":8080}
{"time":"2025-01-15T10:30:05Z","level":"ERROR","msg":"failed to create todo","error":"duplicate title","user_id":42}
` + "```" + `

Разница очевидна. Структурированные логи можно:

- Фильтровать по уровню (INFO, WARN, ERROR)
- Искать по полям (` + "`user_id`" + `, ` + "`error`" + `)
- Парсить автоматически (JSON → системы мониторинга)

В Go с версии 1.21 есть встроенный пакет ` + "`slog`" + `, который делает это из коробки.

---

## Итог

| Инструмент | Что даёт |
|-----------|----------|
| Тесты | Уверенность, что код работает после изменений |
| Graceful shutdown | Корректное завершение без потери данных |
| Логирование | Понимание, что происходит в работающем приложении |

Это не «продвинутые темы». Это **базовые навыки**, которые ожидают от любого Go-разработчика. Теперь разберём каждый инструмент подробно.
`,

		"10-3-unit-tests": `# Unit-тесты в Go

Go имеет встроенную систему тестирования — пакет ` + "`testing`" + `. Не нужно ставить сторонние фреймворки.

---

## Правила

1. Файл с тестами заканчивается на ` + "`_test.go`" + `
2. Функция теста начинается с ` + "`Test`" + ` и принимает ` + "`*testing.T`" + `
3. Файл лежит в том же пакете, что и тестируемый код

---

## Первый тест

Допустим, у нас есть функция:

` + "```go" + `
// math.go
package mathutil

func Add(a, b int) int {
    return a + b
}
` + "```" + `

Тест для неё:

` + "```go" + `
// math_test.go
package mathutil

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2, 3) = %d, want 5", result)
    }
}
` + "```" + `

Запуск:

` + "```bash" + `
go test ./...
` + "```" + `

Вывод:

` + "```" + `
ok  	mathutil	0.003s
` + "```" + `

---

## Методы *testing.T

| Метод | Что делает |
|-------|-----------|
| ` + "`t.Errorf()`" + ` | Сообщает об ошибке, тест продолжается |
| ` + "`t.Fatalf()`" + ` | Сообщает об ошибке, тест останавливается |
| ` + "`t.Log()`" + ` | Выводит сообщение (видно при ` + "`go test -v`" + `) |
| ` + "`t.Skip()`" + ` | Пропускает тест |
| ` + "`t.Helper()`" + ` | Помечает функцию как вспомогательную (ошибки показываются на уровень выше) |

---

## Пример для Todo-list

В нашем сервисном слое есть метод создания задачи:

` + "```go" + `
// internal/service/todo.go
package service

type TodoRepository interface {
    Create(title string) (int, error)
    GetByID(id int) (*Todo, error)
}

type TodoService struct {
    repo TodoRepository
}

func NewTodoService(repo TodoRepository) *TodoService {
    return &TodoService{repo: repo}
}

func (s *TodoService) CreateTodo(title string) (int, error) {
    if title == "" {
        return 0, ErrEmptyTitle
    }
    return s.repo.Create(title)
}
` + "```" + `

Простой unit-тест:

` + "```go" + `
// internal/service/todo_test.go
package service

import "testing"

func TestCreateTodo_EmptyTitle(t *testing.T) {
    svc := NewTodoService(nil) // repo не нужен — мы до него не дойдём
    _, err := svc.CreateTodo("")
    if err != ErrEmptyTitle {
        t.Errorf("got %v, want ErrEmptyTitle", err)
    }
}
` + "```" + `

Этот тест проверяет валидацию. Он не трогает базу данных, не делает HTTP-запросов — чистый unit-тест.

---

## Запуск с флагами

` + "```bash" + `
go test ./...                 # все тесты
go test ./internal/service/   # тесты одного пакета
go test -v ./...              # подробный вывод
go test -run TestCreateTodo   # конкретный тест
go test -count=1 ./...        # без кеширования
` + "```" + `

---

## Покрытие кода

` + "```bash" + `
go test -cover ./...
` + "```" + `

Вывод покажет процент покрытия для каждого пакета. 100% — не цель. Цель — покрыть **критичную логику**.

В следующем уроке — table-driven tests, самый популярный паттерн тестирования в Go.
`,

		"10-4-table-tests": `# Table-driven тесты

Table-driven tests (табличные тесты) — **стандартный паттерн** в Go. Его используют в стандартной библиотеке, в популярных проектах и на собеседованиях.

---

## Идея

Вместо написания отдельной функции для каждого случая мы создаём **таблицу** — слайс структур, где каждый элемент описывает один тест-кейс.

---

## Пример

Тестируем функцию валидации заголовка задачи:

` + "```go" + `
func ValidateTitle(title string) error {
    if title == "" {
        return ErrEmptyTitle
    }
    if len(title) > 200 {
        return ErrTitleTooLong
    }
    return nil
}
` + "```" + `

Табличный тест:

` + "```go" + `
func TestValidateTitle(t *testing.T) {
    tests := []struct {
        name    string
        title   string
        wantErr error
    }{
        {
            name:    "valid title",
            title:   "Купить молоко",
            wantErr: nil,
        },
        {
            name:    "empty title",
            title:   "",
            wantErr: ErrEmptyTitle,
        },
        {
            name:    "title too long",
            title:   string(make([]byte, 201)),
            wantErr: ErrTitleTooLong,
        },
        {
            name:    "exactly 200 chars",
            title:   string(make([]byte, 200)),
            wantErr: nil,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateTitle(tt.title)
            if err != tt.wantErr {
                t.Errorf("ValidateTitle(%q) = %v, want %v", tt.title, err, tt.wantErr)
            }
        })
    }
}
` + "```" + `

---

## Разбор

1. **` + "`tests`" + `** — слайс анонимных структур. Каждая структура — один тест-кейс.
2. **` + "`name`" + `** — человекочитаемое описание кейса. При падении теста Go покажет это имя.
3. **` + "`t.Run()`" + `** — запускает подтест (subtest). Каждый кейс — отдельный подтест.

Вывод при запуске ` + "`go test -v`" + `:

` + "```" + `
=== RUN   TestValidateTitle
=== RUN   TestValidateTitle/valid_title
=== RUN   TestValidateTitle/empty_title
=== RUN   TestValidateTitle/title_too_long
=== RUN   TestValidateTitle/exactly_200_chars
--- PASS: TestValidateTitle (0.00s)
` + "```" + `

---

## Запуск одного подтеста

` + "```bash" + `
go test -run TestValidateTitle/empty_title
` + "```" + `

Удобно при отладке — не нужно запускать все кейсы.

---

## Паттерн для тестов с моками

Часто в таблице указывают не только входные данные, но и **поведение мока**:

` + "```go" + `
tests := []struct {
    name      string
    title     string
    mockSetup func(m *MockRepo)
    wantID    int
    wantErr   bool
}{
    {
        name:  "success",
        title: "Новая задача",
        mockSetup: func(m *MockRepo) {
            m.CreateFunc = func(title string) (int, error) {
                return 1, nil
            }
        },
        wantID:  1,
        wantErr: false,
    },
    {
        name:  "repo error",
        title: "Новая задача",
        mockSetup: func(m *MockRepo) {
            m.CreateFunc = func(title string) (int, error) {
                return 0, errors.New("db error")
            }
        },
        wantID:  0,
        wantErr: true,
    },
}
` + "```" + `

Этот подход позволяет **в одной таблице** описать и нормальные сценарии, и ошибки. Про моки подробнее — в следующем уроке.

---

## Когда использовать

- Функция принимает разные входные данные и возвращает разные результаты
- Нужно проверить граничные случаи (пустая строка, максимальная длина, nil)
- Несколько сценариев ошибки

Table-driven tests — это не «продвинутый приём». Это **дефолтный способ** писать тесты в Go.
`,

		"10-5-mocks": `# Моки: тестирование с подменой зависимостей

Unit-тест должен проверять **одну** вещь. Если сервисный слой зависит от репозитория, мы не хотим поднимать настоящую базу данных в каждом тесте. Вместо этого мы подменяем репозиторий **моком**.

---

## Интерфейсы — ключ к мокам

В Go мок работает благодаря интерфейсам. Если сервис принимает интерфейс, мы можем передать любую реализацию — настоящую или фейковую.

` + "```go" + `
// Интерфейс репозитория
type TodoRepository interface {
    Create(title string) (int, error)
    GetByID(id int) (*Todo, error)
    List() ([]Todo, error)
    Delete(id int) error
}
` + "```" + `

---

## Ручной мок

Самый простой подход — написать мок вручную:

` + "```go" + `
// internal/service/mock_test.go
package service

type MockTodoRepo struct {
    CreateFunc  func(title string) (int, error)
    GetByIDFunc func(id int) (*Todo, error)
    ListFunc    func() ([]Todo, error)
    DeleteFunc  func(id int) error
}

func (m *MockTodoRepo) Create(title string) (int, error) {
    return m.CreateFunc(title)
}

func (m *MockTodoRepo) GetByID(id int) (*Todo, error) {
    return m.GetByIDFunc(id)
}

func (m *MockTodoRepo) List() ([]Todo, error) {
    return m.ListFunc()
}

func (m *MockTodoRepo) Delete(id int) error {
    return m.DeleteFunc(id)
}
` + "```" + `

Мок реализует интерфейс ` + "`TodoRepository`" + `. Каждый метод делегирует вызов в соответствующую функцию-поле. Мы задаём поведение **в тесте**.

---

## Использование мока в тесте

` + "```go" + `
func TestCreateTodo_Success(t *testing.T) {
    mock := &MockTodoRepo{
        CreateFunc: func(title string) (int, error) {
            return 1, nil
        },
    }

    svc := NewTodoService(mock)
    id, err := svc.CreateTodo("Купить хлеб")

    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if id != 1 {
        t.Errorf("got id %d, want 1", id)
    }
}

func TestCreateTodo_RepoError(t *testing.T) {
    mock := &MockTodoRepo{
        CreateFunc: func(title string) (int, error) {
            return 0, errors.New("connection refused")
        },
    }

    svc := NewTodoService(mock)
    _, err := svc.CreateTodo("Купить хлеб")

    if err == nil {
        t.Fatal("expected error, got nil")
    }
}
` + "```" + `

---

## Проверка вызовов

Иногда важно убедиться, что мок **был вызван** и с **правильными аргументами**:

` + "```go" + `
func TestCreateTodo_PassesTitleToRepo(t *testing.T) {
    var gotTitle string
    mock := &MockTodoRepo{
        CreateFunc: func(title string) (int, error) {
            gotTitle = title
            return 1, nil
        },
    }

    svc := NewTodoService(mock)
    svc.CreateTodo("Купить хлеб")

    if gotTitle != "Купить хлеб" {
        t.Errorf("repo received title %q, want %q", gotTitle, "Купить хлеб")
    }
}
` + "```" + `

---

## Генерация моков

Для больших проектов моки генерируют автоматически:

- **` + "`mockgen`" + `** (из пакета ` + "`go.uber.org/mock`" + `) — самый популярный генератор
- **` + "`moq`" + `** — генерирует моки в стиле функций-полей (как наш ручной мок)

Для Todo-list ручных моков достаточно. Генераторы пригодятся, когда интерфейсов станет много.

---

## Правило

> Мокай только **внешние зависимости**: базу данных, HTTP-клиенты, файловую систему. Не мокай внутренние функции — это делает тесты хрупкими.

В следующем уроке — тестирование HTTP-обработчиков без запуска сервера.
`,

		"10-6-handler-tests": `# Тесты HTTP-обработчиков

Пакет ` + "`net/http/httptest`" + ` позволяет тестировать HTTP-обработчики **без запуска реального сервера**. Ты создаёшь фейковый запрос, вызываешь обработчик напрямую и проверяешь ответ.

---

## Как это работает

1. Создаёшь ` + "`httptest.NewRequest()`" + ` — фейковый HTTP-запрос
2. Создаёшь ` + "`httptest.NewRecorder()`" + ` — фейковый ` + "`ResponseWriter`" + `
3. Вызываешь обработчик
4. Проверяешь код ответа и тело

---

## Простой пример

` + "```go" + `
// internal/handler/health.go
package handler

import "net/http"

func HealthCheck(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`+ "`" + `{"status":"ok"}` + "`" + `))
}
` + "```" + `

Тест:

` + "```go" + `
// internal/handler/health_test.go
package handler

import (
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestHealthCheck(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    rec := httptest.NewRecorder()

    HealthCheck(rec, req)

    if rec.Code != http.StatusOK {
        t.Errorf("status = %d, want %d", rec.Code, http.StatusOK)
    }

    want := ` + "`" + `{"status":"ok"}` + "`" + `
    if rec.Body.String() != want {
        t.Errorf("body = %s, want %s", rec.Body.String(), want)
    }
}
` + "```" + `

---

## Тест обработчика Todo-list

Обработчик создания задачи зависит от сервиса. Мы передаём мок:

` + "```go" + `
// internal/handler/todo.go
package handler

import (
    "encoding/json"
    "net/http"
)

type TodoService interface {
    CreateTodo(title string) (int, error)
}

type TodoHandler struct {
    service TodoService
}

func NewTodoHandler(svc TodoService) *TodoHandler {
    return &TodoHandler{service: svc}
}

func (h *TodoHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Title string ` + "`json:\"title\"`" + `
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid json", http.StatusBadRequest)
        return
    }

    id, err := h.service.CreateTodo(req.Title)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]int{"id": id})
}
` + "```" + `

Тест:

` + "```go" + `
// internal/handler/todo_test.go
package handler

import (
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
)

type mockTodoService struct {
    createFunc func(title string) (int, error)
}

func (m *mockTodoService) CreateTodo(title string) (int, error) {
    return m.createFunc(title)
}

func TestTodoHandler_Create(t *testing.T) {
    tests := []struct {
        name       string
        body       string
        mockCreate func(string) (int, error)
        wantCode   int
    }{
        {
            name: "success",
            body: ` + "`" + `{"title":"Новая задача"}` + "`" + `,
            mockCreate: func(title string) (int, error) {
                return 1, nil
            },
            wantCode: http.StatusCreated,
        },
        {
            name:     "invalid json",
            body:     "not json",
            wantCode: http.StatusBadRequest,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &mockTodoService{createFunc: tt.mockCreate}
            h := NewTodoHandler(mock)

            req := httptest.NewRequest(http.MethodPost, "/todos", strings.NewReader(tt.body))
            rec := httptest.NewRecorder()

            h.Create(rec, req)

            if rec.Code != tt.wantCode {
                t.Errorf("status = %d, want %d", rec.Code, tt.wantCode)
            }
        })
    }
}
` + "```" + `

---

## Что проверять в handler-тестах

- **HTTP status code** — правильный код ответа
- **Тело ответа** — JSON содержит нужные поля
- **Content-Type** — ` + "`application/json`" + ` где нужно
- **Ошибки** — обработчик возвращает понятное сообщение

---

## Тестирование с роутером

Если используешь ` + "`chi`" + `, ` + "`gorilla/mux`" + ` или стандартный ` + "`http.ServeMux`" + `, можно тестировать весь роутер целиком:

` + "```go" + `
func TestRouter(t *testing.T) {
    router := setupRouter() // твоя функция, которая создаёт роутер
    srv := httptest.NewServer(router)
    defer srv.Close()

    resp, err := http.Get(srv.URL + "/health")
    if err != nil {
        t.Fatal(err)
    }
    if resp.StatusCode != http.StatusOK {
        t.Errorf("status = %d, want 200", resp.StatusCode)
    }
}
` + "```" + `

` + "`httptest.NewServer()`" + ` поднимает реальный HTTP-сервер на случайном порту. Полезно для тестов, которые проверяют маршрутизацию и middleware.
`,

		"10-7-integration-tests": `# Интеграционные тесты

Unit-тесты проверяют логику в изоляции. Интеграционные тесты проверяют, что **компоненты работают вместе** — в нашем случае, что репозиторий правильно взаимодействует с PostgreSQL.

---

## Отличие от unit-тестов

| | Unit-тест | Интеграционный тест |
|---|---|---|
| Скорость | Миллисекунды | Секунды |
| Зависимости | Нет (моки) | Реальная БД |
| Что проверяет | Логику | Взаимодействие с внешней системой |
| Когда запускать | Всегда | Перед мержем / на CI |

---

## Подготовка тестовой базы

Самый простой подход — отдельная база данных для тестов:

` + "```bash" + `
# Создаём тестовую БД
createdb todo_test
` + "```" + `

В тесте подключаемся к ней:

` + "```go" + `
// internal/repository/todo_test.go
package repository

import (
    "database/sql"
    "os"
    "testing"

    _ "github.com/lib/pq"
)

func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()

    dsn := os.Getenv("TEST_DATABASE_URL")
    if dsn == "" {
        dsn = "postgres://localhost:5432/todo_test?sslmode=disable"
    }

    db, err := sql.Open("postgres", dsn)
    if err != nil {
        t.Fatalf("failed to connect: %v", err)
    }

    // Очищаем таблицу перед каждым тестом
    _, err = db.Exec("TRUNCATE todos RESTART IDENTITY")
    if err != nil {
        t.Fatalf("failed to truncate: %v", err)
    }

    t.Cleanup(func() {
        db.Close()
    })

    return db
}
` + "```" + `

---

## Тест репозитория

` + "```go" + `
func TestTodoRepo_Create(t *testing.T) {
    db := setupTestDB(t)
    repo := NewTodoRepo(db)

    id, err := repo.Create("Тестовая задача")
    if err != nil {
        t.Fatalf("Create failed: %v", err)
    }
    if id == 0 {
        t.Error("expected non-zero id")
    }

    // Проверяем, что задача реально в базе
    todo, err := repo.GetByID(id)
    if err != nil {
        t.Fatalf("GetByID failed: %v", err)
    }
    if todo.Title != "Тестовая задача" {
        t.Errorf("title = %q, want %q", todo.Title, "Тестовая задача")
    }
}

func TestTodoRepo_Delete(t *testing.T) {
    db := setupTestDB(t)
    repo := NewTodoRepo(db)

    id, _ := repo.Create("Удалить меня")
    err := repo.Delete(id)
    if err != nil {
        t.Fatalf("Delete failed: %v", err)
    }

    _, err = repo.GetByID(id)
    if err == nil {
        t.Error("expected error after delete, got nil")
    }
}
` + "```" + `

---

## Build tags для разделения тестов

Чтобы интеграционные тесты не запускались без базы данных, используй build tags:

` + "```go" + `
//go:build integration

package repository
` + "```" + `

Запуск:

` + "```bash" + `
# Только unit-тесты (по умолчанию)
go test ./...

# С интеграционными тестами
go test -tags=integration ./...
` + "```" + `

---

## t.Cleanup и изоляция

Каждый тест должен работать **независимо**. Порядок запуска не гарантирован. Поэтому:

- ` + "`TRUNCATE`" + ` в начале теста — чистое состояние
- ` + "`t.Cleanup()`" + ` — закрытие ресурсов после теста
- Не рассчитывай на конкретные ID

---

## TestMain для общей настройки

Если нужно выполнить что-то **один раз** для всех тестов пакета:

` + "```go" + `
func TestMain(m *testing.M) {
    // Настройка перед всеми тестами
    db := connectDB()
    runMigrations(db)

    code := m.Run() // Запуск всех тестов

    // Очистка после всех тестов
    db.Close()
    os.Exit(code)
}
` + "```" + `

Интеграционные тесты медленнее, но они дают **реальную уверенность**, что код работает с настоящей базой данных.
`,

		"10-8-graceful-shutdown": `# Graceful shutdown

Когда сервер получает сигнал завершения (Ctrl+C, ` + "`SIGTERM`" + ` при деплое), он должен корректно завершить работу: дождаться текущих запросов и закрыть соединения.

---

## Проблема

Без graceful shutdown:

` + "```go" + `
// Плохо: сервер просто умирает
log.Fatal(http.ListenAndServe(":8080", router))
` + "```" + `

Если в момент завершения кто-то загружает данные — запрос оборвётся, данные могут быть потеряны.

---

## Решение

` + "```go" + `
package main

import (
    "context"
    "log/slog"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    router := setupRouter()

    srv := &http.Server{
        Addr:    ":8080",
        Handler: router,
    }

    // Запускаем сервер в горутине
    go func() {
        slog.Info("server started", "addr", srv.Addr)
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            slog.Error("server error", "error", err)
            os.Exit(1)
        }
    }()

    // Ждём сигнал завершения
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    sig := <-quit

    slog.Info("shutting down", "signal", sig.String())

    // Даём 10 секунд на завершение текущих запросов
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        slog.Error("shutdown error", "error", err)
        os.Exit(1)
    }

    slog.Info("server stopped")
}
` + "```" + `

---

## Разбор по шагам

### 1. Запуск в горутине

` + "`ListenAndServe`" + ` блокирует выполнение. Чтобы после него ещё обрабатывать сигналы, запускаем сервер в отдельной горутине.

### 2. Ожидание сигнала

` + "`signal.Notify`" + ` подписывается на сигналы ОС:
- ` + "`SIGINT`" + ` — Ctrl+C в терминале
- ` + "`SIGTERM`" + ` — стандартный сигнал завершения (Docker, Kubernetes, systemd)

Канал ` + "`quit`" + ` блокируется до получения сигнала.

### 3. Shutdown с таймаутом

` + "`srv.Shutdown(ctx)`" + ` делает три вещи:
1. Перестаёт принимать новые соединения
2. Ждёт завершения текущих запросов
3. Возвращает ` + "`nil`" + ` когда всё закончено (или ошибку по таймауту)

---

## Закрытие других ресурсов

Обычно кроме сервера нужно закрыть базу данных и другие соединения:

` + "```go" + `
// После srv.Shutdown:
if err := db.Close(); err != nil {
    slog.Error("db close error", "error", err)
}

slog.Info("all resources closed")
` + "```" + `

---

## Порядок закрытия

1. Перестаём принимать запросы (` + "`srv.Shutdown`" + `)
2. Ждём завершения текущих запросов
3. Закрываем соединения с БД
4. Закрываем другие ресурсы (кеши, очереди)
5. Выходим

Порядок важен: если закрыть БД раньше, чем завершатся запросы — они получат ошибку.

---

## Таймаут

10 секунд — разумный дефолт. Если запросы не завершились за это время, ` + "`Shutdown`" + ` вернёт ошибку и сервер будет остановлен принудительно. В продакшене таймаут подбирают под самый долгий запрос.

Graceful shutdown — обязательный элемент любого production-сервера. Без него каждый деплой — это лотерея.
`,

		"10-9-structured-logging": `# Структурированное логирование с slog

С Go 1.21 в стандартной библиотеке появился пакет ` + "`log/slog`" + ` — встроенное структурированное логирование. Больше не нужны сторонние библиотеки для базовых задач.

---

## Проблема обычных логов

` + "```go" + `
// Стандартный log
log.Printf("user %d created todo: %s", userID, title)
// Вывод: 2025/01/15 10:30:00 user 42 created todo: Купить хлеб
` + "```" + `

Такой лог сложно парсить автоматически. Где user ID? Где заголовок? Нужны регулярные выражения.

---

## slog: базовое использование

` + "```go" + `
import "log/slog"

// Простое сообщение
slog.Info("server started", "port", 8080)
// Вывод: 2025/01/15 10:30:00 INFO server started port=8080

// Ошибка
slog.Error("failed to create todo", "error", err, "title", title)
// Вывод: 2025/01/15 10:30:05 ERROR failed to create todo error="duplicate" title="Купить хлеб"
` + "```" + `

---

## Уровни логирования

| Уровень | Когда использовать |
|---------|-------------------|
| ` + "`slog.Debug`" + ` | Детали для отладки (не показываются по умолчанию) |
| ` + "`slog.Info`" + ` | Нормальные события: запуск, запрос обработан |
| ` + "`slog.Warn`" + ` | Что-то подозрительное, но не критичное |
| ` + "`slog.Error`" + ` | Ошибка, требует внимания |

---

## JSON-формат

Для продакшена нужен JSON — его понимают системы мониторинга (ELK, Grafana Loki):

` + "```go" + `
func main() {
    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    }))
    slog.SetDefault(logger)

    slog.Info("server started", "port", 8080)
}
` + "```" + `

Вывод:

` + "```json" + `
{"time":"2025-01-15T10:30:00Z","level":"INFO","msg":"server started","port":8080}
` + "```" + `

---

## Логгер с контекстом

Часто нужно добавлять одни и те же поля ко всем логам (например, request ID):

` + "```go" + `
// Создаём логгер с привязанными полями
reqLogger := slog.With("request_id", requestID, "method", r.Method)

reqLogger.Info("request started", "path", r.URL.Path)
// {"time":"...","level":"INFO","msg":"request started","request_id":"abc-123","method":"GET","path":"/todos"}

reqLogger.Error("handler failed", "error", err)
// {"time":"...","level":"ERROR","msg":"handler failed","request_id":"abc-123","method":"GET","error":"not found"}
` + "```" + `

---

## Middleware для логирования

` + "```go" + `
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()

        // Оборачиваем ResponseWriter для захвата status code
        wrapped := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
        next.ServeHTTP(wrapped, r)

        slog.Info("request completed",
            "method", r.Method,
            "path", r.URL.Path,
            "status", wrapped.status,
            "duration", time.Since(start).String(),
        )
    })
}

type statusRecorder struct {
    http.ResponseWriter
    status int
}

func (r *statusRecorder) WriteHeader(code int) {
    r.status = code
    r.ResponseWriter.WriteHeader(code)
}
` + "```" + `

---

## Настройка уровня через переменную окружения

` + "```go" + `
func setupLogger() {
    var level slog.Level
    switch os.Getenv("LOG_LEVEL") {
    case "debug":
        level = slog.LevelDebug
    case "warn":
        level = slog.LevelWarn
    case "error":
        level = slog.LevelError
    default:
        level = slog.LevelInfo
    }

    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: level,
    }))
    slog.SetDefault(logger)
}
` + "```" + `

В разработке можно включить ` + "`debug`" + ` для максимальной детализации. В продакшене — ` + "`info`" + ` или ` + "`warn`" + `.

` + "`slog`" + ` — это всё, что нужно для логирования в Go-проекте. Простой, встроенный, структурированный.
`,

		"10-10-checklist": `# Чек-лист: готовность к доработке

Перед тем как писать код в спринте 11, убедись, что ты понимаешь каждый пункт. Это не экзамен — это карта. Если что-то непонятно, вернись к соответствующему уроку.

---

## Тестирование

- [ ] Знаю, как создать файл ` + "`_test.go`" + ` и функцию ` + "`TestXxx`" + `
- [ ] Понимаю разницу между ` + "`t.Errorf`" + ` и ` + "`t.Fatalf`" + `
- [ ] Могу написать table-driven тест со слайсом кейсов и ` + "`t.Run`" + `
- [ ] Понимаю, зачем нужен мок и как его написать через интерфейс
- [ ] Знаю, как использовать ` + "`httptest.NewRequest`" + ` и ` + "`httptest.NewRecorder`" + `
- [ ] Понимаю разницу между unit и интеграционным тестом
- [ ] Знаю, что такое build tags и как запустить тесты с тегом

---

## Graceful shutdown

- [ ] Понимаю, зачем нужен graceful shutdown
- [ ] Знаю, как перехватить ` + "`SIGINT`" + ` и ` + "`SIGTERM`" + `
- [ ] Понимаю, что делает ` + "`srv.Shutdown(ctx)`" + `
- [ ] Знаю правильный порядок закрытия ресурсов

---

## Логирование

- [ ] Знаю разницу между ` + "`log.Printf`" + ` и ` + "`slog.Info`" + `
- [ ] Могу настроить JSON-вывод через ` + "`slog.NewJSONHandler`" + `
- [ ] Понимаю уровни логирования: Debug, Info, Warn, Error
- [ ] Могу создать логгер с контекстом через ` + "`slog.With`" + `

---

## Что мы сделаем в спринте 11

| Шаг | Что делаем | Урок |
|-----|-----------|------|
| 1 | Unit-тесты сервисного слоя с моками | 11-1 |
| 2 | Интеграционные тесты репозитория | 11-2 |
| 3 | Тесты обработчиков с httptest | 11-3 |
| 4 | Graceful shutdown + slog в main.go | 11-4 |
| 5 | README, тег v2.0.0, финальная проверка | 11-5 |

---

## Инструменты

Убедись, что у тебя установлено:

` + "```bash" + `
# Go (1.21+ для slog)
go version

# PostgreSQL запущен
pg_isready

# Тестовая база создана
createdb todo_test

# Проект компилируется
cd todo-app && go build ./...
` + "```" + `

---

## Совет

Не пытайся сделать всё идеально с первого раза. Напиши **один тест**, убедись что он проходит, потом следующий. Маленькие шаги — это нормально. Это и есть работа разработчика.

Готов? Переходи к спринту 11.
`,

		// ── Спринт 11. Выполнение: доработка Todo-list ──

		"11-1-requirement-1": `# Шаг 1: Unit-тесты сервисного слоя

Начинаем доработку Todo-list. Первый шаг — покрыть unit-тестами сервисный слой.

---

## Что тестируем

Сервисный слой содержит бизнес-логику:
- Валидация входных данных
- Вызов репозитория
- Обработка ошибок

---

## 1. Создай файл мока

Если его ещё нет, создай ` + "`internal/service/mock_test.go`" + `:

` + "```go" + `
package service

import "todo-app/internal/models"

type MockTodoRepo struct {
    CreateFunc  func(title string) (int, error)
    GetByIDFunc func(id int) (*models.Todo, error)
    ListFunc    func() ([]models.Todo, error)
    DeleteFunc  func(id int) error
}

func (m *MockTodoRepo) Create(title string) (int, error) {
    return m.CreateFunc(title)
}

func (m *MockTodoRepo) GetByID(id int) (*models.Todo, error) {
    return m.GetByIDFunc(id)
}

func (m *MockTodoRepo) List() ([]models.Todo, error) {
    return m.ListFunc()
}

func (m *MockTodoRepo) Delete(id int) error {
    return m.DeleteFunc(id)
}
` + "```" + `

---

## 2. Напиши тесты

Создай ` + "`internal/service/todo_test.go`" + `:

` + "```go" + `
package service

import (
    "errors"
    "testing"
    "todo-app/internal/models"
)

func TestCreateTodo(t *testing.T) {
    tests := []struct {
        name      string
        title     string
        mockSetup func(*MockTodoRepo)
        wantID    int
        wantErr   bool
    }{
        {
            name:  "success",
            title: "Купить хлеб",
            mockSetup: func(m *MockTodoRepo) {
                m.CreateFunc = func(title string) (int, error) {
                    return 1, nil
                }
            },
            wantID:  1,
            wantErr: false,
        },
        {
            name:    "empty title",
            title:   "",
            wantID:  0,
            wantErr: true,
        },
        {
            name:  "repo error",
            title: "Задача",
            mockSetup: func(m *MockTodoRepo) {
                m.CreateFunc = func(title string) (int, error) {
                    return 0, errors.New("db error")
                }
            },
            wantID:  0,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &MockTodoRepo{}
            if tt.mockSetup != nil {
                tt.mockSetup(mock)
            }

            svc := NewTodoService(mock)
            id, err := svc.CreateTodo(tt.title)

            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
            if id != tt.wantID {
                t.Errorf("id = %d, want %d", id, tt.wantID)
            }
        })
    }
}

func TestListTodos(t *testing.T) {
    mock := &MockTodoRepo{
        ListFunc: func() ([]models.Todo, error) {
            return []models.Todo{
                {ID: 1, Title: "Задача 1"},
                {ID: 2, Title: "Задача 2"},
            }, nil
        },
    }

    svc := NewTodoService(mock)
    todos, err := svc.ListTodos()

    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if len(todos) != 2 {
        t.Errorf("got %d todos, want 2", len(todos))
    }
}

func TestDeleteTodo(t *testing.T) {
    tests := []struct {
        name    string
        id      int
        mockErr error
        wantErr bool
    }{
        {
            name:    "success",
            id:      1,
            mockErr: nil,
            wantErr: false,
        },
        {
            name:    "not found",
            id:      999,
            mockErr: errors.New("not found"),
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &MockTodoRepo{
                DeleteFunc: func(id int) error {
                    return tt.mockErr
                },
            }
            svc := NewTodoService(mock)
            err := svc.DeleteTodo(tt.id)

            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
` + "```" + `

---

## 3. Запусти

` + "```bash" + `
go test -v ./internal/service/
` + "```" + `

Все тесты должны пройти. Если что-то падает — читай сообщение ошибки, оно покажет, какой кейс и что пошло не так.

---

## Что ты сделал

- Создал мок репозитория
- Покрыл тестами ` + "`CreateTodo`" + `, ` + "`ListTodos`" + `, ` + "`DeleteTodo`" + `
- Проверил нормальные сценарии и ошибки
- Использовал table-driven тесты

Следующий шаг — интеграционные тесты репозитория.
`,

		"11-2-requirement-2": `# Шаг 2: Интеграционные тесты репозитория

Теперь проверим, что репозиторий правильно работает с настоящей PostgreSQL.

---

## 1. Подготовка

Создай тестовую базу данных, если ещё не создал:

` + "```bash" + `
createdb todo_test
` + "```" + `

Примени миграции к тестовой базе (или используй ту же схему, что и в основной):

` + "```bash" + `
psql todo_test -f migrations/001_create_todos.sql
` + "```" + `

---

## 2. Файл тестов

Создай ` + "`internal/repository/todo_test.go`" + `:

` + "```go" + `
//go:build integration

package repository

import (
    "database/sql"
    "os"
    "testing"

    _ "github.com/lib/pq"
)

var testDB *sql.DB

func TestMain(m *testing.M) {
    dsn := os.Getenv("TEST_DATABASE_URL")
    if dsn == "" {
        dsn = "postgres://localhost:5432/todo_test?sslmode=disable"
    }

    var err error
    testDB, err = sql.Open("postgres", dsn)
    if err != nil {
        panic("failed to connect to test db: " + err.Error())
    }

    code := m.Run()
    testDB.Close()
    os.Exit(code)
}

func cleanDB(t *testing.T) {
    t.Helper()
    _, err := testDB.Exec("TRUNCATE todos RESTART IDENTITY")
    if err != nil {
        t.Fatalf("failed to clean db: %v", err)
    }
}

func TestCreate(t *testing.T) {
    cleanDB(t)
    repo := NewTodoRepo(testDB)

    id, err := repo.Create("Интеграционный тест")
    if err != nil {
        t.Fatalf("Create failed: %v", err)
    }
    if id == 0 {
        t.Error("expected non-zero id")
    }
}

func TestGetByID(t *testing.T) {
    cleanDB(t)
    repo := NewTodoRepo(testDB)

    id, _ := repo.Create("Найди меня")
    todo, err := repo.GetByID(id)
    if err != nil {
        t.Fatalf("GetByID failed: %v", err)
    }
    if todo.Title != "Найди меня" {
        t.Errorf("title = %q, want %q", todo.Title, "Найди меня")
    }
}

func TestGetByID_NotFound(t *testing.T) {
    cleanDB(t)
    repo := NewTodoRepo(testDB)

    _, err := repo.GetByID(99999)
    if err == nil {
        t.Error("expected error for non-existent id")
    }
}

func TestList(t *testing.T) {
    cleanDB(t)
    repo := NewTodoRepo(testDB)

    repo.Create("Задача 1")
    repo.Create("Задача 2")
    repo.Create("Задача 3")

    todos, err := repo.List()
    if err != nil {
        t.Fatalf("List failed: %v", err)
    }
    if len(todos) != 3 {
        t.Errorf("got %d todos, want 3", len(todos))
    }
}

func TestDelete(t *testing.T) {
    cleanDB(t)
    repo := NewTodoRepo(testDB)

    id, _ := repo.Create("Удали меня")
    err := repo.Delete(id)
    if err != nil {
        t.Fatalf("Delete failed: %v", err)
    }

    _, err = repo.GetByID(id)
    if err == nil {
        t.Error("expected error after delete")
    }
}
` + "```" + `

---

## 3. Запуск

` + "```bash" + `
# Обычный go test не запустит эти тесты (build tag)
go test ./internal/repository/
# ok (0 тестов)

# С тегом integration:
go test -tags=integration -v ./internal/repository/
` + "```" + `

---

## Зачем build tag

Интеграционные тесты требуют запущенной базы данных. На CI-сервере база есть, но если коллега клонирует проект и запустит ` + "`go test ./...`" + ` — тесты без базы просто не запустятся, а не упадут с ошибкой.

---

## Что ты сделал

- Настроил тестовую базу данных
- Написал тесты для всех CRUD-операций
- Каждый тест начинает с чистой таблицы
- Использовал build tag для изоляции

Следующий шаг — тесты HTTP-обработчиков.
`,

		"11-3-requirement-3": `# Шаг 3: Тесты обработчиков

Теперь проверим HTTP-обработчики. Мы не поднимаем сервер — используем ` + "`httptest`" + `.

---

## 1. Мок сервиса

Обработчик зависит от сервиса. Создай мок в ` + "`internal/handler/mock_test.go`" + `:

` + "```go" + `
package handler

import "todo-app/internal/models"

type MockTodoService struct {
    CreateFunc func(title string) (int, error)
    ListFunc   func() ([]models.Todo, error)
    GetFunc    func(id int) (*models.Todo, error)
    DeleteFunc func(id int) error
}

func (m *MockTodoService) CreateTodo(title string) (int, error) {
    return m.CreateFunc(title)
}

func (m *MockTodoService) ListTodos() ([]models.Todo, error) {
    return m.ListFunc()
}

func (m *MockTodoService) GetTodo(id int) (*models.Todo, error) {
    return m.GetFunc(id)
}

func (m *MockTodoService) DeleteTodo(id int) error {
    return m.DeleteFunc(id)
}
` + "```" + `

---

## 2. Тесты

Создай ` + "`internal/handler/todo_test.go`" + `:

` + "```go" + `
package handler

import (
    "encoding/json"
    "errors"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
    "todo-app/internal/models"
)

func TestCreateHandler(t *testing.T) {
    tests := []struct {
        name     string
        body     string
        mockFunc func(string) (int, error)
        wantCode int
    }{
        {
            name: "success",
            body: ` + "`" + `{"title":"Новая задача"}` + "`" + `,
            mockFunc: func(title string) (int, error) {
                return 1, nil
            },
            wantCode: http.StatusCreated,
        },
        {
            name:     "invalid json",
            body:     "broken",
            wantCode: http.StatusBadRequest,
        },
        {
            name: "service error",
            body: ` + "`" + `{"title":"Задача"}` + "`" + `,
            mockFunc: func(title string) (int, error) {
                return 0, errors.New("service error")
            },
            wantCode: http.StatusInternalServerError,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &MockTodoService{CreateFunc: tt.mockFunc}
            h := NewTodoHandler(mock)

            req := httptest.NewRequest(http.MethodPost, "/todos", strings.NewReader(tt.body))
            req.Header.Set("Content-Type", "application/json")
            rec := httptest.NewRecorder()

            h.Create(rec, req)

            if rec.Code != tt.wantCode {
                t.Errorf("status = %d, want %d", rec.Code, tt.wantCode)
            }
        })
    }
}

func TestListHandler(t *testing.T) {
    mock := &MockTodoService{
        ListFunc: func() ([]models.Todo, error) {
            return []models.Todo{
                {ID: 1, Title: "Задача 1"},
                {ID: 2, Title: "Задача 2"},
            }, nil
        },
    }
    h := NewTodoHandler(mock)

    req := httptest.NewRequest(http.MethodGet, "/todos", nil)
    rec := httptest.NewRecorder()

    h.List(rec, req)

    if rec.Code != http.StatusOK {
        t.Errorf("status = %d, want %d", rec.Code, http.StatusOK)
    }

    var todos []models.Todo
    if err := json.NewDecoder(rec.Body).Decode(&todos); err != nil {
        t.Fatalf("failed to decode response: %v", err)
    }
    if len(todos) != 2 {
        t.Errorf("got %d todos, want 2", len(todos))
    }
}

func TestDeleteHandler(t *testing.T) {
    tests := []struct {
        name     string
        mockErr  error
        wantCode int
    }{
        {
            name:     "success",
            mockErr:  nil,
            wantCode: http.StatusNoContent,
        },
        {
            name:     "not found",
            mockErr:  errors.New("not found"),
            wantCode: http.StatusNotFound,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mock := &MockTodoService{
                DeleteFunc: func(id int) error {
                    return tt.mockErr
                },
            }
            h := NewTodoHandler(mock)

            req := httptest.NewRequest(http.MethodDelete, "/todos/1", nil)
            rec := httptest.NewRecorder()

            h.Delete(rec, req)

            if rec.Code != tt.wantCode {
                t.Errorf("status = %d, want %d", rec.Code, tt.wantCode)
            }
        })
    }
}
` + "```" + `

---

## 3. Запуск

` + "```bash" + `
go test -v ./internal/handler/
` + "```" + `

---

## Что проверить

- Код ответа для каждого сценария
- Тело ответа содержит нужные данные
- Обработчик корректно обрабатывает невалидный JSON
- Ошибки сервиса пробрасываются с правильным HTTP-статусом

---

## Что ты сделал

- Создал мок сервисного слоя
- Покрыл тестами создание, список и удаление
- Проверил успешные и ошибочные сценарии
- Всё работает без реального сервера и базы данных

Следующий шаг — graceful shutdown и структурированное логирование.
`,

		"11-4-requirement-4": `# Шаг 4: Graceful shutdown и структурированное логирование

Обновляем ` + "`main.go`" + ` — добавляем корректное завершение и нормальные логи.

---

## До (типичный main.go новичка)

` + "```go" + `
package main

import (
    "fmt"
    "log"
    "net/http"
)

func main() {
    router := setupRouter()
    fmt.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
` + "```" + `

---

## После (production-ready main.go)

` + "```go" + `
package main

import (
    "context"
    "log/slog"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    // 1. Настройка логирования
    setupLogger()

    // 2. Подключение к базе данных
    db, err := connectDB()
    if err != nil {
        slog.Error("failed to connect to database", "error", err)
        os.Exit(1)
    }
    slog.Info("database connected")

    // 3. Инициализация зависимостей
    router := setupRouter(db)

    // 4. Настройка сервера
    srv := &http.Server{
        Addr:         ":8080",
        Handler:      router,
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // 5. Запуск сервера в горутине
    go func() {
        slog.Info("server started", "addr", srv.Addr)
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            slog.Error("server failed", "error", err)
            os.Exit(1)
        }
    }()

    // 6. Ожидание сигнала завершения
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    sig := <-quit
    slog.Info("shutdown signal received", "signal", sig.String())

    // 7. Graceful shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        slog.Error("server shutdown failed", "error", err)
        os.Exit(1)
    }
    slog.Info("server stopped gracefully")

    // 8. Закрытие базы данных
    if err := db.Close(); err != nil {
        slog.Error("database close failed", "error", err)
    }
    slog.Info("database connection closed")
}

func setupLogger() {
    var level slog.Level
    switch os.Getenv("LOG_LEVEL") {
    case "debug":
        level = slog.LevelDebug
    case "warn":
        level = slog.LevelWarn
    case "error":
        level = slog.LevelError
    default:
        level = slog.LevelInfo
    }

    handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: level,
    })
    slog.SetDefault(slog.New(handler))
}
` + "```" + `

---

## Что изменилось

| Было | Стало |
|------|-------|
| ` + "`fmt.Println`" + ` | ` + "`slog.Info`" + ` с полями |
| ` + "`log.Fatal`" + ` | Graceful shutdown через ` + "`srv.Shutdown`" + ` |
| Нет таймаутов | ReadTimeout, WriteTimeout, IdleTimeout |
| БД не закрывается | ` + "`db.Close()`" + ` после остановки сервера |

---

## Замена log на slog в остальном коде

Пройдись по всему проекту и замени:

` + "```go" + `
// Было
log.Printf("created todo: %d", id)
log.Println("error:", err)

// Стало
slog.Info("todo created", "id", id)
slog.Error("operation failed", "error", err)
` + "```" + `

---

## Проверка

Запусти сервер и проверь:

` + "```bash" + `
go run ./cmd/server/

# В другом терминале:
curl -X POST http://localhost:8080/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Тестовая задача"}'

# В логах сервера увидишь JSON:
# {"time":"...","level":"INFO","msg":"request completed","method":"POST","path":"/todos","status":201,...}
` + "```" + `

Нажми Ctrl+C — сервер завершится корректно:

` + "```json" + `
{"time":"...","level":"INFO","msg":"shutdown signal received","signal":"interrupt"}
{"time":"...","level":"INFO","msg":"server stopped gracefully"}
{"time":"...","level":"INFO","msg":"database connection closed"}
` + "```" + `

---

## Что ты сделал

- Добавил структурированное логирование через ` + "`slog`" + `
- Настроил JSON-вывод логов
- Реализовал graceful shutdown с таймаутом
- Добавил таймауты сервера
- Корректно закрываешь все ресурсы

Остался последний шаг — финальная сборка.
`,

		"11-5-final-build": `# Шаг 5: Финальная сборка

Последний шаг — приведи проект в порядок и создай финальный релиз.

---

## 1. Обнови README.md

README — первое, что видит рекрутер или другой разработчик. Обнови его:

` + "```markdown" + `
# Todo App

REST API для управления задачами на Go.

## Стек

- Go 1.21+
- PostgreSQL
- net/http (стандартная библиотека)
- slog (структурированное логирование)

## Запуск

` + "```" + `bash
# Клонируй репозиторий
git clone https://github.com/username/todo-app.git
cd todo-app

# Создай базу данных
createdb todo_db
psql todo_db -f migrations/001_create_todos.sql

# Запусти сервер
go run ./cmd/server/
` + "```" + `

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /todos | Список всех задач |
| POST | /todos | Создать задачу |
| GET | /todos/:id | Получить задачу |
| DELETE | /todos/:id | Удалить задачу |
| GET | /health | Health check |

## Тестирование

` + "```" + `bash
# Unit-тесты
go test ./...

# Интеграционные тесты (нужна тестовая БД)
createdb todo_test
go test -tags=integration ./...

# Покрытие
go test -cover ./...
` + "```" + `

## Архитектура

- **handler** — HTTP-обработчики
- **service** — бизнес-логика
- **repository** — работа с БД
- **Graceful shutdown** — корректное завершение
- **slog** — структурированные логи в JSON
` + "```" + `

---

## 2. Проверь всё

` + "```bash" + `
# Код компилируется
go build ./...

# Линтер не ругается (если установлен)
golangci-lint run ./...

# Unit-тесты проходят
go test ./...

# Интеграционные тесты проходят
go test -tags=integration ./...

# Сервер запускается и отвечает
go run ./cmd/server/ &
curl http://localhost:8080/health
kill %1
` + "```" + `

---

## 3. Создай коммит и тег

` + "```bash" + `
git add .
git commit -m "feat: add tests, graceful shutdown, structured logging"

# Тег v2.0.0 — значительное улучшение
git tag v2.0.0
git push origin main --tags
` + "```" + `

---

## 4. Проверь GitHub

Зайди в свой репозиторий на GitHub и убедись:

- [ ] README отображается корректно
- [ ] Все файлы на месте
- [ ] Тег v2.0.0 виден в разделе Releases

---

## Итог модуля 6

Ты взял рабочий проект Todo-list и сделал его **production-ready**:

| Что добавлено | Зачем |
|--------------|-------|
| Unit-тесты сервиса | Проверка бизнес-логики |
| Интеграционные тесты | Проверка работы с БД |
| Handler-тесты | Проверка HTTP-слоя |
| Graceful shutdown | Корректное завершение |
| slog | Понятные логи |
| README | Документация для других |

У тебя теперь **три проекта** на GitHub:
1. Калькулятор (CLI)
2. URL-shortener (HTTP + PostgreSQL)
3. Todo-list (HTTP + PostgreSQL + тесты + логи + graceful shutdown)

Это и есть твой дипломный портфель. Переходим к модулю 7 — подготовка к карьере.
`,

		// ── Спринт 12. Карьера ──

		"12-1-review": `# Как искать вакансии

Ты прошёл курс, у тебя три проекта на GitHub. Теперь нужно найти первую работу. Этот урок — практическое руководство: где искать, что смотреть, как откликаться.

---

## Где искать вакансии Go-разработчика

### 1. hh.ru

Самая большая база вакансий в СНГ. Ищи по запросам:
- «Go разработчик»
- «Golang developer»
- «Backend developer Go»
- «Junior Go»

Фильтруй по опыту «нет опыта» или «1–3 года» — многие компании указывают 1–3 года, но рассматривают джунов с хорошим портфолио.

### 2. Telegram-каналы

- **Golang Jobs** — вакансии Go
- **Go Vacancy** — ещё один канал с вакансиями
- **Remote IT** — удалённые вакансии, часто Go

Подпишись и просматривай каждый день. Вакансии уходят быстро.

### 3. LinkedIn

Заведи профиль, если его нет. Укажи «Go Developer» в заголовке. Рекрутеры ищут кандидатов по ключевым словам — если у тебя в профиле есть Go, PostgreSQL, REST API — тебя найдут.

### 4. GitHub Jobs и другие площадки

- Хабр Карьера (career.habr.com)
- Getmatch
- Буду (budu.jobs)

---

## На что смотреть в вакансии

### Хорошие знаки

- «Рассматриваем начинающих разработчиков»
- Упоминаются технологии, которые ты знаешь: Go, PostgreSQL, REST API, Docker
- Есть наставничество или code review
- Описана конкретная задача, а не список из 20 технологий

### Плохие знаки

- «Fullstack Go + React + DevOps + ML» — ищут одного человека на всё
- «Зарплата по результатам собеседования» без вилки — часто экономят
- Требуют 5+ лет Go от junior — не понимают, что ищут

---

## Как откликаться

### 1. Пиши сопроводительное письмо

Не отправляй пустой отклик. Напиши 3–5 предложений:

> Здравствуйте! Я начинающий Go-разработчик. Прошёл курс по Go, написал три проекта: CLI-калькулятор, URL-shortener и Todo-list с тестами и graceful shutdown. Все проекты на GitHub: [ссылка]. Готов к тестовому заданию.

### 2. Откликайся на всё подходящее

Не жди идеальную вакансию. Отправляй 5–10 откликов в день. Первая работа — это не навсегда. Задача — попасть в команду и начать набирать опыт.

### 3. Не фильтруй себя

Видишь «опыт от 1 года» — откликайся. Видишь «знание Docker» (ты его учил) — откликайся. Многие требования в вакансиях — это wish list, а не жёсткие критерии.

---

## Сколько времени занимает поиск

Реалистичные ожидания:
- **2–4 недели** — активные отклики каждый день
- **50–100 откликов** — нормальное количество до первого оффера
- **3–5 собеседований** — прежде чем получишь предложение

Это не значит, что ты плохой. Это нормальный процесс для junior-разработчика. Не сдавайся после 10 отказов.

---

## План действий

1. Обнови профиль на hh.ru и LinkedIn
2. Подпишись на 3–5 Telegram-каналов с вакансиями
3. Каждый день отправляй минимум 5 откликов
4. Параллельно решай задачи в тренажёре (об этом — в следующих уроках)

Поиск работы — это тоже работа. Относись к нему серьёзно, и результат придёт.
`,

		"12-2-job-market": `# Вопросы на собеседованиях

Ты получил приглашение на собеседование — поздравляю. Теперь нужно подготовиться. В этом уроке — типичные вопросы, которые задают Go-разработчикам на junior-позиции.

---

## Формат собеседований

Обычно собеседование состоит из:

1. **Знакомство** (5–10 мин) — расскажи о себе, почему Go, что делал
2. **Теоретические вопросы** (15–30 мин) — язык, концепции, инструменты
3. **Практическая задача** (20–40 мин) — написать код или разобрать пример
4. **Вопросы от тебя** (5–10 мин) — спрашивай про команду, задачи, стек

---

## Типичные вопросы по Go

### Основы языка

- Чем ` + "`var x int`" + ` отличается от ` + "`x := 0`" + `?
- Что такое zero value? Какое zero value у string, int, slice, map, pointer?
- Чем массив отличается от слайса?
- Что произойдёт, если обратиться к nil map на запись?
- Как работает ` + "`defer`" + `? В каком порядке выполняются несколько defer?

### Горутины и конкурентность

- Что такое горутина? Чем отличается от потока ОС?
- Что такое канал? Чем буферизованный канал отличается от небуферизованного?
- Что произойдёт при записи в закрытый канал?
- Что такое deadlock? Приведи пример.
- Для чего нужен ` + "`sync.WaitGroup`" + `?
- Что делает ` + "`select`" + `?

### Интерфейсы и типы

- Как в Go реализуются интерфейсы? Нужно ли явное объявление?
- Что такое пустой интерфейс ` + "`interface{}`" + ` (или ` + "`any`" + `)?
- Чем отличается value receiver от pointer receiver?
- Что такое type assertion и type switch?

### Обработка ошибок

- Как обрабатываются ошибки в Go? Почему нет исключений?
- Что такое ` + "`errors.Is`" + ` и ` + "`errors.As`" + `?
- Как создать свой тип ошибки?
- Что делает ` + "`panic`" + `? Когда уместно использовать?

### Работа с пакетами и модулями

- Что такое ` + "`go.mod`" + `?
- Как импортировать пакет? Что означает путь импорта?
- Как работает видимость в Go (экспортированное vs неэкспортированное)?

---

## Вопросы по инструментам и практикам

- Как запустить тесты? Что такое table-driven tests?
- Как работает ` + "`httptest`" + `?
- Что такое graceful shutdown и зачем он нужен?
- Для чего нужен Docker в разработке?
- Что такое миграции базы данных?

---

## Практические задачи

На собеседовании могут попросить:

### Задача 1: Развернуть строку

` + "```go" + `
func Reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}
` + "```" + `

Почему ` + "`[]rune`" + `, а не ` + "`[]byte`" + `? Потому что строка может содержать Unicode-символы (кириллица, эмодзи), и один символ может занимать несколько байт.

### Задача 2: Найти дубликаты в слайсе

` + "```go" + `
func FindDuplicates(nums []int) []int {
    seen := make(map[int]bool)
    var duplicates []int
    for _, n := range nums {
        if seen[n] {
            duplicates = append(duplicates, n)
        }
        seen[n] = true
    }
    return duplicates
}
` + "```" + `

### Задача 3: Реализовать конкурентный счётчик

` + "```go" + `
type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

func (c *Counter) Value() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.value
}
` + "```" + `

---

## Как отвечать, если не знаешь

- «Я с этим пока не работал, но понимаю концепцию...»
- «Я бы начал с документации...»
- Не придумывай — честность ценится больше, чем неуверенный блеф

---

## Как готовиться

1. Прочитай этот список вопросов и ответь на каждый
2. Те, где запнулся — перечитай соответствующий урок
3. Решай задачи в тренажёре (следующий урок)
4. Практикуйся объяснять код вслух — это навык

Собеседование — это не экзамен. Это разговор. Компания хочет понять, умеешь ли ты думать и учиться. Покажи это.
`,

		"12-3-resume": `# Тренажёр и практика

Знать теорию — полдела. Нужно **набить руку**. Код должен литься из пальцев без пауз на «как объявить слайс» или «как написать цикл». Для этого нужна практика.

---

## Тренажёр Godemy

На платформе Godemy есть встроенный тренажёр с задачами по Go. Каждая задача:

- Имеет описание и шаблон кода
- Проверяется автоматически
- Покрывает конкретную тему

### Какие задачи там есть

| Тема | Примеры задач |
|------|-------------|
| Переменные и типы | Swap двух переменных, конвертация типов |
| Строки | Подсчёт слов, палиндром, реверс строки |
| Слайсы и map | Фильтрация, поиск дубликатов, группировка |
| Структуры | Создание типов, методы, интерфейсы |
| Горутины | Параллельный подсчёт, worker pool |
| Обработка ошибок | Валидация, кастомные ошибки, обёртки |

---

## Зачем решать задачи, если есть проекты

Проекты показывают, что ты умеешь **строить**. Задачи показывают, что ты умеешь **думать**. На собеседовании будут и то, и другое.

Типичная ситуация: тебе дают задачу на 15 минут. Ты знаешь решение, но руки не помнят синтаксис. Ты тратишь 5 минут на то, чтобы вспомнить, как объявить map. Это нервирует и тебя, и собеседующего.

Решение — **повторение**. Чем больше задач ты решил, тем увереннее пишешь код.

---

## Как тренироваться

### 1. Начни с тренажёра Godemy

Реши все доступные задачи. Начни с простых — даже если кажется, что ты это знаешь. Скорость выполнения тоже важна.

### 2. Дополнительные ресурсы

Если хочешь ещё больше практики:

- **Exercism** (exercism.org/tracks/go) — бесплатный трек по Go с менторами
- **LeetCode** — алгоритмические задачи (решай на Go)
- **Codewars** — задачи разной сложности
- **Go by Example** (gobyexample.com) — примеры кода по каждой теме

### 3. Повторяй вопросы из предыдущего урока

Открой урок «Вопросы на собеседованиях» и для каждого вопроса:
- Ответь вслух (или напиши ответ)
- Напиши пример кода в IDE
- Убедись, что код компилируется и работает

---

## Режим тренировки

Выдели **1–2 часа в день** на практику. Распредели время:

| Время | Что делать |
|-------|-----------|
| 30 мин | Задачи в тренажёре Godemy |
| 30 мин | 2–3 задачи на LeetCode (Easy) |
| 30 мин | Повторение теории + вопросы вслух |

---

## Не гонись за сложностью

Джуниору не нужно решать задачи уровня Hard на LeetCode. Достаточно:

- **Easy** — решаешь уверенно за 10–15 минут
- **Medium** — понимаешь подход, можешь написать за 30 минут

Если Easy вызывает трудности — это нормально. Решай больше Easy, пока не станет легко.

---

## Мышечная память программиста

Когда ты в 50-й раз пишешь:

` + "```go" + `
for i, v := range slice {
    // ...
}
` + "```" + `

Ты больше не думаешь о синтаксисе. Руки пишут сами. Голова свободна для **логики**. Это и есть цель тренировки — убрать задержку между «знаю» и «пишу».

---

## План на ближайшие 2 недели

- [ ] Решить все задачи в тренажёре Godemy
- [ ] Решить 20 задач на LeetCode Easy
- [ ] Пройтись по всем вопросам из урока 12-2
- [ ] Каждый день писать код минимум 1 час

Практика — это не опция. Это обязательная часть подготовки к работе.
`,

		"12-4-portfolio": `# Легенда: год опыта

Закрой глаза и представь. Прошёл год с момента, как ты устроился на работу Go-разработчиком. Как выглядит твой рабочий день?

---

## 09:00 — Начало дня

Ты открываешь ноутбук, наливаешь кофе. В Slack пришло сообщение от тимлида: «Посмотри, что с тестами на CI — красные». Ты открываешь GitHub, смотришь лог CI-пайплайна. Один интеграционный тест упал — ` + "`TestCreateOrder_DuplicateEmail`" + `. Знакомо? Ты писал такие тесты в модуле 6.

---

## 09:30 — Дейли

Короткий созвон на 15 минут. Каждый рассказывает, что сделал вчера и что планирует сегодня.

Ты говоришь: «Вчера закончил ручку для обновления профиля. Сегодня напишу тесты и сделаю PR».

Ручка — это HTTP-обработчик. PR — pull request. Ты знаешь эти термины, потому что делал это в проектах на курсе.

---

## 10:00 — Код

Ты открываешь VS Code. Задача: добавить эндпоинт ` + "`PUT /api/users/:id`" + `. Нужно:

1. Добавить метод в репозиторий — SQL-запрос ` + "`UPDATE`" + `
2. Добавить метод в сервис — валидация + вызов репозитория
3. Добавить обработчик — парсинг JSON, вызов сервиса, возврат ответа

Тебе не нужно гуглить «как написать обработчик в Go». Ты написал десятки таких — в URL-shortener, в Todo-list.

` + "```go" + `
func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
    var req UpdateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid json", http.StatusBadRequest)
        return
    }
    // ...
}
` + "```" + `

Знакомый код? Ты писал точно такой же.

---

## 12:00 — Code Review

Коллега отправил PR. Тебя попросили посмотреть. Ты видишь:

` + "```go" + `
func GetUser(id int) (*User, error) {
    // ...
    if err != nil {
        return nil, err
    }
    return user, nil
}
` + "```" + `

Обычный Go-код. Ты понимаешь каждую строку. Оставляешь комментарий: «Может добавить ` + "`fmt.Errorf(\"GetUser: %w\", err)`" + ` для обёртки ошибки?» Тимлид ставит лайк.

---

## 14:00 — Тесты

Ты пишешь тесты для своего обработчика:

` + "```go" + `
func TestUpdateUser_Success(t *testing.T) {
    mock := &MockUserService{
        UpdateFunc: func(id int, req UpdateRequest) error {
            return nil
        },
    }
    h := NewUserHandler(mock)

    body := strings.NewReader(` + "`" + `{"name":"Новое имя"}` + "`" + `)
    req := httptest.NewRequest(http.MethodPut, "/users/1", body)
    rec := httptest.NewRecorder()

    h.Update(rec, req)

    if rec.Code != http.StatusOK {
        t.Errorf("status = %d, want 200", rec.Code)
    }
}
` + "```" + `

Table-driven тесты, моки, httptest — ты делал это в модуле 6. На работе — тот же подход, другие названия.

---

## 16:00 — Деплой

Твой PR одобрен. Ты мержишь в main. CI запускает тесты, собирает Docker-образ, деплоит на staging. Ты проверяешь логи:

` + "```json" + `
{"time":"...","level":"INFO","msg":"user updated","user_id":42,"method":"PUT"}
` + "```" + `

Структурированные логи. ` + "`slog`" + `. Всё как ты настраивал.

---

## 17:00 — Конец дня

Ты закрываешь ноутбук. За сегодня ты:

- Починил упавший тест
- Написал обработчик, сервис и репозиторий
- Сделал code review
- Покрыл код тестами
- Задеплоил на staging

---

## Это не фантазия

Всё, что описано выше — **реальные задачи** junior Go-разработчика. И ты уже умеешь всё это:

| Рабочая задача | Где ты это делал |
|---------------|-----------------|
| HTTP-обработчики | URL-shortener, Todo-list |
| Работа с PostgreSQL | URL-shortener, Todo-list |
| Тесты с моками | Модуль 6 |
| Graceful shutdown | Модуль 6 |
| Логирование | Модуль 6 |
| Docker | Модуль 5 |
| Git и PR | Каждый проект |

Разница между тобой и «разработчиком с годом опыта» — только в количестве повторений. Навыки — те же. Инструменты — те же. Код — тот же.

Теперь оформим это в резюме.
`,

		"12-5-interviews": `# Твоё резюме

Резюме — это не биография. Это **рекламный буклет**, который за 30 секунд должен убедить рекрутера пригласить тебя на собеседование. Давай разберём, как его составить.

---

## Пример резюме

Вот как может выглядеть резюме выпускника Godemy:

---

### Алексей Петров

**Go-разработчик (Junior)**

Москва | petrov.dev@gmail.com | github.com/apetrov | t.me/apetrov

---

**О себе**

Начинающий Go-разработчик. Прошёл практический курс по Go: написал 3 проекта с нуля, покрыл код тестами, работал с PostgreSQL, Docker, REST API. Ищу позицию junior Go-разработчика в команде с code review и наставничеством.

---

**Навыки**

- Go: горутины, каналы, интерфейсы, обработка ошибок, тестирование
- PostgreSQL: SQL-запросы, миграции, работа через database/sql
- HTTP: REST API, middleware, httptest, graceful shutdown
- Инструменты: Git, Docker, slog, go test, golangci-lint

---

**Проекты**

**Todo App** — REST API для управления задачами
- Go, PostgreSQL, net/http
- CRUD-операции, unit/интеграционные тесты, graceful shutdown, slog
- GitHub: github.com/apetrov/todo-app

**URL Shortener** — сервис сокращения ссылок
- Go, PostgreSQL, net/http
- Генерация коротких ссылок, редиректы, PostgreSQL хранилище
- GitHub: github.com/apetrov/url-shortener

**Go Calculator** — CLI-калькулятор
- Go, стандартная библиотека
- Парсинг выражений, арифметические операции, обработка ошибок
- GitHub: github.com/apetrov/go-calculator

---

**Образование**

Godemy — Практический курс по Go (2025)

---

## Разбор по секциям

### Заголовок и контакты

- **Имя** — крупно
- **Позиция** — «Go-разработчик (Junior)». Не «программист», не «fullstack». Конкретно.
- **Контакты** — email, GitHub, Telegram. GitHub **обязателен** — это твоё портфолио.

### О себе (3–4 предложения)

Не пиши «ответственный, коммуникабельный, стрессоустойчивый». Пиши конкретику:
- Что умеешь
- Что делал
- Что ищешь

**Плохо:** «Целеустремлённый и быстрообучаемый разработчик»
**Хорошо:** «Написал 3 проекта на Go с тестами, PostgreSQL и Docker»

### Навыки

Перечисляй технологии, которые реально использовал. Не добавляй то, что «немного читал» — на собеседовании спросят.

### Проекты

Самая важная секция для junior без опыта. Для каждого проекта:
1. **Название** — что это
2. **Стек** — какие технологии
3. **Что сделано** — 2–3 пункта о функциональности
4. **Ссылка** — GitHub

### Образование

Укажи курс. Если есть университет — тоже укажи (даже если не IT-специальность).

---

## Частые ошибки

| Ошибка | Почему плохо |
|--------|-------------|
| Нет ссылки на GitHub | Рекрутер не может проверить код |
| «Знаю Go, Python, Java, C++, Rust» | Не верится. Лучше один язык, но с проектами |
| Пустой GitHub | Проекты есть, но репозитории пустые или без README |
| Слишком длинное резюме | Рекрутер тратит 30 секунд. 1 страница — максимум |
| Фото в стиле Instagram | Используй нейтральное фото или не используй вовсе |

---

## Чек-лист перед отправкой

- [ ] Резюме умещается на 1 страницу
- [ ] Есть ссылка на GitHub
- [ ] Все репозитории публичные и с README
- [ ] Нет орфографических ошибок
- [ ] Указана конкретная позиция (не «разработчик вообще»)
- [ ] Контакты актуальные

---

## Где размещать

1. **hh.ru** — заполни профиль и прикрепи PDF
2. **LinkedIn** — продублируй информацию
3. **PDF** — отправляй напрямую, когда откликаешься в Telegram

Сделай резюме **сейчас**. Не «потом», не «когда буду готов». Ты уже готов. Следующий урок — об этом.
`,

		"12-6-growth": `# Ты готов к рынку

Давай подведём итог. Посмотри, что ты сделал за время курса:

---

## Твои результаты

### 3 проекта на GitHub

| Проект | Что показывает |
|--------|---------------|
| Go Calculator | Основы языка, CLI, обработка ошибок |
| URL Shortener | HTTP, PostgreSQL, REST API |
| Todo App v2.0 | Тесты, graceful shutdown, slog, Docker |

Каждый проект — с README, с коммитами, с историей. Это **реальное портфолио**.

### Навыки

Ты умеешь:

- Писать код на Go: переменные, типы, функции, структуры, интерфейсы
- Работать с горутинами и каналами
- Создавать HTTP-сервер с маршрутизацией и middleware
- Подключать PostgreSQL и писать SQL-запросы
- Писать unit-тесты, table-driven тесты, handler-тесты
- Использовать моки для изоляции тестов
- Настраивать graceful shutdown
- Логировать через slog в JSON
- Работать с Git и Docker

### Готовое резюме

У тебя есть шаблон резюме с конкретными проектами и навыками.

---

## «Но у меня нет опыта работы»

Давай честно: у большинства junior-разработчиков нет коммерческого опыта. Это нормально. Компании это понимают.

Что у тебя **есть**:
- Код на GitHub, который можно посмотреть
- Понимание стандартных практик (тесты, логи, graceful shutdown)
- Знание инструментов (Git, Docker, PostgreSQL)

Это больше, чем у 80% кандидатов на junior-позицию, которые прочитали книгу, но ничего не написали.

---

## Что говорят работодатели

Вот что реально ищут на junior-позиции:

> «Нам не нужен человек, который знает всё. Нам нужен человек, который умеет учиться и не боится кода»

> «Если у кандидата есть проекты на GitHub с тестами — это уже топ-10% джунов»

> «Лучший сигнал — когда человек может объяснить, почему он написал код именно так»

---

## Синдром самозванца

Ты будешь чувствовать, что недостаточно знаешь. Что «настоящие разработчики» знают больше. Что тебя «разоблачат» на собеседовании.

Это называется **синдром самозванца**, и он есть у всех — от джунов до сеньоров. Разница в том, как ты с ним обращаешься:

- **Плохо:** «Я недостаточно знаю, подожду ещё полгода»
- **Хорошо:** «Я знаю не всё, но достаточно, чтобы начать. Остальное выучу на работе»

Ни один разработчик не знает всё. Даже авторы Go гуглят синтаксис.

---

## Твой план действий

1. **Сегодня** — создай или обнови резюме по шаблону из урока 12-5
2. **Завтра** — размести резюме на hh.ru и LinkedIn
3. **Каждый день** — отправляй 5–10 откликов
4. **Параллельно** — решай задачи в тренажёре, повторяй вопросы
5. **На собеседовании** — будь честным, покажи проекты, задавай вопросы

---

## Последнее

Ты прошёл курс. Ты написал три проекта. Ты знаешь Go, PostgreSQL, тестирование, Docker. У тебя есть GitHub и резюме.

**Ты готов.**

Не жди идеального момента. Начинай искать работу сейчас. Первый оффер может прийти через неделю, может через месяц. Но он придёт — если ты не остановишься.

Удачи. Ты справишься.
`,

		"12-7-personal-plan": `# Следующий уровень

Ты завершил курс Godemy и готов к первой работе. Но что, если ты хочешь **ускорить рост**? Стать увереннее? Разбираться в более сложных темах?

---

## Что дальше после курса

Курс Godemy дал тебе **фундамент**:
- Язык Go
- HTTP и REST API
- PostgreSQL
- Тестирование
- Docker

Этого достаточно для junior-позиции. Но в реальной работе тебе встретятся темы, которые мы не успели охватить:

---

## Темы, которые ждут на следующем уровне

### Архитектура

- Clean Architecture в Go-проектах
- Dependency Injection без фреймворков
- Разделение на слои: transport → service → repository
- Конфигурация через ` + "`envconfig`" + ` и ` + "`.env`" + ` файлы

### Продвинутая работа с БД

- Работа через ORM (GORM, sqlx)
- Миграции через ` + "`goose`" + ` или ` + "`golang-migrate`" + `
- Транзакции и обработка конкурентных операций
- Redis как кеш и очередь

### Аутентификация и безопасность

- JWT-токены
- Middleware для авторизации
- CORS, rate limiting
- Хеширование паролей (bcrypt)

### Микросервисы

- gRPC для межсервисного общения
- Брокеры сообщений (Kafka, RabbitMQ)
- Distributed tracing
- Service discovery

### DevOps

- CI/CD с GitHub Actions
- Kubernetes основы
- Мониторинг (Prometheus + Grafana)
- Terraform для инфраструктуры

---

## Платный курс: Godemy Bootcamp

Мы подготовили **продвинутый курс** для тех, кто хочет углубить знания:

### Что внутри

- **Проект**: полноценный сервис с аутентификацией, кешированием и деплоем
- **gRPC**: создание микросервиса с gRPC API
- **CI/CD**: настройка пайплайна от push до продакшена
- **Код-ревью**: обратная связь от опытного Go-разработчика
- **Менторство**: еженедельные созвоны с ментором

### Для кого

- Ты прошёл бесплатный курс Godemy
- Ты хочешь быстрее дорасти до middle-уровня
- Тебе нужна обратная связь и менторство

### Что получишь

- Ещё 2 проекта в портфолио (продвинутого уровня)
- Навыки, которые выделят тебя среди других джунов
- Прямой доступ к ментору
- Помощь с трудоустройством

---

## Это не обязательно

Платный курс — это **ускоритель**, а не обязательный шаг. Всё, что тебе нужно для первой работы, ты уже знаешь. Буткемп — для тех, кто хочет прийти на собеседование **сильнее** остальных.

---

## Бесплатные ресурсы для самостоятельного роста

Если ты предпочитаешь учиться сам:

- **Go Blog** (go.dev/blog) — официальный блог команды Go
- **Effective Go** (go.dev/doc/effective_go) — гайд по идиоматичному Go
- **Go by Example** (gobyexample.com) — примеры по темам
- **Ardan Labs Blog** — глубокие статьи о Go
- **GopherCon** — доклады с конференции (YouTube)

---

## Итог

Ты прошёл путь от «что такое Go» до трёх проектов на GitHub с тестами, логами и Docker. Это не «я прошёл курс». Это **реальный навык**.

Теперь у тебя два пути:
1. **Идти на рынок** — откликаться, собеседоваться, устроиться
2. **Усилиться** — пройти буткемп и прийти на собеседование с преимуществом

Оба пути правильные. Главное — **не останавливаться**.

Спасибо, что прошёл курс Godemy. До встречи — на работе или на буткемпе.
`,
	}

	for slug, content := range lessons {
		db.Model(&models.Lesson{}).Where("slug = ?", slug).Update("content", content)
	}
}
