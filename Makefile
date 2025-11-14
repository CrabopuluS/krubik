.PHONY: install lint lint-python lint-frontend test test-backend test-frontend test-e2e dev format

install:
pip install -e .[dev]
npm install

lint: lint-python lint-frontend

lint-python:
ruff check backend/app backend/tests
black --check backend/app backend/tests
mypy backend/app backend/tests

lint-frontend:
npm run lint -- --max-warnings=0
npm run format

format:
black backend/app backend/tests
npm run format:fix
ruff check backend/app backend/tests --fix-only

test: test-backend test-frontend

test-backend:
pytest

test-frontend:
npm test -- --runInBand

test-e2e:
npm run test:e2e

dev:
docker compose up --build
