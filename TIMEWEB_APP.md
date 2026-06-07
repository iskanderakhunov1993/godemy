# Развёртывание на Timeweb App Platform

Этот файл описывает, как опубликовать фронтенд и бэкенд Golanger на Timeweb App Platform (App). Подход — создать два приложения: Frontend (Next.js) и Backend (Docker).

## Предпосылки
- Репозиторий доступен на GitHub и подключён к Timeweb (в скриншотах видно аккаунт `iskanderakhunov1993/godemy`).
- На репозитории есть `frontend/Dockerfile` и `backend/Dockerfile`.
- Файлы окружения: `.env.production`, `backend/.env.production` и `frontend/.env.production` (скопируйте из `.example` и заполните реальные значения).

## Обзор
1. Создать App → Frontend (Next.js) — указать путь `frontend`.
2. Создать App → Docker/Backend — указать Dockerfile в `backend`.
3. Настроить переменные окружения (из `backend/.env.production` и `frontend/.env.production`).
4. Привязать домен и включить SSL (Timeweb выдаст сертификат).

---

## 1) Frontend (Next.js)

- Тип: `Frontend → Next.js` (или `Other` если хотите использовать Dockerfile напрямую).
- Repository: выберите `iskanderakhunov1993/godemy` и ветку `main`.
- Project path / Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Output / Build directory: leave empty for Next.js managed deploy, or use `.next` if required by platform.
  - Если платформа ожидает статическую папку, можно использовать `next export` и `out` but default Next.js support usually enough.
- Environment variables: добавьте (пример):
  - `NEXT_PUBLIC_BACKEND_URL` = `http://<YOUR_DOMAIN>` или `https://<YOUR_DOMAIN>`
- После первого деплоя проверьте логи сборки.

Совет: если Timeweb поддерживает Docker для frontend, можно выбрать `Docker` и указать `frontend/Dockerfile`.

---

## 2) Backend (Docker)

- Тип: `Docker` или `Backend` с использованием Dockerfile.
- Repository: `iskanderakhunov1993/godemy`, ветка `main`.
- Project path / Dockerfile path: `backend/Dockerfile` (или просто `backend` если платформа автодетектит Dockerfile).
- Build: платформа соберёт образ по Dockerfile.
- Environment variables: перенесите значения из `backend/.env.production`.
  Обязательно задать:
  - `PORT` (обычно `8080` в compose)
  - `DATABASE_URL` (если используете внешний Postgres — укажите host/credentials; если хотите, подключите Timeweb DB сервис и укажите DSN)
  - `JWT_SECRET`
  - `CORS_ALLOWED_ORIGINS` (домен frontend)
  - `SMTP_*` если используете почту
  - `REDIS_ADDR` — если используете Timeweb Redis или внешний сервис, укажите адрес.

Если бэкенд ожидает Docker Compose, App Platform может не поддерживать compose сразу — в этом случае используйте выделенный VPS или контейнерный образ, где внутри Dockerfile запускаете все нужные сервисы либо подключаете внешние managed DB/Redis.

---

## 3) Secrets / Variables

- В Timeweb UI при создании приложения добавляйте переменные окружения.
- Для секрктов используйте раздел `Variables` (или секреты), не коммитьте `.env` в репозиторий.

Примеры (копируйте значения из `backend/.env.production`):
```
JWT_SECRET=...
DATABASE_URL=host=... user=... password=... dbname=... port=5432 sslmode=disable
CORS_ALLOWED_ORIGINS=http://your-domain,https://your-domain
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
NEXT_PUBLIC_BACKEND_URL=https://your-domain
```

---

## 4) Домен и SSL

- После успешного деплоя в Timeweb App, привяжите домен (Domain → Add).
- Включите автоматическое получение SSL (Let's Encrypt) через Timeweb.

---

## 5) Проверка

1. Откройте фронтенд по адресу App Platform или привязанному домену.
2. Убедитесь, что фронтенд вызывает API (проверьте Developer Console и Network).
3. Проверьте API health: `GET /api/health` или `GET /api/lessons`.
4. Если что-то не работает — проверьте логи приложения в Timeweb UI (Build logs / Runtime logs).

---

## 6) Быстрый чек-лист для вас

- [ ] Репозиторий подключён к Timeweb
- [ ] `frontend/.env.production` и `backend/.env.production` заполнены
- [ ] Созданы две App: Frontend и Backend
- [ ] Для Backend указан Dockerfile
- [ ] Переменные окружения заданы
- [ ] Домен привязан и SSL включён

---

Если хотите — могу:
- сгенерировать и добавить `timeweb-frontend.yml` или README-скрипт для автоматической настройки;
- помочь заполнить `backend/.env.production` и `frontend/.env.production` прямо в репозитории (пришлите значения или скажите, какие поля заполнить автоматически);
- выполнить деплой по SSH на VPS, если дадите доступ.
