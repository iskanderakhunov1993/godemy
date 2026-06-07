# 🚀 Deployment Guide

Пошаговая инструкция для развертывания Golanger в интернете на **Vercel** (frontend) + **Railway/Render** (backend).

## Шаг 1: Подготовка GitHub

### 1.1 Создать GitHub репозиторий
```bash
# На GitHub создай новый приватный репозиторий: golanger
# Не инициализируй с README
```

### 1.2 Залить проект на GitHub
```bash
cd /Users/iskander/Desktop/golanger

# Добавить весь код
git add .
git commit -m "Initial commit: Golanger with 5 sprints"

# Залить на GitHub (замени USERNAME на твой юзер)
git remote add origin https://github.com/USERNAME/golanger.git
git branch -M main
git push -u origin main
```

---

## Шаг 2: Развертывание Backend на Railway/Render

### Вариант A: Railway (рекомендуется)

1. **Регистрация и подключение GitHub**
   - Перейди на https://railway.app/
   - Войди через GitHub
   - Нажми "New Project"
   - Выбери "Deploy from GitHub repo"
   - Выбери репозиторий `golanger`

2. **Настройка переменных окружения**
   - Перейди в `Variables` на Railway
   - Установи переменные (скопируй значения из backend/.env.example):
     ```
     PORT=8081
     JWT_SECRET=your-super-secret-key-generate-this
   DATABASE_URL=host=<host> user=<user> password=<password> dbname=<dbname> port=5432 sslmode=require
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
     RAILWAY_ENVIRONMENT=production
     ```

3. **Настройка сервиса**
   - В Railway выбери директорию: `backend`
   - Установи версию Go: 1.26+
   - Оставь Dockerfile если есть, или задай команду: `go run main.go`

4. **Deploy**
   - Railway автоматически начнет деплой по пушам в main

5. **Получить URL бэкенда**
   - После успешного деплоя скопируй URL из Railway (типа: `https://your-backend.up.railway.app`)

---

### Вариант B: Render

1. **Регистрация**
   - Перейди на https://render.com/
   - Войди через GitHub

2. **Создание Web Service**
   - Нажми "New +" → "Web Service"
   - Выбери репозиторий `golanger`
   - Настройки:
     - **Name**: `golanger-backend`
     - **Root Directory**: `backend`
     - **Runtime**: `Go`
     - **Build Command**: `go build -o bin/app`
     - **Start Command**: `./bin/app`

3. **Переменные окружения**
   - Перейди в "Environment"
   - Добавь:
     ```
     PORT=8081
     JWT_SECRET=your-super-secret-key
   DATABASE_URL=host=<host> user=<user> password=<password> dbname=<dbname> port=5432 sslmode=require
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
     ```

4. **Deploy** - Нажми "Create Web Service"

---

## Шаг 3: Развертывание Frontend на Vercel

1. **Регистрация**
   - Перейди на https://vercel.com/
   - Войди через GitHub

2. **Импорт проекта**
   - Нажми "Add New..." → "Project"
   - Выбери репозиторий `golanger`
   - Нажми "Import"

3. **Настройка фронтенда**
   - **Project Name**: `golanger-frontend` (или выбери свой)
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (оставить по умолчанию)
   - **Output Directory**: `.next` (по умолчанию)

4. **Переменные окружения**
   - В секции "Environment Variables" добавь:
     ```
   NEXT_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
     ```
     (используй URL из Railway, полученный на Шаге 2)

5. **Deploy**
   - Нажми "Deploy"
   - Vercel автоматически начнет сборку

6. **Получить URL фронтенда**
   - После деплоя Vercel выдаст URL типа: `https://your-frontend.vercel.app`
   - Это и есть твой публичный сайт!

---

## Шаг 4: Настройка автоматизации (CI/CD)

GitHub Actions уже настроен в `.github/workflows/deploy.yml`

### Добавить секреты в GitHub

1. Перейди в GitHub → Settings → Secrets and variables → Actions
2. Добавь следующие секреты:

#### Для Vercel:
```
VERCEL_TOKEN=         # Получи на https://vercel.com/account/tokens
VERCEL_ORG_ID=        # Из настроек организации Vercel
VERCEL_PROJECT_ID=    # Из настроек проекта Vercel
VERCEL_SCOPE=         # Твой Vercel scope/username
```

#### Для Railway:
```
RAILWAY_TOKEN=        # Получи на https://railway.app/account/tokens
RAILWAY_PROJECT_ID=   # ID проекта из Railway
RAILWAY_SERVICE_NAME= # Имя сервиса backend
```

### После этого:
- Каждый `git push` в main автоматически:
  - ✅ Запускает тесты
  - ✅ Собирает frontend и backend
  - ✅ Деплоит на Vercel и Railway

