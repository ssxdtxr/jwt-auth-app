# JWT Auth App

Full-stack приложение с JWT-аутентификацией.

## Стек

**Frontend**
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Feature-Sliced Design (FSD)
- Vitest + React Testing Library

**Backend**
- Node.js 22 + Express 5 + TypeScript
- TypeORM + PostgreSQL 17
- JWT (access token) + Refresh token (httpOnly cookie)

**Инфраструктура**
- Docker Compose (multi-stage builds)
- Nginx (раздача SPA + proxy к API)

## Запуск

```bash
cp .env.example .env
# заполнить .env своими значениями
docker compose -p jwt-auth-app up --build
```

- Фронтенд: http://localhost:3000
- Бэкенд: http://localhost:4000

## Переменные окружения

| Переменная | Описание |
|---|---|
| `BACKEND_PORT` | Порт бэкенда (по умолчанию `4000`) |
| `FRONTEND_PORT` | Порт фронтенда (по умолчанию `3000`) |
| `POSTGRES_USER` | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |
| `POSTGRES_DB` | Имя базы данных |
| `JWT_SECRET` | Секрет для access-токена (мин. 32 символа) |
| `JWT_EXPIRES_IN` | Время жизни access-токена (например `15m`) |
| `REFRESH_TOKEN_SECRET` | Секрет для refresh-токена (мин. 32 символа) |
| `REFRESH_TOKEN_EXPIRES_IN` | Время жизни refresh-токена (например `7d`) |
| `CORS_ORIGIN` | Разрешённый origin для CORS |

## Тесты

```bash
# Frontend (32 теста)
cd frontend && npm run test

# Backend
cd backend && npm run test
```

## Структура

```
├── backend/
│   ├── controllers/
│   ├── entities/          # TypeORM сущности
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── __tests__/
├── frontend/
│   └── src/
│       ├── app/           # Роутер, провайдеры
│       ├── pages/         # login, register, home
│       └── shared/        # api, auth, ui-компоненты
└── docker-compose.yml
```
