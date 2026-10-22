# AGENTS.md

Руководство для AI-агентов, работающих с этим репозиторием.
Прочитай этот файл перед внесением изменений — здесь описаны архитектура, соглашения и ограничения.

---

## Обзор проекта

Full-stack приложение с JWT-аутентификацией:

| Часть | Стек | Порт |
|---|---|---|
| **frontend** | React 19 + Vite 8 + TypeScript 5 + Tailwind CSS v4 | 80 (nginx, docker) / 5173 (dev) |
| **backend** | Node.js 22 + Express 5 + TypeScript 5 + TypeORM + PostgreSQL 17 | 3000 |

Всё контейнеризировано через `docker-compose.yml`. Одна команда `docker compose up --build` запускает оба сервиса. nginx проксирует `/api/*` → `http://backend:3000/*`, поэтому CORS во frontend не нужен.

---

## Структура репозитория

```
.
├── .env                    # Секреты — не коммитить
├── .env.example            # Шаблон с ключами
├── docker-compose.yml      # Оркестрация frontend + backend
├── AGENTS.md               # ← ты здесь
│
├── backend/
│   ├── index.js            # Точка входа: dotenv → initDb() → app.listen()
│   ├── app.js              # Express: middleware + routes + error handler
│   ├── config/
│   │   └── env.js          # Валидация env vars; экспортирует frozen-объект
│   ├── db/
│   │   └── data-source.ts  # TypeORM DataSource + initDb() (synchronize: true)
│   ├── entities/           # TypeORM сущности с декораторами
│   │   ├── User.ts
│   │   └── RefreshToken.ts
│   ├── types/
│   │   └── express.d.ts    # Augments Express.Request с полем user
│   ├── controllers/        # HTTP-слой — только req/res, делегирует в services
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── services/           # Бизнес-логика — без req/res
│   │   └── auth.service.ts
│   ├── repositories/       # Доступ к данным через TypeORM Repository API
│   │   ├── user.repository.ts
│   │   └── token.repository.ts
│   ├── routes/
│   │   ├── auth.routes.ts  # POST /auth/{register,login,refresh,logout}
│   │   └── user.routes.ts  # GET /user/me  (защищённый)
│   ├── middleware/
│   │   ├── auth.ts         # Проверяет Bearer JWT; устанавливает req.user
│   │   └── error.ts        # Класс AppError + глобальный errorHandler
│   └── __tests__/
│       ├── auth.test.ts    # Интеграционные тесты /auth endpoints
│       └── user.test.ts    # Интеграционные тесты /user/me
│
└── frontend/
    ├── index.html
    ├── tsconfig.json       # TypeScript конфигурация
    ├── tsconfig.node.json  # TS конфигурация для vite.config.ts
    ├── vite.config.ts      # Tailwind plugin + @/ алиасы + Vitest config
    ├── nginx.conf          # SPA fallback + /api proxy + кэширование статики
    └── src/
        ├── main.tsx        # React entry: renders <App />
        ├── global.css      # @import "tailwindcss" — единственный глобальный CSS
        │
        ├── app/            # FSD app layer — провайдеры + роутинг
        │   ├── index.tsx   # App = <AuthProvider><AppRouter /></AuthProvider>
        │   └── router.tsx  # BrowserRouter + Routes + ProtectedRoute guard
        │
        ├── pages/          # FSD pages layer — по одному слайсу на роут
        │   ├── login/ui/LoginPage.tsx
        │   ├── register/ui/RegisterPage.tsx
        │   └── home/ui/HomePage.tsx
        │
        └── shared/         # FSD shared layer — инфраструктура, без бизнес-логики
            ├── api/
            │   ├── client.ts   # axios instance + 401 interceptor + token queue
            │   ├── auth.ts     # login/register/refresh/logout (отдельный axios, без auth header)
            │   └── index.ts    # публичный API
            ├── assets/         # Статические файлы (SVG, PNG и т.д.)
            ├── auth/
            │   ├── token.ts    # In-memory access token + sessionExpire callback
            │   ├── session.tsx # AuthProvider + useSession hook
            │   └── index.ts    # публичный API
            └── ui/
                └── AuthForm/   # Переиспользуемая форма (Login + Register)
```

---

## Архитектурные правила

### Backend — Слоистая архитектура

Каждый слой имеет единственную ответственность. Нельзя пропускать слои.

```
HTTP request
    ↓
routes/*.routes.js      — только маппинг HTTP verb/path → метод контроллера
    ↓
controllers/*.controller.js — извлекает данные из req, вызывает service, форматирует ответ
    ↓
services/*.service.js   — бизнес-логика, бросает AppError при доменных ошибках
    ↓
repositories/*.repository.js — доступ к данным (in-memory; заменить на БД)
```