### Staging для ветки develop

Для тестового окружения можно поднимать отдельный стенд через Docker Compose:

```bash
cd /opt/golanger-staging
cp backend/.env.staging.example backend/.env.staging
cp frontend/.env.staging.example frontend/.env.staging

# заполни реальные значения

docker compose -f docker-compose.staging.yml up -d --build
```

Порты staging по умолчанию:
- Frontend: `http://<server-ip>:13000`
- Backend: `http://<server-ip>:18080`

Проверка staging:

```bash
./scripts/check-prod.sh http://<server-ip>:18080 http://<server-ip>:13000
```

Jenkinsfile поддерживает staging-поток:
- ветка `develop`: build + deploy через `docker-compose.staging.yml`
- ветка `main`: production deploy через `docker-compose.prod.yml`

---

## Шаг 5: Покупка домена (опционально)

### Вариант A: Через Vercel (просто)

1. В проекте на Vercel: Settings → Domains
2. Добавь свой домен: `golanger.com` (или какой захочешь)
3. Следуй инструкциям Vercel для настройки DNS

### Вариант B: Через отдельный регистратор

1. Купи домен на Namecheap, GoDaddy, или другом регистраторе
2. Настрой DNS:
   ```
   A     golanger.com           → 76.76.19.1 (Vercel IP)
   CNAME www.golanger.com       → Cname.vercel-dns.com
   ```
3. Добавь домен в Vercel (Settings → Domains)

---

## Шаг 6: Мониторинг и обновления

### Проверка статуса деплоя
- GitHub Actions: репозиторий → Actions
- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard

### Обновление после изменений
```bash
# Внеси изменения в код
git add .
git commit -m "Описание изменений"
git push origin main

# Автоматически:
# → GitHub Actions запустит тесты
# → При успехе автоматически деплоится на Vercel и Railway
# → Через 2-5 минут новая версия уже live!
```

### Откат версии
- Vercel: Settings → Deployments → Rollback
- Railway: Deployments tab → Redeploy

---

## 🔑 Рекомендации по безопасности

1. **JWT_SECRET**: Используй `openssl rand -hex 32` для генерации
2. **Приватный репозиторий**: Не выкладывай .env с реальными значениями
3. **Database**: Railway/Render используют временное хранилище, добавь PostgreSQL в будущем
4. **SSL**: Vercel + Railway автоматически используют HTTPS

---

## 📊 После деплоя

Твой проект будет доступен по адресам:
- **Frontend**: `https://your-frontend.vercel.app` (или твой домен)
- **Backend API**: `https://your-backend.up.railway.app/api/...`
- **Dashboard Vercel**: Мониторинг, аналитика, logs
- **Dashboard Railway**: Мониторинг ресурсов, database

Каждый пуш в main → автоматический деплой за 2-5 минут ✅

---

## ❓ Решение проблем

### Backend не подключается
```bash
# Проверить URL в Railway/Render
# Убедиться что NEXT_PUBLIC_BACKEND_URL установлена в Vercel
# Проверить CORS в backend (если нужно)
```

### Frontend не видит backend
```bash
# Проверь в браузере → Console
# Должен быть URL вида https://golanger-backend-*.up.railway.app
# А не http://localhost:8081
```

### Деплой падает
- Посмотри логи в GitHub Actions → workflow
- Посмотри логи во Vercel/Railway dashboard
- Проверь переменные окружения

---

## Развертывание на VPS / Timeweb

Для Timeweb или другого VPS с Docker можно использовать скрипт `scripts/deploy-timeweb.sh`.

1. Скопируй репозиторий на сервер:
   ```bash
   git clone https://github.com/<USERNAME>/golanger.git /opt/golanger
   ```
2. Создай файлы окружения:
   ```bash
   cd /opt/golanger
   cp .env.production.example .env.production
   cp backend/.env.production.example backend/.env.production
   cp frontend/.env.production.example frontend/.env.production
   ```
3. Отредактируй `.env.production`, `backend/.env.production` и `frontend/.env.production` реальными значениями.
4. Запусти скрипт:
   ```bash
   sudo bash scripts/deploy-timeweb.sh https://github.com/<USERNAME>/golanger.git godemy.ru /opt/golanger
   ```
5. После успешного запуска выполни выдачу SSL:
   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml run --rm certbot certonly \
     --webroot -w /var/www/certbot \
     -d godemy.ru -d www.godemy.ru \
     --email your-email@example.com --agree-tos --non-interactive
   ```

> На Timeweb требуется VDS/VPS с доступом по SSH, Docker и Docker Compose plugin.

---

**Готово! 🎉 Твой проект в интернете!**
