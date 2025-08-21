# WB Tariffs Service

Сервис для регулярного получения тарифов WB, сохранения их в БД и обновления данных в Google-таблицах.

---

## Требования

- Docker + Docker Compose
- Node.js 20+
- PostgreSQL 16+

---

## Установка и запуск

### 1. Установить зависимости
```bash
npm i
```

### 2. Заполнить .env на основе .env.example:
#### Основные
- APP_PORT - порт бэкенда
- TZ - часовой пояс (по умолчанию Europe/Moscow)
- AUTO_RUN_ON_START (если true, сервис запускает сбор тарифов и экспорт при старте)
#### БД
- POSTGRES_HOST - имя хоста БД
- POSTGRES_PORT - порт БД
- POSTGRES_USER - имя пользователя БД
- POSTGRES_PASSWORD - пароль пользователя БД
- POSTGRES_DB - имя БД
#### WB
- WB_API_TOKEN - токен доступа WB API
- WB_API_BASE - базовый URL WB API
- WB_TARIFFS_BOX_PATH - путь к эндпоинту тарифов коробов
- WB_TARIFFS_TIMEZONE - часовой пояс для учёта дат тарифов
#### Cron
- CRON_FETCH_TARIFFS - время получения тарифов (по умолчанию каждый час в 00 минут)
- CRON_EXPORT_SHEETS - расписание экспорта в Google Sheets (по умолчанию каждый час в 10 минут)
#### GOOGLE
- GOOGLE_SERVICE_ACCOUNT_EMAIL - email сервисного аккаунта Google
- GOOGLE_PRIVATE_KEY - приватный ключ сервисного аккаунта
- GOOGLE_SHEET_IDS - список ID таблиц через запятую
- GOOGLE_SHEET_TAB - название листа, куда выгружаются тарифы

### 3. Сделать билд проекта
```bash
npm run build
```

### 4. Запустить проект
```bash
docker-compose up -d (опционально)
```