🚀 Golanger - Go Backend + Next.js Frontend Learning Platform

Интерактивная платформа для изучения Go и backend разработки с пошаговыми спринтами и практическими проектами.

📚 Структура проекта

golanger/
├── backend/          # Go Gin сервер на порту 8081
│   ├── main.go
│   ├── delivery/http/ # HTTP handlers
│   ├── usecase/      # Бизнес-логика
│   ├── models/       # Database models
│   ├── data/         # Seeds и migrations
│   ├── Dockerfile
│   └── .env.example
├── frontend/         # Next.js 16 + TypeScript
│   ├── src/app/      # Маршруты приложения
│   ├── src/lib/      # API клиент, хуки, store
│   ├── public/       # Статические файлы
│   ├── Dockerfile
│   └── .env.example
├── docker/           # Конфиги для Docker
├── docker-compose.yml
└── scripts/          # Скрипты для деплоя и бэкапов


🛠 Установка локально

Требования
- Node.js 18+
- Go 1.26+
- Docker (опционально)

Быстрый старт

bash
# 1. Backend
cd backend
go run main.go
Сервер запустится на http://localhost:8081

2. Frontend (в новом терминале)
cd frontend
npm install
npm run dev
Приложение откроется на http://localhost:3001
```

Через Docker Compose

bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8080


🌍 Развернутые окружения

🔴 Production

| Параметр | Значение |
|----------|----------|
| **Сервер** | `186.246.0.46` |
| **Домен** | `godemy.ru` |
| **Frontend** | https://godemy.ru |
| **Backend API** | https://godemy.ru/api |
| **SSH User** | `root` |
| **Database** | PostgreSQL (`golanger`) |


🎯 Спринты и проекты

Sprint 0: Фундамент
- IT и Agile методология
- Роли в команде разработки
- Go и карьера в backend

Sprint 1: Todo API (7 дней)
- Базовый HTTP сервер
- REST endpoints
- Структура обработчиков

Sprint 2-5: Реальные проекты от roadmap.sh
- Sprint 2: Blogging Platform API
- Sprint 3: Weather API Wrapper
- Sprint 4: Expense Tracker API
- Sprint 5: GitHub User Activity CLI/API

Каждый спринт включает:
- 📖 Теорию и примеры кода
- 💪 5 дней практики
- 📝 Чек-лист задач
- 🧪 Примеры реализации

---

🔌 API

 Endpoints

bash
Получить все уроки курса junior
GET /api/lessons?module=junior

Получить конкретный урок
GET /api/lessons/:slug

Аутентификация
POST /api/auth/register
POST /api/auth/login

Прогресс обучения
GET  /api/progress
POST /api/progress/:type/:id/:status

Environment variables

Backend (.env)**

PORT=8081
JWT_SECRET=your-secret-key
DATABASE_URL=host=localhost user=golanger password=golanger dbname=golanger port=5432 sslmode=disable
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

Frontend (.env)

NEXT_PUBLIC_BACKEND_URL=http://localhost:8081

🌍 Развертывание

Сейчас актуальная схема одна: **Timeweb VPS + Docker Compose**.

- Сервер: `186.246.0.46`
- Домен: `godemy.ru`
- Публичный вход: `http://godemy.ru` и `https://godemy.ru`
- API: `https://godemy.ru/api`
- Все сервисы запускаются из `docker-compose.prod.yml`

Полезные команды:

```bash
./scripts/deploy-timeweb.sh https://github.com/USERNAME/golanger.git godemy.ru /opt/golanger
./scripts/issue-cert.sh godemy.ru admin@godemy.ru
```

Проверка после деплоя:

```bash
curl -i http://godemy.ru/api/health
```

## Технологический стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Backend | Go + Gin | 1.26 |
| Frontend | Next.js + TypeScript | 16.2 |
| Styling | Tailwind CSS | 4.x |
| State | Zustand | Latest |
| Database | PostgreSQL + GORM | Latest |
| Auth | JWT | - |
| Docker | Docker Compose | 3.9 |
| CI/CD | GitHub Actions + Docker Compose | - |
| Hosting | Timeweb Cloud Server | - |

📝 Лицензия

MIT

👤 Автор

