.DEFAULT_GOAL := help

# ──────────────────────────────────────────────────────────────────────────────
# Gey Sinan — Monorepo Makefile
# ──────────────────────────────────────────────────────────────────────────────

.PHONY: help setup dev test lint clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

setup: ## Install all dependencies and pre-commit hooks
	@echo "→ Installing pre-commit hooks..."
	pre-commit install
	@echo "→ Installing Python dependencies..."
	@if [ -f backend/requirements/dev.txt ]; then \
		pip install -r backend/requirements/dev.txt; \
	else \
		echo "  (backend/requirements/dev.txt not found — skipping)"; \
	fi
	@echo "→ Installing Node dependencies..."
	@if [ -f package.json ]; then \
		npm install; \
	fi
	@if [ -f apps/expo/package.json ]; then \
		cd apps/expo && npm install; \
	fi
	@echo "→ Starting database and running migrations..."
	@if [ -f backend/docker-compose.yml ]; then \
		docker compose -f backend/docker-compose.yml up -d db; \
		sleep 3; \
		docker compose -f backend/docker-compose.yml run --rm backend python manage.py migrate; \
	else \
		echo "  (backend/docker-compose.yml not found — skipping DB setup)"; \
	fi
	@echo "→ Setup complete. Run 'make dev' to start development."

dev: ## Start full local dev stack (Django + Postgres + Redis + Celery + Expo)
	@echo "→ Starting backend services..."
	@if [ -f backend/docker-compose.yml ]; then \
		docker compose -f backend/docker-compose.yml up -d; \
	else \
		echo "  (backend/docker-compose.yml not found — skipping)"; \
	fi
	@echo "→ Starting Expo..."
	@if [ -f apps/expo/package.json ]; then \
		cd apps/expo && npx expo start; \
	else \
		echo "  (apps/expo/package.json not found — skipping Expo)"; \
	fi

test: ## Run all tests (backend pytest + frontend jest)
	@echo "→ Running backend tests..."
	@if [ -d backend ]; then \
		cd backend && python -m pytest; \
	else \
		echo "  (backend/ not found — skipping)"; \
	fi
	@echo "→ Running frontend tests..."
	@if [ -f apps/expo/package.json ]; then \
		cd apps/expo && npm test -- --watchAll=false; \
	else \
		echo "  (apps/expo not found — skipping)"; \
	fi

lint: ## Run all linters (ruff for Python, eslint for TS)
	@echo "→ Linting Python..."
	@if [ -d backend ]; then \
		ruff check backend/; \
		ruff format --check backend/; \
	else \
		echo "  (backend/ not found — skipping)"; \
	fi
	@echo "→ Linting TypeScript..."
	@if [ -f apps/expo/package.json ]; then \
		cd apps/expo && npx eslint . --ext .ts,.tsx; \
	elif [ -f package.json ]; then \
		npx eslint src/ --ext .ts,.tsx; \
	fi

clean: ## Stop containers and remove build artifacts
	@echo "→ Stopping Docker containers..."
	@if [ -f backend/docker-compose.yml ]; then \
		docker compose -f backend/docker-compose.yml down; \
	fi
	@echo "→ Removing build artifacts..."
	@if [ -d apps/expo/dist ]; then rm -rf apps/expo/dist; fi
	@if [ -d .next ]; then rm -rf .next; fi
	@if [ -d backend/__pycache__ ]; then find backend -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null || true; fi
	@echo "→ Clean complete."
