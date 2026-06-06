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
└── DEPLOYMENT.md     # 🌍 Гайд развертывания в интернет


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
| **IP адрес** | `186.246.5.197` |
| **Frontend** | http://186.246.5.197 |
| **Backend API** | http://186.246.5.197/api |
| **SSH User** | `root` |
| **SSH Password** | `a42+?SqqY^bsu*` |
| **Database** | PostgreSQL (голангер_prod) |

### 🟠 Staging (Testing)

| Параметр | Значение |
|----------|----------|
| **IP адрес** | `72.56.232.70` |
| **Frontend** | http://72.56.232.70:13000 |
| **Backend API** | http://72.56.232.70:18080/api |
| **SSH User** | `root` |
| **SSH Password** | `gMQ4S?vSxtN^g8` |
| **Database** | PostgreSQL (golanger_staging) |

#### Синхронизация Staging с Production

bash
# Использование скрипта восстановления
./restore-staging-clean.sh <staging_password> <prod_password>

# Пример:
./restore-staging-clean.sh 'gMQ4S?vSxtN^g8' 'a42+?SqqY^bsu*'


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

🌍 Развертывание (Production)

📖 Полный гайд деплоя: смотри [DEPLOYMENT.md](./DEPLOYMENT.md)

TL;DR
1. Залить на GitHub
2. Настроить Vercel для frontend
3. Настроить Railway/Render для backend
4. GitHub Actions автоматически деплоит на каждый пуш
5. Купить домен (опционально)

Jenkins CI/CD (альтернатива GitHub Actions)

Запуск Jenkins локально

bash
docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

Доступ: http://localhost:8080

Стартовые креденшалы (для первого входа):
- Username: `iskander`
- Password: `Admin12345!`

Настройка Pipeline

В репозитории есть готовый pipeline: [Jenkinsfile](Jenkinsfile).

Что делает pipeline:
- Checkout кода
- Сборка frontend в контейнере `node:20-alpine`
- Сборка backend в контейнере `golang:1.26-alpine`
- Для ветки `develop`: сборка staging Docker-образов
- Для ветки `develop`: деплой staging по SSH (если заполнены параметры)
- Для ветки `main`: сборка production Docker-образов
- Для ветки `main`: деплой по SSH на сервер (если заполнены параметры)

Что нужно настроить в Jenkins:
1. New Item → Pipeline → имя: `golanger-pipeline`
2. Pipeline → Definition: `Pipeline script from SCM`
3. SCM: Git → Repository URL: `https://github.com/lewiscarrolwr-ops/golanger.git`
4. Credentials: добавить GitHub Personal Access Token (Manage Jenkins → Credentials → Add Credentials)
5. Branches to build: `*/main`
6. Script Path: `Jenkinsfile`
7. Build Now

Важно:
- На Jenkins агенте должен быть доступен Docker (`docker`, `docker compose`)
- На сервере деплоя должен быть клонирован проект в `DEPLOY_PATH`
- Для первого разворачивания сервера используй `deploy.sh`

Staging стенд (тестовое окружение)

В репозитории добавлены staging-конфиги:
- `docker-compose.staging.yml`
- `backend/.env.staging.example`
- `frontend/.env.staging.example`
- `scripts/deploy-staging.sh`

Быстрый запуск staging на сервере:

bash
cd /opt/golanger-staging
cp backend/.env.staging.example backend/.env.staging
cp frontend/.env.staging.example frontend/.env.staging

заполни реальные значения в .env.staging файлах

docker compose -f docker-compose.staging.yml up -d --build


По умолчанию стенд поднимается на портах:
- Frontend: `http://<server-ip>:13000`
- Backend: `http://<server-ip>:18080`

Smoke-check staging:

bash
./scripts/check-prod.sh http://<server-ip>:18080 http://<server-ip>:13000


После деплоя:
- ✅ Frontend: Vercel (`https://your-frontend.vercel.app`)
- ✅ Backend: Railway (`https://your-backend.up.railway.app`)
- ✅ CI/CD: Автоматический деплой на каждый пуш
- ✅ HTTPS: Включен по умолчанию

### Smoke-check продакшена

