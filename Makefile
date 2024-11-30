# Makefile
.PHONY: help dev prod deploy-prod deploy-staging

# Colors for terminal output
CYAN=\033[0;36m
NC=\033[0m # No Color

# Development Environment
dev:
	@echo "$(CYAN)Starting development environment...$(NC)"
	docker-compose -f docker-compose.yml up --build

# Production Build & Deploy
deploy-prod: deploy-backend-prod deploy-frontend-prod

deploy-backend-prod:
	@echo "$(CYAN)Deploying backend to production...$(NC)"
	cd backend && \
	caprover deploy -a weaver-api -b main

deploy-frontend-prod:
	@echo "$(CYAN)Deploying frontend to production...$(NC)"
	cd frontend && \
	caprover deploy -a weaver -b main

# Staging Build & Deploy (if needed)
deploy-staging: deploy-backend-staging deploy-frontend-staging

deploy-backend-staging:
	@echo "$(CYAN)Deploying backend to staging...$(NC)"
	cd backend && \
	caprover deploy -a weaver-api-staging -b staging

deploy-frontend-staging:
	@echo "$(CYAN)Deploying frontend to staging...$(NC)"
	cd frontend && \
	caprover deploy -a weaver-staging -b staging

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
	@echo "  make deploy-staging   - Deploy to staging"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            - Clean up development environment"
	@echo "  make help             - Show this help message"