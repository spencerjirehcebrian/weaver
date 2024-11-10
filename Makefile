# Makefile
.PHONY: help build up down logs clean cli-setup test install migrate dev prod db-reset db-init

# Colors for terminal output
CYAN=\033[0;36m
NC=\033[0m # No Color

# Default target
help:
	@echo "$(CYAN)Available commands:$(NC)"
	@echo "Development:"
	@echo "  make install    - Install dependencies for all services"
	@echo "  make dev        - Start all services in development mode"
	@echo "  make build      - Build all Docker images"
	@echo "  make up         - Start all services in production mode"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo ""
	@echo "CLI:"
	@echo "  make install-cli- Install the Weaver CLI tool globally"
	@echo ""
	@echo "Database:"
	@echo "  make migrate    - Run database migrations"
	@echo ""
	@echo "Utilities:"
	@echo "  make logs       - View logs from all services"
	@echo "  make clean      - Remove all containers and images"
	@echo "  make test       - Run tests for all services"

# Install CLI
install-cli:
	@echo "$(CYAN)Installing Weaver CLI...$(NC)"
	@./install.sh

# Install dependencies
install:
	@echo "$(CYAN)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(CYAN)Installing backend dependencies...$(NC)"
	cd backend && npm install

# Development mode
dev:
	@echo "$(CYAN)Starting services in development mode...$(NC)"
	docker-compose -f docker-compose.yml up --build

# Build all Docker images
build:
	@echo "$(CYAN)Building Docker images...$(NC)"
	docker-compose build

# Start all services in production mode
up:
	@echo "$(CYAN)Starting services in production mode...$(NC)"
	docker-compose up -d

# Stop all services
down:
	@echo "$(CYAN)Stopping all services...$(NC)"
	docker-compose down

# Restart all services
restart: down up
	@echo "$(CYAN)Services restarted$(NC)"

# View logs from all services
logs:
	@echo "$(CYAN)Showing logs...$(NC)"
	docker-compose logs -f

# Remove all containers and images
clean:
	@echo "$(CYAN)Cleaning up Docker resources...$(NC)"
	docker-compose down --rmi all --volumes --remove-orphans
	rm -rf frontend/node_modules
	rm -rf backend/node_modules

# Run database migrations
migrate:
	@echo "$(CYAN)Running database migrations...$(NC)"
	docker-compose exec backend npm run migrate

# Install the CLI tool
cli-setup:
	@echo "$(CYAN)Setting up CLI...$(NC)"
	@bash cli/setup.sh

# Run tests for all services
test:
	@echo "$(CYAN)Running frontend tests...$(NC)"
	docker-compose run frontend npm test
	@echo "$(CYAN)Running backend tests...$(NC)"
	docker-compose run backend npm test

# Useful shortcuts for individual services
.PHONY: fe-logs be-logs pg-logs
fe-logs:
	docker-compose logs -f frontend

be-logs:
	docker-compose logs -f backend

pg-logs:
	docker-compose logs -f postgres


# Initialize database schema
db-init:
	@echo "$(CYAN)Initializing database schema...$(NC)"
	docker-compose exec postgres psql -U postgres -d weaver -f /docker-entrypoint-initdb.d/init.sql

# Reset database (careful - this deletes all data!)
db-reset:
	@echo "$(CYAN)Resetting database...$(NC)"
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to start..."
	@sleep 5