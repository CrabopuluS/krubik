# Krubik

Полноценный стек для вычисления решения кубика Рубика методом Коцимбы. Репозиторий содержит FastAPI-бэкенд, фронтенд на React + Vite и инфраструктуру для запуска через Docker Compose с обратным прокси и HTTPS.

## Структура

- `backend/` — приложение FastAPI с REST API `/solve` и сервисом-обёрткой над `kociemba`.
- `frontend/` — интерфейс на React 18 + TypeScript с визуализацией куба и отображением маршрута.
- `infrastructure/` — конфигурация Nginx для обратного прокси.
- `docker-compose.yml` — описание сервисов (backend, frontend, proxy).

## Подготовка окружения

### Зависимости

- Python 3.12+
- Node.js LTS (20.x)
- Docker 24+ и Docker Compose Plugin

### Установка зависимостей

```bash
make install
```

### Генерация дев-сертификата

Для запуска HTTPS-прокси необходимо создать самоподписанный сертификат:

```bash
mkdir -p infrastructure/nginx/certs
openssl req -x509 -nodes -days 365 \
  -subj "/CN=localhost" \
  -newkey rsa:2048 \
  -keyout infrastructure/nginx/certs/dev.key \
  -out infrastructure/nginx/certs/dev.crt
```

## Скрипты

- `make lint` — статический анализ Python (ruff, black, mypy) и ESLint.
- `make test` — запуск pytest + Jest.
- `make dev` — запуск всего стека через Docker Compose (`https://localhost`).

## Переменные окружения

Скопируйте `.env.sample` в `.env` и при необходимости измените значения:

- `API_HOST`, `API_PORT` — конфигурация uvicorn.
- `CORS_ORIGINS` — список разрешённых Origins (через запятую).
- `VITE_API_URL` — публичный URL эндпоинта `/solve` для фронтенда.

## Работа с API

`POST /solve`

```json
{
  "state": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
}
```

Ответ:

```json
{
  "moves": ["R", "U", "R'", "U'"]
}
```

Код 422 возвращается при неверной валидации состояния, 400 — при ошибке решателя.

## Тестирование

```bash
make test
```

## Разработка фронтенда/бэкенда локально

- Фронтенд: `npm run dev`
- Бэкенд: `uvicorn app.main:app --reload`

## Лицензия

MIT