После деплоя проверь связку frontend/backend одной командой:

bash
./scripts/check-prod.sh https://your-backend.up.railway.app https://your-frontend.vercel.app

Скрипт проверит:
- `GET /api/health`
- CORS preflight для `POST /api/auth/register`
- регистрацию
- логин

---

🛠 Разработка

Структура backend

go
// handlers/lesson.go - логика уроков
func GetLessons(c *gin.Context) { }
func GetLesson(c *gin.Context) { }

// models/lesson.go - схема БД
type Lesson struct {
    ID    uint
    Slug  string
    Title string
    ...
}

// data/seed.go - инициализация данных
func Seed(db *gorm.DB) { }
```

Структура frontend

typescript
// src/lib/api.ts - клиент
export const api = { getLessons(), getLesson() }

// src/app/junior/guide/page.tsx - страница списка
// src/app/junior/guide/[slug]/page.tsx - страница урока

// src/lib/store.ts - состояние (Zustand)
export const useAuthStore = create((set) => ({ }))

Добавить новый спринт

1. Backend - отредактировать `backend/data/seed.go`
2. Frontend - обновить список на `/junior/guide`
3. Push - GitHub Actions автоматически деплоит


� Автоматизация (GitHub Actions)

Проект настроен на автодеплой через GitHub Actions:

Staging (develop ветка)
Каждый `git push` в ветку `develop` → автоматический деплой на staging сервер (72.56.232.70)

Что происходит:**
1. GitHub Actions запускает workflow
2. Код скачивается на staging сервер
3. Выполняется `./scripts/deploy-staging.sh`
4. Docker Compose пересобирает и перезапускает контейнеры
5. Staging обновляется: http://72.56.232.70

Для работы нужно настроить GitHub Secrets:
- Settings → Secrets and variables → Actions → New repository secret

Добавь эти переменные:
STAGING_DEPLOY_HOST = 72.56.232.70
STAGING_DEPLOY_PATH = /opt/golanger-staging
STAGING_SSH_PRIVATE_KEY = <содержимое приватного ключа>

### Production (main ветка)
Каждый `git push` в ветку `main` → автоматический деплой на production сервер

Что происходит:
1. GitHub Actions запускает workflow
2. Код скачивается на production сервер
3. Выполняется `docker compose -f docker-compose.prod.yml up -d --build`
4. Production обновляется

Для работы нужно настроить GitHub Secrets:**

PRODUCTION_DEPLOY_HOST = <IP production сервера>
PRODUCTION_DEPLOY_PATH = /opt/golanger
PRODUCTION_SSH_PRIVATE_KEY = <содержимое приватного ключа>


Как добавить SSH ключи в GitHub Secrets

1. На целевом сервере генерируем SSH ключ (если его нет):
bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys


2. Копируем приватный ключ:
bash
cat ~/.ssh/github_actions


3. В GitHub (Settings → Secrets) добавляем как `STAGING_SSH_PRIVATE_KEY` (или `PRODUCTION_SSH_PRIVATE_KEY`)

---

## �📊 Технологический стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| Backend | Go + Gin | 1.26 |
| Frontend | Next.js + TypeScript | 16.2 |
| Styling | Tailwind CSS | 4.x |
| State | Zustand | Latest |
| Database | SQLite + GORM | Latest |
| Auth | JWT | - |
| Docker | Docker Compose | 3.9 |
| CI/CD | GitHub Actions / Jenkins | - |
| Hosting | Vercel + Railway | - |

📝 Лицензия

MIT

👤 Автор

GitHub**: [@iskander](https://github.com/iskander)

Готово к старту? 🚀
- Локальная разработка: `docker-compose up`
- Развертывание: смотри [DEPLOYMENT.md](./DEPLOYMENT.md)
- Вопросы? Создай Issue на GitHub

Твой текущий доступ:

Админка курса (UI): http://localhost:3001/admin/structure
Пароль админки (Admin Secret): смотри переменную `ADMIN_SECRET` в backend/.env
Для API админки используется заголовок `X-Admin-Secret` со значением из `ADMIN_SECRET`



6be409299343e8ab58cfb592fbb92e1b2e38a38d7da6e6f3