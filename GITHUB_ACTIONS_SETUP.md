# GitHub Actions Setup for CI/CD

## ✅ Step 1: Authenticate with GitHub CLI (run once)

```bash
gh auth login --web
```

Выберите опции:
1. GitHub.com
2. HTTPS protocol  
3. Yes to authenticate Git
4. Open browser and enter the code

## ✅ Step 2: Add GitHub Secrets

После авторизации, выполните скрипт для добавления всех secrets:

```bash
chmod +x ./setup-github-secrets.sh
./setup-github-secrets.sh
```

Скрипт автоматически:
- Получит SSH ключ со staging сервера (72.56.232.70)
- Добавит все необходимые secrets в GitHub

## ✅ Step 3: Verify secrets

Посмотрите добавленные secrets:
https://github.com/iskander/golanger/settings/secrets/actions

Должны быть:
- ✅ STAGING_DEPLOY_HOST = 72.56.232.70
- ✅ STAGING_DEPLOY_PATH = /opt/golanger-staging
- ✅ STAGING_SSH_PRIVATE_KEY = (длинный ключ)

## ✅ Step 4: Test CI/CD

Теперь при push в develop будет автоматический деплой:

```bash
# Внесите небольшое изменение и запушьте
echo "# Test" >> README.md
git add README.md
git commit -m "Test CI/CD trigger"
git push origin develop
```

Проверьте:
1. GitHub Actions: https://github.com/iskander/golanger/actions
2. Смотрите workflow "Deploy to Staging"
3. После завершения staging обновится на http://72.56.232.70

## 🛠️ Если что-то не сработало

### Ошибка: "Not authenticated"
```bash
gh auth logout
gh auth login --web
./setup-github-secrets.sh
```

### Ошибка: SSH key not found
Проверьте, что на staging сервере есть ключ:
```bash
ssh root@72.56.232.70 "cat /root/.ssh/github_actions | head -1"
# Должно быть: -----BEGIN OPENSSH PRIVATE KEY-----
```

### Посмотреть логи GitHub Actions
https://github.com/iskander/golanger/actions

---

**Готово!** Теперь каждый push в develop автоматически деплоится на staging.
