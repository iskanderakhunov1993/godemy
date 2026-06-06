# 🔑 Получение GitHub Personal Access Token

## Зачем нужен токен?

GitHub Personal Access Token нужен для автоматизированного создания репозитория и заливки кода без необходимости вводить пароль при каждом push.

## 📝 Пошаговые инструкции

### Шаг 1: Зайди в настройки GitHub

1. Перейди на **https://github.com/settings/tokens** (или Settings → Developer settings → Personal access tokens)
2. Нажми **"Generate new token"** → **"Generate new token (classic)"**

### Шаг 2: Настрой токен

**Name (Имя):**
```
Golanger Auto Deploy
```

**Expiration (Срок действия):**
- Выбери **"90 days"** или **"No expiration"** (без ограничений)

**Select scopes (Выбери права):**
Отметь следующие checkbox:
- ✅ `repo` (Full control of private repositories)
  - `repo:status`
  - `repo_deployment`
  - `public_repo`
  - `repo:invite`

- ✅ `workflow` (Update GitHub Action workflows)

Больше ничего не нужно! 👈

### Шаг 3: Создай токен

1. Нажми **"Generate token"** внизу
2. **Скопируй токен** (он больше не будет виден!)
3. Сохрани его где-то безопасно

Вид токена: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚠️ БЕЗОПАСНОСТЬ

🔐 **Никогда не делись этим токеном!**
- Не коммитай его в Git
- Не отправляй по чату/email
- Если случайно залил - сразу удали в GitHub settings

**Если токен скомпрометирован:**
1. Перейди на https://github.com/settings/tokens
2. Нажми Delete рядом с токеном
3. Создай новый

---

## 🚀 Готово к использованию!

Теперь запусти скрипт деплоя:

```bash
cd /Users/iskander/Desktop/golanger
./auto-deploy.sh
```

**Будет запрошено:**
1. GitHub username (твой юзернейм)
2. Personal Access Token (только что создал)

После этого:
✅ Автоматически создается репозиторий
✅ Весь код заливается на GitHub
✅ Готово для Vercel и Railway

---

## 📚 Больше информации

- GitHub Docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
- GitHub REST API: https://docs.github.com/en/rest