GitHub**: [@iskander](https://github.com/iskander)

Готово к старту? 🚀
- Локальная разработка: `docker-compose up`
- Развертывание: `scripts/deploy-timeweb.sh` или `docker compose up -d --build`
- Вопросы? Создай Issue на GitHub

## Тестовые аккаунты по ролям

Обе роли входят через обычную форму: http://godemy.ru/auth/login

| Роль | Email | Пароль | После входа |
|------|-------|--------|-------------|
| Обычный пользователь | `user@godemy.ru` | `UserGodemy2026!` | `/guide` |
| Администратор | `admin@godemy.ru` | Значение `ADMIN_SECRET` из production `.env.production` | `/admin` |

Production-пароль администратора нельзя коммитить в публичный репозиторий. Он
хранится только на сервере в `/opt/golanger/.env.production` и передаётся backend
через переменную `ADMIN_SECRET`.

## Доступы роли администратора

Административный аккаунт создаётся или обновляется при запуске backend:

- email берётся из `ADMIN_LOGIN`;
- пароль берётся из `ADMIN_SECRET`;
- аккаунту устанавливается `isAdmin: true`;
- если пользователь с таким email уже существует, ему назначается роль администратора и обновляется пароль.

В production `ADMIN_LOGIN` и `ADMIN_SECRET` задаются в `.env.production`.
Значение `ADMIN_SECRET` должно содержать не менее 32 символов. Сам пароль и другие
секреты нельзя добавлять в README или коммиты.

### Вход и защита

- Админ-панель: https://godemy.ru/admin
- Вход выполняется через обычную форму логина с данными `ADMIN_LOGIN` и `ADMIN_SECRET`.
- После входа frontend проверяет актуальную сессию и поле `isAdmin`.
- Все запросы к `/api/admin/*` требуют JWT в заголовке `Authorization: Bearer <token>`.
- Без JWT API возвращает `401 Unauthorized`, без роли администратора — `403 Forbidden`.
- Обычный пользователь не видит ссылку на админку и не может открыть защищённые страницы или API напрямую.

### Возможности в интерфейсе

| Раздел | URL | Доступ |
|--------|-----|--------|
| Главная админки | `/admin` | Переход ко всем редакторам |
| Редактор курса | `/admin/structure` | Уровни, модули, темы и уроки основного курса |
| Редактор буткемпа | `/admin/bootcamp` | Уровни, модули, темы и уроки Bootcamp |
| Генератор курса | `/admin/course-generator` | Prompt для модуля, урока или concept card по методике Project ZERO |
| Уроки | `/admin/lessons`, `/admin/lessons/:id` | Просмотр, создание, редактирование и удаление уроков |
| Упражнения | `/admin/exercises`, `/admin/exercises/:id` | Просмотр, создание, редактирование и удаление упражнений |
| Тренажёр | `/admin/trainer` | Переход к редакторам материалов тренажёра |
| Темы тренажёра | `/admin/trainer-topics`, `/admin/trainer-topics/:id` | CRUD тем и привязка упражнений |
| Практика тренажёра | `/admin/trainer-practice`, `/admin/trainer-practice/:id` | Настройка упражнения и его представления в тренажёре |
| Разбор кода | `/admin/trainer/syntax` | Редактор тем синтаксиса |
| Практер | `/admin/trainer/prakter` | Создание, изменение, проверка и удаление задач практера |
| Вопросы | `/admin/trainer/questions` | Создание, изменение, фильтрация и удаление вопросов |

Редакторы практера и вопросов сохраняют изменения в `localStorage` текущего браузера.
Они не изменяют PostgreSQL и не синхронизируют данные между устройствами.

Администратор также может открывать пользовательский раздел Bootcamp `/junior`
без активной подписки Godemy Pro.

### Защищённые Admin API

| Метод и маршрут | Возможность |
|-----------------|-------------|
| `POST /api/admin/activate` | Активировать Godemy Pro пользователю по email на 1–365 дней |
| `GET /api/admin/lessons` | Получить все уроки |
| `GET /api/admin/lessons/:id` | Получить урок по ID |
| `POST /api/admin/lessons` | Создать урок |
| `PUT /api/admin/lessons/:id` | Изменить урок |
| `DELETE /api/admin/lessons/:id` | Удалить урок |
| `GET /api/admin/exercises` | Получить все упражнения |
| `GET /api/admin/exercises/:id` | Получить упражнение по ID |
| `POST /api/admin/exercises` | Создать упражнение |
| `PUT /api/admin/exercises/:id` | Изменить упражнение |
| `DELETE /api/admin/exercises/:id` | Удалить упражнение |
| `GET /api/admin/trainer-topics` | Получить темы тренажёра, при необходимости с фильтром `?module=` |
| `GET /api/admin/trainer-topics/:id` | Получить тему тренажёра по ID |
| `POST /api/admin/trainer-topics` | Создать тему тренажёра |
| `PUT /api/admin/trainer-topics/:id` | Изменить тему тренажёра |
| `DELETE /api/admin/trainer-topics/:id` | Удалить тему тренажёра |
| `GET /api/admin/modules` | Получить список модулей |
| `POST /api/admin/modules` | Создать модуль с первым уроком |
| `PUT /api/admin/modules/:name` | Переименовать модуль |
| `PUT /api/admin/modules/:name/move` | Переместить модуль на другой уровень |
| `DELETE /api/admin/modules/:name` | Удалить модуль |
| `GET /api/admin/levels` | Получить все уровни |
| `POST /api/admin/levels` | Создать уровень |
| `PUT /api/admin/levels/:id` | Изменить уровень |
| `DELETE /api/admin/levels/:id` | Удалить уровень |
| `POST /api/admin/upload` | Загрузить изображение для контента |
