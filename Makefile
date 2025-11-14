.PHONY: install lint test dev

install:
	pip install -e .[dev]
	npm install

lint:
	ruff check backend/app backend/tests
	black --check backend/app backend/tests
	mypy backend/app backend/tests
	npm run lint -- --max-warnings=0

test:
	pytest
	npm test -- --runInBand

dev:
	docker compose up --build
