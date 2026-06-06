# 🚀 СТАРТ РАЗВЕРТЫВАНИЯ - это файл читай ПЕРВЫМ!

## 🎯 Что у тебя уже готово

✅ Весь код скоммичен и готов  
✅ GitHub Actions CI/CD настроен  
✅ Docker конфиги готовы  
✅ Полная документация написана  

**Осталось 3 простых шага!**

---

## ⚡ БЫСТРЫЙ СТАРТ (5 минут)

### Шаг 1️⃣: Получить GitHub Token (2 мин)

1. Прочитай: [GET_GITHUB_TOKEN.md](./GET_GITHUB_TOKEN.md)
2. Создай токен на: https://github.com/settings/tokens → Generate new token
3. Скопируй токен (вид: `ghp_xxx...`)

### Шаг 2️⃣: Запустить автоматизированный скрипт (1 мин)

```bash
cd /Users/iskander/Desktop/golanger
./auto-deploy.sh
```

**Что будет запрошено:**
- GitHub username (твой юзер, например: `iskander`)
- GitHub Personal Access Token (скопировал выше)

**Что произойдет:**
- ✅ Создастся репозиторий на GitHub
- ✅ Весь код зальется туда
- ✅ Даст URL репо

### Шаг 3️⃣: Развернуть на хостингах (2 мин каждый)

После скрипта тебе даст инструкции как развернуть на:
- **Vercel** (фронтенд) - https://vercel.com/new
- **Railway** (бэкенд) - https://railway.app/new

Просто следуй инструкциям!

---

## 📖 Если нужна подробнее информация

- `QUICK_START.md` - быстрый старт за 15 мин
- `DEPLOYMENT_STEP_BY_STEP.md` - подробный гайд всех шагов
- `DEPLOYMENT.md` - расширенный гайд с нюансами

---

## 🆘 Проблемы?

**"Permission denied" при запуске скрипта:**
```bash
chmod +x auto-deploy.sh
./auto-deploy.sh
```

**"Token не работает":**
- Проверь что создал токен с правами `repo` и `workflow`
- Проверь что скопировал весь токен без пробелов

**"GitHub username не узнает":**
- Используй точное имя аккаунта как на GitHub
- Можешь проверить на https://github.com/твое-имя

---

## ✅ Контрольный список

- [ ] Прочитал GET_GITHUB_TOKEN.md
- [ ] Создал GitHub token
- [ ] Запустил `./auto-deploy.sh`
- [ ] Залил на Vercel фронтенд
- [ ] Залил на Railway бэкенд
- [ ] Обновил Backend URL в Vercel
- [ ] Проверил что всё работает
- [ ] Запустил smoke-check: `./scripts/check-prod.sh <backend_url> <frontend_origin>`

---

## 🎉 После завершения

Твой проект будет на:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`
- **GitHub**: `https://github.com/твой-юзер/golanger`

**Каждый `git push` → автоматический деплой за 2-5 минут! 🤖**

Это работает так:
- GitHub Actions прогоняет CI
- Vercel автоматически деплоит frontend
- Railway автоматически деплоит backend

---

**ГОТОВО? Начни с Шага 1! 👇**

```bash
# Шаг 1: Прочитай гайд по токену
cat GET_GITHUB_TOKEN.md

# Шаг 2: Запусти автоматизацию
./auto-deploy.sh

# Шаг 3: Следуй инструкциям в консоли
```

Когда появятся URL после деплоя, проверь прод:

```bash
./scripts/check-prod.sh https://your-backend.up.railway.app https://your-frontend.vercel.app
```

**Успехов! 🚀**
