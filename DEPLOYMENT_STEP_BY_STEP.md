# 🌍 ПОЛНАЯ ИНСТРУКЦИЯ: Развертывание Golanger в интернет

## 📋 Контрольный список перед стартом

Убедись что у тебя есть:
- [ ] GitHub аккаунт (https://github.com/signup)
- [ ] Vercel аккаунт (https://vercel.com/signup)
- [ ] Railway или Render аккаунт (https://railway.app или https://render.com)

---

## 🔴 ЭТАП 1: GitHub (2-3 минуты)

### 1.1 Создать GitHub репозиторий

1. Зайди на https://github.com/new
2. **Заполни форму:**
   - Repository name: `golanger`
   - Description: `Go backend + Next.js learning platform with 5 sprints`
   - Privacy: `Private` (если используешь платно) или `Public`
   - НЕ инициализируй с README/License/gitignore
3. Нажми **"Create repository"**

### 1.2 Залить проект на GitHub

```bash
cd /Users/iskander/Desktop/golanger

# Замени USERNAME на твой GitHub юзернейм
./push-to-github.sh USERNAME

# Пример:
# ./push-to-github.sh iskander
```

**Что сделает скрипт:**
- Добавит GitHub как remote
- Зальет весь код на GitHub
- Все готово для CI/CD!

✅ **Проверка:** Зайди на `https://github.com/USERNAME/golanger` - должен видеть весь код

---

## 🟢 ЭТАП 2: Vercel для Frontend (5-10 минут)

### 2.1 Импортировать проект в Vercel

1. Зайди на https://vercel.com/dashboard
2. Нажми **"Add New..."** → **"Project"**
3. Авторизуйся через GitHub если потребуется
4. Найди и выбери репозиторий `golanger`

### 2.2 Настроить фронтенд

На странице импорта установи:

**Framework**: Next.js
**Root Directory**: `frontend` ← **важно!**
**Build Command**: `npm run build` (по умолчанию)
**Output Directory**: `.next` (по умолчанию)

### 2.3 Environment Variables (критично!)

Нажми на **"Environment Variables"** и добавь:

```
NEXT_PUBLIC_BACKEND_URL = https://your-backend.up.railway.app
```

⚠️ **Пока оставь значение по умолчанию**, обновим когда запустим backend

### 2.4 Deploy

Нажми **"Deploy"** и жди ~2-3 минуты

✅ **Проверка:** 
- Должно появиться сообщение "Deployed!"
- Скопируй URL (типа: `https://your-frontend.vercel.app`)

---

## 🟡 ЭТАП 3: Railway для Backend (5-10 минут)

### 3.1 Подключить к Railway

1. Зайди на https://railway.app/dashboard
2. Нажми **"New Project"**
3. Выбери **"Deploy from GitHub repo"**
4. Авторизуйся и выбери публик доступ к `golanger`

### 3.2 Настроить Service

Railway должен автоматически обнаружить backend, но если нет:

- **Service Name**: `backend`
- **Root Directory**: `backend` ← **важно!**
- **Detect/Configure**: Выбери Go версию 1.26+

### 3.3 Environment Variables

Перейди в **"Variables"** и установи:

```
PORT = 8081
JWT_SECRET = your-super-secret-key-here-min-32-chars
DATABASE_URL = host=<host> user=<user> password=<password> dbname=<dbname> port=5432 sslmode=require
CORS_ALLOWED_ORIGINS = https://твой-frontend-домен
```

🔐 **Для JWT_SECRET используй:**
```bash
openssl rand -hex 32
```

Скопируй результат и вставь в Railway

### 3.4 Deploy

Railway должен автоматически начать деплой

✅ **Проверка:**
- Зайди в Railway Dashboard → Deployments
- Должен видеть статус "Success"
- Скопируй URL (типа: `https://your-backend.up.railway.app`)

### 3.5 Обновить Frontend

1. Вернись в Vercel Dashboard
2. Открой проект `golanger`
3. Settings → Environment Variables
4. Отредактируй `NEXT_PUBLIC_BACKEND_URL`:
   ```
   NEXT_PUBLIC_BACKEND_URL = https://your-backend.up.railway.app
   ```
5. Перереди на главной странице (пересборка с новым URL)

---

## 🔵 ЭТАП 4: GitHub Actions (Автоматизация)

GitHub Actions в этом проекте используется как CI:
- проверяет backend сборку
- проверяет frontend сборку
- ловит проблемы до продакшна

Автодеплой делает не GitHub Actions, а сами платформы Vercel и Railway после подключения репозитория.

### 4.1 Проверить Actions

1. Зайди на https://github.com/USERNAME/golanger/actions
2. Должна быть workflow `CI`
3. На следующий пуш она автоматически:
   - Запустит тесты
   - Соберет код
   - Проверит, что проект готов к автодеплою

### 4.2 Как работает автодеплой после первого подключения

1. Подключаешь GitHub репозиторий к Vercel
2. Подключаешь GitHub репозиторий к Railway
3. После этого каждый push в `main`:
   - GitHub Actions проверяет сборку
   - Vercel автоматически выкатывает frontend
   - Railway автоматически выкатывает backend

---

## 🎯 ЭТАП 5: Домен (Опционально) - 10 минут

### 5.1 Купить домен

Варианты:
- **Namecheap** - дешево (~$10/год)
- **GoDaddy** - популярно
- **Google Domains** - удобно
- **Vercel** - через самого Vercel (дороже)

Используй Vercel для простоты:

### 5.2 Настроить домен в Vercel

1. Открой проект на Vercel
2. **Settings** → **Domains**
3. Добавь своей домен (например: `golanger.com`)
4. Следуй инструкциям настройки DNS

Vercel покажет что сделать с DNS записями

### 5.3 Проверка DNS

```bash
# Через 10-15 минут домен должен работать
dig golanger.com
# или
nslookup golanger.com
```

✅ Готово! Сайт доступен по https://golanger.com

---

## 🚀 ФИНАЛ: Что получилось

После всех шагов у тебя есть:

```
┌─────────────────────────────────────────────────┐
│  🌍 Твой Golanger в интернете                   │
├─────────────────────────────────────────────────┤
│  Frontend:                                       │
│  https://your-frontend.vercel.app                │
│  (или твой домен: https://golanger.com)         │
│                                                   │
│  Backend API:                                    │
│  https://your-backend.up.railway.app             │
│                                                   │
│  CI/CD Автоматизация:                            │
│  git push → CI → Vercel/Railway deploy         │
│                                                   │
│  Обновления за 2-5 минут ⚡                     │
└─────────────────────────────────────────────────┘
```

---

## 📝 Обновление кода

Теперь очень просто:

```bash
# 1. Отредактировал код
nano backend/handlers/auth.go

# 2. Закомитил и залил
git add -A
git commit -m "Добавил новую функцию"
git push origin main

# 3. GitHub Actions автоматически:
#    ✅ запустил тесты
#    ✅ собрал код
#    ✅ после этого Vercel и Railway сами выкатывают новую версию
#    ✅ через 2-5 минут новая версия live!
```

**Мониторь процесс:**
- GitHub Actions: https://github.com/USERNAME/golanger/actions
- Vercel logs: https://vercel.com/dashboard
- Railway logs: https://railway.app/dashboard

---

## 🔧 Откат версии

Если что-то сломалось:

**На Vercel:**
1. Settings → Deployments
2. Найди рабочую версию
3. Нажми "Promote to Production"

**На Railway:**
1. Deployments tab
2. Выбери предыдущую версию
3. Нажми "Redeploy"

---

## 🛡️ Безопасность

✅ **Сделай:**
- JWT_SECRET минимум 32 символа
- Database backups (Railway и Render это делают автоматически)
- Используй HTTPS везде (по умолчанию на Vercel + Railway)

❌ **Не делай:**
- Не коммитай .env с реальными значениями
- Не делай репозиторий публичным если есть секреты
- Не используй простые пароли

---

## 🆘 Проблемы и решения

### Фронтенд говорит "Backend не найден"
```
✓ Проверь NEXT_PUBLIC_BACKEND_URL в Vercel
✓ Перерсборка фронтенда в Vercel
✓ Проверь что Backend поднялся в Railway
```

### GitHub Actions падает
```
✓ Посмотри логи в Actions tab
✓ Проверь что все секреты добавлены
✓ Проверь что backend/frontend собираются локально
```

### Railway/Render ничего не видит
```
✓ Убедись что root directory = backend
✓ Проверь logs в Railway dashboard
✓ Перезапусти деплой вручную
```

### Домен не работает
```
✓ Жди 15-30 минут для распространения DNS
✓ Очисти кеш браузера (Ctrl+Shift+Delete)
✓ Проверь DNS: https://www.nslookup.io/
```

---

## 📚 Полезные ссылки

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Dashboard Railway**: https://railway.app/dashboard
- **GitHub Secrets**: https://github.com/USERNAME/golanger/settings/secrets/actions
- **GitHub Actions**: https://github.com/USERNAME/golanger/actions
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/

---

## ✅ Checklist завершения

- [ ] Git репозиторий создан и код залит
- [ ] Vercel проект создан, фронтенд деплоится
- [ ] Railway проект создан, бэкенд деплоится
- [ ] GitHub Actions секреты добавлены
- [ ] Backend URL обновлена в Vercel
- [ ] Сайт доступен на https://your-frontend.vercel.app
- [ ] API доступен на https://your-backend.up.railway.app/api/lessons?module=junior
- [ ] Домен (опционально) настроен и работает

---

## 🎉 Готово!

Твой проект теперь полностью в интернете с автоматизированным CI/CD!

Любые изменения в коде → git push → автоматический деплой за 2-5 минут ⚡

**Успехи! 🚀**
