# 3205 — URL Checker

Сервис асинхронной проверки списка URL. Пользователь отправляет список ссылок,
бэкенд параллельно (не более 5 одновременно на задание) шлёт `HEAD`-запросы,
фронт периодически опрашивает прогресс и умеет отменить задание.

Тестовое задание fullstack-разработчика.

## Стек

- **Backend:** Node.js 20 + TypeScript + NestJS, in-memory хранилище (`Map`)
- **Frontend:** React 19 + TypeScript + Vite + Zustand
- **Shared:** общие TS-типы в `packages/shared` (pnpm workspace)
- **Docker:** multi-stage образы + docker-compose (nginx перед фронтом)

## Быстрый старт (Docker)

```bash
docker compose up --build
```

Открыть http://localhost:5174

Что происходит:
- собираются два образа (backend, frontend)
- nginx во фронт-контейнере отдаёт статику и проксирует `/api` в бэк-контейнер
- бэк слушает `4000` внутри сети docker-compose

## Ручной запуск (dev)

Требования: Node.js 20+, pnpm 8+.

```bash
pnpm install
```

В двух отдельных терминалах:

```bash
# терминал 1 — backend на :4000
pnpm --filter backend start:dev

# терминал 2 — frontend на :5174
pnpm --filter frontend dev
```

Открыть http://localhost:5174

## API

- `POST /api/jobs` — создать задание, тело `{ urls: string[] }`, возвращает `{ jobId }`
- `GET /api/jobs` — список заданий с агрегатами (успех/ошибка)
- `GET /api/jobs/:id` — полное задание со статусами каждого URL
- `DELETE /api/jobs/:id` — отменить задание (уже начатые URL доигрываются, остальные помечаются `cancelled`)

## Структура

```
apps/
  backend/         Nest API
    src/
      jobs/        controller, service, repository, worker
      url-check/   HEAD-запросы
  frontend/        React SPA
    src/
      api/         тонкие fetch-обёртки
      store/       Zustand (селекторы + actions)
      hooks/       usePollingJob
      components/  формы, список, детали, ui/
packages/
  shared/          общие TS-типы (Job, статусы)
```

### Backend — детали

- Воркер стартует в фоне при создании задания, ограничен 5 одновременными HEAD-запросами через `p-limit`.
- Перед сохранением результата каждого URL — искусственная задержка 0–10 сек (по ТЗ, чтобы прогресс был визуально виден).
- HTTP-ответ (любой, включая 4xx/5xx) → статус `success`. Сетевая ошибка (DNS, timeout, ECONNREFUSED) → статус `error`.
- Отмена: воркер перед взятием каждого URL проверяет `job.status === 'cancelled'` и выходит; уже in-flight HEAD-запросы доигрываются.

### Frontend — детали

- Polling через `usePollingJob` — `GET /api/jobs/:id` каждые 1.5 сек, останавливается на терминальном статусе (`completed`/`cancelled`).
- `AbortController` рвёт in-flight запрос при смене активного задания — защита от stale responses.
- Стор разделён на подписки-хуки для чтения (`useJobsList`, `useActiveJobId` и т.д.) и объект `jobsActions` для мутаций — компоненты не тянут через хук ничего лишнего.

## Тесты

```bash
pnpm --filter backend test
```

## Известные ограничения

- Хранилище in-memory: данные пропадают при рестарте бэка (по ТЗ так и требуется).
- Нет авторизации, rate limiting, логирования — вне скоупа.
