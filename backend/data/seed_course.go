package data

import (
	"fmt"

	"golanger/backend/models"
	"gorm.io/gorm"
)

func SeedCourseStructure(db *gorm.DB) {
	levels := []models.Level{
		{Slug: "module-1", Title: "Погружение в профессию", Description: "Введение в разработку, фундамент инженерии, первая программа на Go", Order: 1},
		{Slug: "module-2", Title: "Процессы и инструменты", Description: "Как работает IT-команда, Git, методологии разработки", Order: 2},
		{Slug: "module-3", Title: "Проект №1: Числовая угадайка (CLI)", Description: "Первый проект на Go — консольная игра", Order: 3},
		{Slug: "module-4", Title: "Проект №2: Погодный API-сервис", Description: "HTTP-сервер, работа с внешним API, кеширование, Docker", Order: 4},
		{Slug: "module-5", Title: "Проект №3: Todo-list API (CRUD + БД)", Description: "REST API с PostgreSQL, чистая архитектура, Docker Compose", Order: 5},
		{Slug: "module-6", Title: "Дипломный проект", Description: "Доработка Todo-list: тесты, graceful shutdown, логирование", Order: 6},
		{Slug: "module-7", Title: "Карьера и развитие", Description: "Резюме, портфолио, собеседования, план развития", Order: 7},
	}

	levelIDs := make(map[string]uint)
	for i := range levels {
		var existing models.Level
		db.Where("slug = ?", levels[i].Slug).Assign(levels[i]).FirstOrCreate(&existing)
		levelIDs[levels[i].Slug] = existing.ID
	}

	type moduleDef struct {
		levelSlug string
		slug      string
		title     string
		desc      string
		order     int
	}

	modules := []moduleDef{
		{"module-1", "sprint-1", "Спринт 1. Введение в разработку", "Почему Go, клиент-серверная архитектура, терминал, установка, первая программа", 1},
		{"module-1", "sprint-2", "Спринт 2. Фундамент инженерии", "Аппаратное обеспечение, Интернет, сетевые протоколы, HTTP, API, JSON", 2},
		{"module-2", "sprint-3", "Спринт 3. Как работает IT-команда", "SDLC, роли в команде, Agile, Git, GitHub, оформление задач", 3},
		{"module-3", "sprint-4", "Спринт 4. Подготовка к проекту «Угадайка»", "Переменные, fmt, условия, циклы, случайные числа, ввод, функции", 4},
		{"module-3", "sprint-5", "Спринт 5. Выполнение проекта «Угадайка»", "Пошаговая реализация CLI-игры с коммитами", 5},
		{"module-4", "sprint-6", "Спринт 6. Подготовка к проекту «Погода»", "net/http, JSON, HTTP-клиент, env, кеш, интерфейсы, Docker", 6},
		{"module-4", "sprint-7", "Спринт 7. Выполнение проекта «Погода»", "Пошаговая реализация погодного API-сервиса", 7},
		{"module-5", "sprint-8", "Спринт 8. Подготовка к проекту «Todo-list»", "Структуры, чистая архитектура, SQL, миграции, CRUD, middleware, Docker Compose", 8},
		{"module-5", "sprint-9", "Спринт 9. Выполнение проекта «Todo-list»", "Пошаговая реализация Todo-list API", 9},
		{"module-6", "sprint-10", "Спринт 10. Подготовка к диплому", "Unit-тесты, табличные тесты, моки, httptest, интеграционные тесты, graceful shutdown, логирование", 10},
		{"module-6", "sprint-11", "Спринт 11. Выполнение дипломного проекта", "Тесты, graceful shutdown, логирование, финальная сборка", 11},
		{"module-7", "sprint-12", "Спринт 12. Путь в профессию", "Ревью стека, рынок, резюме, портфолио, собеседования, план развития", 12},
	}

	moduleIDs := make(map[string]uint)
	for _, m := range modules {
		mod := models.Module{
			LevelID:     levelIDs[m.levelSlug],
			Slug:        m.slug,
			Title:       m.title,
			Description: m.desc,
			Order:       m.order,
		}
		var existing models.Module
		db.Where("slug = ?", mod.Slug).Assign(mod).FirstOrCreate(&existing)
		moduleIDs[m.slug] = existing.ID
	}

	type topicDef struct {
		moduleSlug string
		slug       string
		title      string
		desc       string
		order      int
	}

	// Topics are not used in this course structure — lessons attach directly to modules via TopicID=nil.
	// If needed later, topics can group lessons within a sprint.

	type lessonDef struct {
		moduleSlug string
		slug       string
		title      string
		desc       string
		category   string
		order      int
	}

	lessons := []lessonDef{
		// ── Спринт 1. Введение в разработку ──
		{"sprint-1", "1-1-how-course-works", "Урок 1.1. Как устроен курс", "Правила обучения, график, как задавать вопросы", "Введение в разработку", 1},
		{"sprint-1", "1-2-why-go", "Урок 1.2. Почему Go", "Сравнение с Python, Java, C++. Области применения", "Введение в разработку", 2},
		{"sprint-1", "1-3-frontend-backend", "Урок 1.3. Что такое фронтенд и бекенд", "Клиент-серверная архитектура: как браузер общается с сервером", "Введение в разработку", 3},
		{"sprint-1", "1-4-go-ecosystem", "Урок 1.4. Экосистема Go", "Docker, Kubernetes, Prometheus, Terraform — почему они выбрали Go", "Введение в разработку", 4},
		{"sprint-1", "1-5-terminal-basics", "Урок 1.5. Основы работы в терминале", "Команды навигации и управления файлами: ls, cd, mkdir, rm, pwd", "Введение в разработку", 5},
		{"sprint-1", "1-6-install-go", "Урок 1.6. Установка Go и настройка IDE", "VS Code + плагин Go или GoLand", "Введение в разработку", 6},
		{"sprint-1", "1-7-hello-world", "Урок 1.7. Первая программа", "Hello, World!, компиляция и запуск (go run, go build)", "Введение в разработку", 7},

		// ── Спринт 2. Фундамент инженерии ──
		{"sprint-2", "2-1-hardware", "Урок 2.1. Аппаратное обеспечение", "CPU, RAM, HDD/SSD. Как код превращается в исполняемый файл", "Фундамент инженерии", 1},
		{"sprint-2", "2-2-how-internet-works", "Урок 2.2. Как работает Интернет", "IP-адреса, порты, DNS", "Фундамент инженерии", 2},
		{"sprint-2", "2-3-network-protocols", "Урок 2.3. Сетевые протоколы", "TCP/IP, UDP: отличия, надёжность и скорость", "Фундамент инженерии", 3},
		{"sprint-2", "2-4-osi-model", "Урок 2.4. Модель OSI", "Упрощённый обзор уровней, как данные путешествуют по сети", "Фундамент инженерии", 4},
		{"sprint-2", "2-5-http-https", "Урок 2.5. Протокол HTTP/HTTPS", "Методы, статус-коды, заголовки", "Фундамент инженерии", 5},
		{"sprint-2", "2-6-what-is-api", "Урок 2.6. Что такое API", "REST и gRPC (базово). Как читать документацию к API", "Фундамент инженерии", 6},
		{"sprint-2", "2-7-data-formats", "Урок 2.7. Форматы данных", "JSON, XML. Почему JSON стал стандартом", "Фундамент инженерии", 7},

		// ── Спринт 3. Как работает IT-команда ──
		{"sprint-3", "3-1-sdlc", "Урок 3.1. Жизненный цикл ПО (SDLC)", "От идеи до поддержки: этапы разработки", "IT-команда", 1},
		{"sprint-3", "3-2-features-bugs", "Урок 3.2. Фичи и баги", "Определения, примеры. Как они попадают в бэклог", "IT-команда", 2},
		{"sprint-3", "3-3-team-roles", "Урок 3.3. Роли в команде", "PM, TL, Dev, QA, DevOps. Кто за что отвечает", "IT-команда", 3},
		{"sprint-3", "3-4-methodologies", "Урок 3.4. Методологии разработки", "Agile, Scrum, Kanban: основные принципы", "IT-команда", 4},
		{"sprint-3", "3-5-git-basics", "Урок 3.5. Git — основы", "init, add, commit, status, log. Правила написания коммитов", "IT-команда", 5},
		{"sprint-3", "3-6-git-branches", "Урок 3.6. Git — ветки", "branch, checkout, merge. Зачем для фичи создавать отдельную ветку", "IT-команда", 6},
		{"sprint-3", "3-7-git-remote", "Урок 3.7. Git — удалённый репозиторий", "GitHub, remote, push, pull, clone", "IT-команда", 7},
		{"sprint-3", "3-8-issues", "Урок 3.8. Оформление задач", "Создание Issue. Как описывать баг и фичу (Acceptance Criteria)", "IT-команда", 8},

		// ── Спринт 4. Подготовка к проекту «Угадайка» ──
		{"sprint-4", "4-1-project-requirements", "Урок 4.1. Требование проекта", "Разбор задачи: что должна делать игра", "Проект: Угадайка", 1},
		{"sprint-4", "4-2-simple-explanation", "Урок 4.2. Объяснение простым языком", "Как игра будет работать с точки зрения пользователя", "Проект: Угадайка", 2},
		{"sprint-4", "4-3-variables-constants", "Урок 4.3. Переменные и константы", "Объявление, типы данных (int, float64, string, bool)", "Проект: Угадайка", 3},
		{"sprint-4", "4-4-fmt-package", "Урок 4.4. Пакет fmt", "Вывод в консоль: Println, Printf, Print", "Проект: Угадайка", 4},
		{"sprint-4", "4-5-conditions", "Урок 4.5. Условные операторы", "if, else if, else. Сравнение чисел и строк", "Проект: Угадайка", 5},
		{"sprint-4", "4-6-loops", "Урок 4.6. Циклы", "for — единственный цикл в Go: со счётчиком, по условию, бесконечный", "Проект: Угадайка", 6},
		{"sprint-4", "4-7-random", "Урок 4.7. Генерация случайных чисел", "Пакет math/rand, инициализация генератора", "Проект: Угадайка", 7},
		{"sprint-4", "4-8-input", "Урок 4.8. Чтение ввода", "bufio.NewScanner, fmt.Scan. Базовое понятие об ошибках (error)", "Проект: Угадайка", 8},
		{"sprint-4", "4-9-functions", "Урок 4.9. Функции", "Объявление, параметры, возврат значений. Зачем разбивать код на функции", "Проект: Угадайка", 9},
		{"sprint-4", "4-10-checklist", "Урок 4.10. Чеклист требований", "Что ты должен уметь сделать после изучения теории", "Проект: Угадайка", 10},

		// ── Спринт 5. Выполнение проекта «Угадайка» ──
		{"sprint-5", "5-1-requirement-1", "Урок 5.1. Требование 1", "Создать структуру проекта и базовый цикл. go mod, main.go, приветствие, выбор сложности", "Проект: Угадайка", 1},
		{"sprint-5", "5-2-requirement-2", "Урок 5.2. Требование 2", "Реализовать логику одного раунда. Функция playRound, генерация числа, подсказки больше/меньше", "Проект: Угадайка", 2},
		{"sprint-5", "5-3-requirement-3", "Урок 5.3. Требование 3", "Повторные раунды и обработка ошибок. Play again, валидация ввода, README, тег v1.0.0", "Проект: Угадайка", 3},

		// ── Спринт 6. Подготовка к проекту «Погода» ──
		{"sprint-6", "6-1-project-requirements", "Урок 6.1. Требование проекта", "Создать HTTP-сервер с кешированием и Docker", "Проект: Погода", 1},
		{"sprint-6", "6-2-simple-explanation", "Урок 6.2. Объяснение простым языком", "Как работает прокси-сервис, зачем кеш и контейнер", "Проект: Погода", 2},
		{"sprint-6", "6-3-net-http", "Урок 6.3. Пакет net/http", "Создание сервера, хендлеры, роутинг", "Проект: Погода", 3},
		{"sprint-6", "6-4-json", "Урок 6.4. Работа с JSON", "Маршалинг и анмаршалинг (encoding/json). Теги структуры", "Проект: Погода", 4},
		{"sprint-6", "6-5-http-client", "Урок 6.5. HTTP-клиент", "Выполнение запросов к внешним API (http.Client, http.Get)", "Проект: Погода", 5},
		{"sprint-6", "6-6-env-vars", "Урок 6.6. Переменные окружения", "Пакет os, библиотека godotenv. Безопасное хранение ключей", "Проект: Погода", 6},
		{"sprint-6", "6-7-caching", "Урок 6.7. Кеширование", "In-memory cache через map + время истечения (time)", "Проект: Погода", 7},
		{"sprint-6", "6-8-interfaces", "Урок 6.8. Интерфейсы (основы)", "Зачем нужны, как помогают при замене реализации кеша", "Проект: Погода", 8},
		{"sprint-6", "6-9-docker", "Урок 6.9. Docker", "Что такое контейнер, основы написания Dockerfile для Go", "Проект: Погода", 9},
		{"sprint-6", "6-10-checklist", "Урок 6.10. Чеклист требований", "Что ты должен уметь сделать после изучения теории", "Проект: Погода", 10},

		// ── Спринт 7. Выполнение проекта «Погода» ──
		{"sprint-7", "7-1-requirement-1", "Урок 7.1. Требование 1", "Создать сервер-заглушку. Роутер, хендлер /weather с фиксированным JSON", "Проект: Погода", 1},
		{"sprint-7", "7-2-requirement-2", "Урок 7.2. Требование 2", "Подключить реальное API и переменные окружения. .env, Weather API, обработка ошибок", "Проект: Погода", 2},
		{"sprint-7", "7-3-requirement-3", "Урок 7.3. Требование 3", "Реализовать кеширование и Docker. Структура кеша, Dockerfile, тег v1.0.0", "Проект: Погода", 3},

		// ── Спринт 8. Подготовка к проекту «Todo-list» ──
		{"sprint-8", "8-1-project-requirements", "Урок 8.1. Требование проекта", "REST API для задач с PostgreSQL и Docker Compose", "Проект: Todo-list", 1},
		{"sprint-8", "8-2-simple-explanation", "Урок 8.2. Объяснение простым языком", "Архитектура: слои, БД, контейнеризация", "Проект: Todo-list", 2},
		{"sprint-8", "8-3-structs-methods", "Урок 8.3. Структуры и методы", "Модели данных, теги JSON", "Проект: Todo-list", 3},
		{"sprint-8", "8-4-clean-architecture", "Урок 8.4. Чистая архитектура (базово)", "Разделение на слои: Handler → Service → Repository", "Проект: Todo-list", 4},
		{"sprint-8", "8-5-sql-basics", "Урок 8.5. Работа с SQL", "Пакет database/sql. Подключение к PostgreSQL (драйвер pgx)", "Проект: Todo-list", 5},
		{"sprint-8", "8-6-migrations", "Урок 8.6. Миграции", "Создание таблиц через SQL-файлы или golang-migrate", "Проект: Todo-list", 6},
		{"sprint-8", "8-7-crud", "Урок 8.7. CRUD-операции", "Запросы INSERT, SELECT, UPDATE, DELETE в Go", "Проект: Todo-list", 7},
		{"sprint-8", "8-8-middleware", "Урок 8.8. Middleware", "Логирование запросов, CORS, обработка паник", "Проект: Todo-list", 8},
		{"sprint-8", "8-9-docker-compose", "Урок 8.9. Docker Compose", "Файл для запуска приложения и базы данных вместе", "Проект: Todo-list", 9},
		{"sprint-8", "8-10-checklist", "Урок 8.10. Чеклист требований", "Что ты должен уметь сделать после теории", "Проект: Todo-list", 10},

		// ── Спринт 9. Выполнение проекта «Todo-list» ──
		{"sprint-9", "9-1-requirement-1", "Урок 9.1. Требование 1", "Создать структуру и модель. Папки handlers/services/repository/models, структура Task, миграция", "Проект: Todo-list", 1},
		{"sprint-9", "9-2-requirement-2", "Урок 9.2. Требование 2", "Реализовать репозиторий. Интерфейс TaskRepository, реализация для PostgreSQL", "Проект: Todo-list", 2},
		{"sprint-9", "9-3-requirement-3", "Урок 9.3. Требование 3", "Реализовать сервис и хендлеры. TaskService, эндпоинты CRUD, роутинг, middleware", "Проект: Todo-list", 3},
		{"sprint-9", "9-4-requirement-4", "Урок 9.4. Требование 4", "Dockerfile и docker-compose.yml. Сборка, сервис postgres, тег v1.0.0", "Проект: Todo-list", 4},

		// ── Спринт 10. Подготовка к диплому ──
		{"sprint-10", "10-1-project-requirements", "Урок 10.1. Требование проекта", "Доработка Todo-list: тесты, graceful shutdown, логи", "Дипломный проект", 1},
		{"sprint-10", "10-2-simple-explanation", "Урок 10.2. Объяснение простым языком", "Зачем тесты, что такое graceful shutdown, как логи помогают", "Дипломный проект", 2},
		{"sprint-10", "10-3-unit-tests", "Урок 10.3. Unit-тесты", "Пакет testing, функции TestXxx", "Дипломный проект", 3},
		{"sprint-10", "10-4-table-tests", "Урок 10.4. Табличные тесты", "Подход для проверки множества кейсов", "Дипломный проект", 4},
		{"sprint-10", "10-5-mocks", "Урок 10.5. Моки", "Библиотека gomock. Зачем их использовать в тестах сервиса", "Дипломный проект", 5},
		{"sprint-10", "10-6-handler-tests", "Урок 10.6. Тестирование хендлеров", "Пакет httptest, фиктивные запросы и ответы", "Дипломный проект", 6},
		{"sprint-10", "10-7-integration-tests", "Урок 10.7. Интеграционные тесты", "Поднятие тестовой БД, проверка репозитория", "Дипломный проект", 7},
		{"sprint-10", "10-8-graceful-shutdown", "Урок 10.8. Graceful Shutdown", "Перехват сигналов (os/signal), плавное завершение HTTP-сервера", "Дипломный проект", 8},
		{"sprint-10", "10-9-structured-logging", "Урок 10.9. Структурированное логирование", "slog или logrus: уровни, форматы", "Дипломный проект", 9},
		{"sprint-10", "10-10-checklist", "Урок 10.10. Чеклист требований", "Что должен уметь делать студент после теории", "Дипломный проект", 10},

		// ── Спринт 11. Выполнение дипломного проекта ──
		{"sprint-11", "11-1-requirement-1", "Урок 11.1. Требование 1", "Unit-тесты для сервиса. service_test.go, мок репозитория, тесты всех методов", "Дипломный проект", 1},
		{"sprint-11", "11-2-requirement-2", "Урок 11.2. Требование 2", "Интеграционные тесты для репозитория. repository_test.go, тестовая PostgreSQL", "Дипломный проект", 2},
		{"sprint-11", "11-3-requirement-3", "Урок 11.3. Требование 3", "Тесты для хендлеров. httptest, проверка статусов и тела ответов", "Дипломный проект", 3},
		{"sprint-11", "11-4-requirement-4", "Урок 11.4. Требование 4", "Graceful shutdown и логирование. SIGINT/SIGTERM, server.Shutdown, структурированный логгер", "Дипломный проект", 4},
		{"sprint-11", "11-5-final-build", "Урок 11.5. Финальная сборка и защита", "README, тег v2.0.0, демонстрация работы", "Дипломный проект", 5},

		// ── Спринт 12. Путь в профессию ──
		{"sprint-12", "12-1-review", "Урок 12.1. Ревью пройденного стека", "Что мы изучили, какие проекты сделали, какой инструментарий освоили", "Карьера", 1},
		{"sprint-12", "12-2-job-market", "Урок 12.2. Анализ рынка", "Как читать вакансии для Junior Go-разработчика", "Карьера", 2},
		{"sprint-12", "12-3-resume", "Урок 12.3. Составление резюме", "Структура, ключевые навыки, описание проектов", "Карьера", 3},
		{"sprint-12", "12-4-portfolio", "Урок 12.4. Оформление портфолио", "GitHub: качественные README, скриншоты, инструкции по запуску", "Карьера", 4},
		{"sprint-12", "12-5-interviews", "Урок 12.5. Подготовка к собеседованиям", "Алгоритмические задачи (LeetCode), System Design на уровне джуна", "Карьера", 5},
		{"sprint-12", "12-6-growth", "Урок 12.6. Пути развития", "Highload, Kubernetes, Open Source. Полезные ресурсы и сообщества", "Карьера", 6},
		{"sprint-12", "12-7-personal-plan", "Урок 12.7. Финальный план", "Составить личный план обучения на следующие 6 месяцев", "Карьера", 7},
	}

	for _, l := range lessons {
		modID := moduleIDs[l.moduleSlug]
		lesson := models.Lesson{
			Slug:        l.slug,
			Title:       l.title,
			Description: l.desc,
			Category:    l.category,
			Order:       l.order,
			Level:       fmt.Sprintf("course-%s", l.moduleSlug),
			Module:      "course",
		}
		if modID > 0 {
			lesson.TopicID = nil
		}
		var existing models.Lesson
		db.Where("slug = ?", lesson.Slug).Assign(lesson).FirstOrCreate(&existing)
	}

	fmt.Printf("[seed] Course structure: %d levels, %d modules, %d lessons\n", len(levels), len(modules), len(lessons))
}
