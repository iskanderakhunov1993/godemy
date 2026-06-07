# Timeweb App Platform deploy

This project is easiest to run in Timeweb App Platform as separate services:

1. Managed PostgreSQL
2. Managed Redis
3. Backend app from `backend/Dockerfile.timeweb-app`
4. Frontend app from `frontend/Dockerfile`

Why not use the existing production compose:

- App Platform does not preserve local container storage between deploys.
- The current production stack includes `nginx`, `certbot`, and local `PostgreSQL` volumes that are unnecessary or fragile in App Platform.
- The backend code runner normally uses `docker.sock`, which App Platform does not expose. `backend/Dockerfile.timeweb-app` keeps the Go toolchain in the runtime image so runner endpoints can execute locally.

## 1. Create managed PostgreSQL

Create a PostgreSQL instance in Timeweb Cloud and save:

- host
- port
- database
- user
- password

Build a DSN like:

```text
host=<HOST> user=<USER> password=<PASSWORD> dbname=<DB> port=<PORT> sslmode=disable
```

If Timeweb gives you SSL-only access, use the DSN they provide instead of the example above.

## 2. Create managed Redis

Create a Redis instance and save:

- host
- port
- password if present
- db number, usually `0`

Use:

```text
REDIS_ADDR=<HOST>:<PORT>
REDIS_PASSWORD=<PASSWORD>
REDIS_DB=0
```

## 3. Deploy backend app

In App Platform:

- Type: `Dockerfile`
- Repository: this repo
- Dockerfile path: `backend/Dockerfile.timeweb-app`
- Root directory: repo root
- Port: `8080`

Backend environment variables:

```text
APP_ENV=production
PORT=8080
DATABASE_URL=host=<HOST> user=<USER> password=<PASSWORD> dbname=<DB> port=<PORT> sslmode=disable
JWT_SECRET=<32+ random chars>
ADMIN_SECRET=<32+ random chars>
CORS_ALLOWED_ORIGINS=https://<frontend-tech-domain>,https://godemy.ru,https://www.godemy.ru
FRONTEND_URL=https://<frontend-tech-domain>
REDIS_ADDR=<HOST>:<PORT>
REDIS_PASSWORD=<PASSWORD>
REDIS_DB=0
SMTP_HOST=<optional>
SMTP_PORT=587
SMTP_USER=<optional>
SMTP_PASSWORD=<optional>
SMTP_FROM=<optional>
YANDEX_CLIENT_ID=<optional>
YANDEX_CLIENT_SECRET=<optional>
```

After deploy, verify:

- `GET /api/health` returns `{"status":"ok"}`

## 4. Deploy frontend app

In App Platform:

- Type: `Dockerfile`
- Repository: this repo
- Dockerfile path: `frontend/Dockerfile`
- Root directory: repo root
- Port: `3000`

Frontend build arg / variable:

```text
NEXT_PUBLIC_BACKEND_URL=https://<backend-tech-domain>
```

After deploy, open the frontend technical domain and make sure the app loads.

## 5. Update backend CORS after frontend is live

Once the frontend has its technical domain:

- add it to `CORS_ALLOWED_ORIGINS`
- set `FRONTEND_URL` to that same frontend URL
- redeploy backend

Once `godemy.ru` is attached:

- add `https://godemy.ru`
- add `https://www.godemy.ru` if you will use `www`

## 6. Attach domains

Recommended:

- frontend app: `godemy.ru` and optionally `www.godemy.ru`
- backend app: keep Timeweb technical domain, or use `api.godemy.ru`

If you use `api.godemy.ru`, update:

```text
NEXT_PUBLIC_BACKEND_URL=https://api.godemy.ru
```

and redeploy the frontend.

## 7. Final checks

- frontend homepage opens
- backend health endpoint responds
- register/login works
- lesson list loads from frontend
- code runner endpoints work from the backend container without docker mode