**Правила:**
- Контроллеры **не содержат** бизнес-логику — делегируют в service.
- Сервисы **не импортируют** `req`, `res` или что-либо из Express.
- Репозитории **не содержат** бизнес-логику — только чтение/запись.
- Все async-ошибки **передаются** через `next(err)` в глобальный `errorHandler`.
- Используй `AppError(message, statusCode)` для ожидаемых доменных ошибок (4xx).
- `config/env.js` — единственный источник env-переменных; нельзя читать `process.env` напрямую в другом месте.

### Frontend — Feature-Sliced Design (FSD v2.1)

Направление импортов: `app → pages → shared`. Никаких импортов наверх или между слайсами.

```
app/      провайдеры, роутинг, guards
pages/    роут-уровневая композиция; состояние форм живёт здесь
shared/   инфраструктура без бизнес-логики
```

**Правила:**
- Каждый слайс экспортирует только через `index.ts` — никаких deep imports.
- `shared/` не содержит бизнес-логику и не импортирует из `pages/` или `app/`.
- `shared/api/client.ts` — единственное место с axios interceptor. Auth API вызовы используют **отдельный** axios instance в `shared/api/auth.ts`, чтобы избежать бесконечных циклов обновления токена.
- `shared/auth/token.ts` — plain модуль (без React): хранит access token в памяти и колбэк `sessionExpire`.

### Frontend — Структура компонентов

(скилл: `react-component-structure`)

- **1 файл = 1 компонент.** Один `.tsx` файл экспортирует ровно один компонент.
- **Нет ключевого слова `function`** — только стрелочные функции: `const X: React.FC<Props> = () => { ... }`.
- **`type` для props** — форма пропсов объявляется через `type`, не `interface`.
- **`interface` только для контрактов** — формы API ответов/запросов, контракты модулей.
- **Нет `export default`** — только именованные экспорты.

```tsx
// ✅ правильно
type ButtonProps = {
  label: string;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

// ❌ неправильно
export default function Button({ label, onClick }: ButtonProps) { ... }
```

---

## Auth Flow

```
Register  → POST /api/auth/register  → 201
Login     → POST /api/auth/login     → { accessToken } + httpOnly refreshToken cookie
Request   → Authorization: Bearer <accessToken>
           → 401 → interceptor вызывает POST /api/auth/refresh → новый accessToken → повтор
Logout    → POST /api/auth/logout    → очищает cookie + удаляет токен из store
Page load → AuthProvider монтируется → POST /api/auth/refresh → восстанавливает сессию из cookie
```

Access token: **только в памяти** (React state + module variable). Никогда не в localStorage.
Refresh token: **httpOnly cookie** (устанавливается сервером, невидим для JS).

---

## Переменные окружения

Все переменные в `.env` (не коммитить) и `.env.example` (коммитить).
`docker-compose.yml` передаёт их через синтаксис `${VAR}`.

| Переменная | Где используется | Обязательная |
|---|---|---|
| `JWT_SECRET` | backend/config/env.js | ✅ |
| `REFRESH_TOKEN_SECRET` | backend/config/env.js | ✅ |
| `DATABASE_URL` | backend/config/env.js → db/pool.js | ✅ |
| `JWT_EXPIRES_IN` | backend/config/env.js | по умолчанию `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | backend/config/env.js | по умолчанию `7d` |
| `CORS_ORIGIN` | backend/app.js | — |
| `NODE_ENV` | backend (bcrypt rounds, cookie secure flag) | — |
| `BACKEND_PORT` | docker-compose → backend `PORT` | по умолчанию `3000` |
| `FRONTEND_PORT` | docker-compose → nginx host port | по умолчанию `80` |
| `POSTGRES_USER` | docker-compose → postgres + DATABASE_URL | ✅ (docker) |
| `POSTGRES_PASSWORD` | docker-compose → postgres + DATABASE_URL | ✅ (docker) |
| `POSTGRES_DB` | docker-compose → postgres + DATABASE_URL | ✅ (docker) |

`config/env.js` бросает ошибку при старте, если `JWT_SECRET`, `REFRESH_TOKEN_SECRET` или `DATABASE_URL` не заданы.

### TypeORM

- `db/data-source.ts` — единственный `AppDataSource`. Импортируй `initDb()` для инициализации.
- `synchronize: true` — TypeORM автоматически создаёт/обновляет таблицы по сущностям. При добавлении полей в сущность таблица обновляется без миграций.
- Сущности используют `!` (definite assignment) на полях — TypeORM заполняет их из БД, не из конструктора.
- Репозитории получают `AppDataSource.getRepository(Entity)` и не хранят его как переменную модуля (DataSource может ещё не быть инициализирован).
- `reflect-metadata` импортируется в `index.ts` перед всем остальным.

### Схема базы данных

Таблицы создаются автоматически при запуске через `db/pool.js` → `initDb()`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id         UUID         PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token      TEXT         PRIMARY KEY,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);
```

