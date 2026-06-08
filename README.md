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
| Hosting | Timeweb VPS | - |

📝 Лицензия

MIT

👤 Автор

GitHub**: [@iskander](https://github.com/iskander)

Готово к старту? 🚀
- Локальная разработка: `docker-compose up`
- Развертывание: `scripts/deploy-timeweb.sh` или `docker compose up -d --build`
- Вопросы? Создай Issue на GitHub

Твой текущий доступ:

Админка курса (UI): https://godemy.ru/admin/structure
Пароль админки (Admin Secret): смотри переменную `ADMIN_SECRET` в backend/.env
Для API админки используется заголовок `X-Admin-Secret` со значением из `ADMIN_SECRET`


