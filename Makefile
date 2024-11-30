# Makefile
.PHONY: help dev prod deploy-prod deploy-staging check-git-repo init-git

# Colors for terminal output
CYAN=\033[0;36m
RED=\033[0;31m
GREEN=\033[0;32m
NC=\033[0m # No Color

# Development Environment
dev:
	@echo "$(CYAN)Starting development environment...$(NC)"
	docker-compose -f docker-compose.yml up --build

# Production Build & Deploy
deploy-prod: deploy-backend-prod deploy-frontend-prod

deploy-backend-prod:
	cd backend && \
	tar -czf deploy.tar.gz * && \
	caprover deploy -a weaver-api -t ./deploy.tar.gz && \
	rm deploy.tar.gz

deploy-frontend-prod:
	cd frontend && \
	tar -czf deploy.tar.gz * && \
	caprover deploy -a weaver -t ./deploy.tar.gz && \
	rm deploy.tar.gz

# Build production images locally (for testing)
build-prod:
	@echo "$(CYAN)Building production images locally...$(NC)"
	docker build -f frontend/Dockerfile.prod -t weaver-frontend:prod ./frontend
	docker build -f backend/Dockerfile.prod -t weaver-backend:prod ./backend

# Local development utilities
install-dev:
	@echo "$(CYAN)Installing development dependencies...$(NC)"
	cd frontend && npm install
	cd backend && npm install

start-dev:
	@echo "$(CYAN)Starting local development servers...$(NC)"
	make -j 2 start-frontend-dev start-backend-dev

start-frontend-dev:
	cd frontend && npm start

start-backend-dev:
	cd backend && npm run dev

# Clean up
clean:
	@echo "$(CYAN)Cleaning up...$(NC)"
	docker-compose down --rmi all --volumes --remove-orphans
	rm -rf frontend/node_modules backend/node_modules
	rm -rf frontend/build backend/dist

# Help
help:
	@echo "$(CYAN)Available commands:$(NC)"
	@echo "Development:"
	@echo "  make dev              - Start local development environment with Docker"
	@echo "  make install-dev      - Install development dependencies"
	@echo "  make start-dev        - Start local development servers"
	@echo ""
	@echo "Production:"
	@echo "  make deploy-prod      - Deploy to production"
	@echo "  make deploy-backend-prod      - Deploy backend to production"
	@echo "  make deploy-frontend-prod      - Deploy frontend to production"
	@echo "  make build-prod       - Build production images locally"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            - Clean up development environment"
	@echo "  make help             - Show this help message"