---

## Запуск локально

```bash
# Docker (production-like)
docker compose up --build          # → http://localhost

# Development
cd backend  && npm run dev         # nodemon, port 3000
cd frontend && npm run dev         # Vite HMR, port 5173
```

---

## Тестирование

### Backend — `node:test` + supertest

```bash
# Требует запущенного PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres cd backend && npm test
# node --test __tests__/**/*.test.js
```

**Соглашения (скиллы: javascript-typescript-jest, nodejs-express-server):**
- Каждый тест-файл устанавливает `process.env.*` **перед** любым `require()`, чтобы `config/env.js` их видел. `DATABASE_URL` берётся из env или fallback на `localhost`.
- `before` вызывает `initDb()` для создания таблиц. `beforeEach` делает `DELETE FROM` через `__resetStore()`. `after` закрывает пул.
- `SALT_ROUNDS = 1` при `NODE_ENV=test` — задаётся в `services/auth.service.js`.
- Тесты интеграционного уровня (реальный Express + реальный PostgreSQL + supertest). Ничего не мокировать.
- Имена тестов описывают HTTP-контракт: `'возвращает 401 при неверном пароле'`, а не `'должен упасть'`.

### Frontend — Vitest + React Testing Library

```bash
cd frontend && npm test            # watch mode
cd frontend && npm run test:coverage
cd frontend && npm run typecheck   # проверка типов без сборки
```

**Соглашения (скиллы: vitest, javascript-typescript-jest):**
- Тест-файлы располагаются **рядом** с тестируемым кодом (`LoginPage.test.tsx` рядом с `LoginPage.tsx`).
- Мокируй `@/shared/auth` (useSession) и `react-router-dom` (useNavigate) на уровне модуля через `vi.mock()`.
- Используй `@testing-library/user-event` вместо `fireEvent` для реалистичных взаимодействий.
- Запросы к элементам — по роли/лейблу, никогда по классу или test ID (если только неизбежно).
- `vi.clearAllMocks()` в `beforeEach`.
- Состояние ошибки должно рендерить `role="alert"` — тестировать через `screen.getByRole('alert')`.

---

## Стиль кода

- **Backend**: TypeScript, CommonJS компиляция (`tsc`), async/await, без колбэков. Запуск в dev через `tsx watch`.
- **Frontend**: ESM (`import`/`export`), TypeScript, React 19 функциональные компоненты.
- **Стилизация**: Tailwind CSS v4, утилитарные классы инлайн в JSX. Без CSS Modules.
- **Обработка ошибок**: никогда не глотать ошибки молча. Backend → `next(err)`. Frontend → устанавливать error state и показывать `role="alert"`.
- Следуй **YAGNI**: не добавляй абстракции, обработчики ошибок или фичи, которые явно не запрошены.

---

## Установленные скиллы

| Скилл | Применение |
|---|---|
| `nodejs-express-server` | Слоистая архитектура backend, AppError, errorHandler middleware |
| `javascript-typescript-jest` | Структура тестов, описательные имена, стратегия мокирования |
| `vitest` | Конфигурация frontend тестов, утилиты vi, coverage |
| `vercel-react-best-practices` | Правила производительности React (параллельные fetch, нет инлайн-компонентов, functional setState) |
| `react-component-structure` | 1 файл = 1 компонент, стрелочные функции, type для props, interface для контрактов, нет export default |
| `feature-sliced-design` | FSD v2.1 архитектура frontend |

Скиллы установлены в `.agents/skills/`. Читай `SKILL.md` в каждой директории.

---

## Что НЕЛЬЗЯ делать

- **Не** читать `process.env` напрямую в backend коде — использовать `config/env.js`.
- **Не** помещать бизнес-логику в контроллеры или routes.
- **Не** помещать HTTP/Express код в сервисы.
- **Не** импортировать из FSD-слоя выше текущего (`shared` не импортирует из `pages`).
- **Не** обходить публичный API FSD-слайса (импортировать из `index.ts`, не из внутренних файлов).
- **Не** хранить access token в `localStorage` или `sessionStorage`.
- **Не** раскрывать stack traces в production ответах.
- **Не** коммитить `.env`.
- **Не** создавать папки `components/`, `contexts/`, `api/` в корне `src/` — это legacy структура.
- **Не** создавать `.module.css` файлы — стилизация только через Tailwind CSS v4.
- **Не** помещать assets в `src/assets/` — только в `src/shared/assets/`.
- **Не** создавать новые файлы без необходимости — предпочитай редактировать существующие.
- **Не** добавлять фичи, обработчики ошибок или абстракции сверх явно запрошенного (YAGNI).
- **Не** использовать ключевое слово `function` в компонентах — только стрелочные функции.
- **Не** использовать `interface` для props компонентов — только `type`.
- **Не** использовать `export default` — только именованные экспорты.
