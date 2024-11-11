# Makefile
.PHONY: help build up down logs clean cli-setup test install migrate dev prod db-reset db-init local-dev local-install local-stop

# Colors for terminal output
CYAN=\033[0;36m
NC=\033[0m # No Color

# Default target
help:
	@echo "$(CYAN)Available commands:$(NC)"
	@echo "Development:"
	@echo "  make local-install  - Install dependencies for local development"
	@echo "  make local-dev      - Run frontend and backend locally with Docker PostgreSQL"
	@echo "  make local-stop     - Stop local development servers"
	@echo "  make install        - Install dependencies for all services"
	@echo "  make dev           - Start all services in Docker development mode"
	@echo "  make build         - Build all Docker images"
	@echo "  make up            - Start all services in production mode"
	@echo "  make down          - Stop all services"
	@echo "  make restart       - Restart all services"
	@echo ""
	@echo "CLI:"
	@echo "  make install-cli   - Install the Weaver CLI tool globally"
	@echo ""
	@echo "Database:"
	@echo "  make migrate       - Run database migrations"
	@echo ""
	@echo "Utilities:"
	@echo "  make logs          - View logs from all services"
	@echo "  make clean         - Remove all containers and images"
	@echo "  make test          - Run tests for all services"

# Local development setup
local-install:
	@echo "$(CYAN)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(CYAN)Installing backend dependencies...$(NC)"
	cd backend && npm install
	@echo "$(CYAN)Starting PostgreSQL container...$(NC)"
	docker-compose up -d postgres
	@echo "$(CYAN)Waiting for PostgreSQL to start...$(NC)"
	sleep 5
	@echo "$(CYAN)Running database initialization...$(NC)"
	docker-compose exec postgres psql -U postgres -d weaver -f /docker-entrypoint-initdb.d/init.sql

# Run frontend and backend locally
local-dev:
	@echo "$(CYAN)Starting PostgreSQL if not running...$(NC)"
	docker-compose up -d postgres
	@echo "$(CYAN)Starting backend in the background...$(NC)"
	cd backend && PORT=4000 DB_HOST=localhost npm run dev & echo $$! > backend.pid
	@echo "$(CYAN)Starting frontend in the background...$(NC)"
	cd frontend && PORT=3010 npm start & echo $$! > frontend.pid
	@echo "$(CYAN)Local development servers are running:$(NC)"
	@echo "Frontend: http://localhost:3010"
	@echo "Backend:  http://localhost:4000"
	@echo "To stop the servers, run: make local-stop"

# Stop local development servers
# Enhanced stop command
local-stop:
	@echo "$(CYAN)Stopping local development servers...$(NC)"
	-@pkill -f "node.*frontend" || true
	-@pkill -f "node.*backend" || true
	-@lsof -ti :3010 | xargs kill -9 || true
	-@lsof -ti :4000 | xargs kill -9 || true
	-@rm -f frontend/frontend.pid backend/backend.pid
	@echo "$(CYAN)Stopping PostgreSQL container...$(NC)"
	docker-compose stop postgres
	@echo "$(CYAN)Cleanup complete$(NC)"

# Optional command to show running processes
local-ps:
	@echo "$(CYAN)Checking running processes...$(NC)"
	@echo "Frontend (port 3010):"
	@lsof -i :3010 || echo "No process using port 3010"
	@echo "\nBackend (port 4000):"
	@lsof -i :4000 || echo "No process using port 4000"
	@echo "\nNode processes:"
	@ps aux | grep node | grep -v grep || echo "No node processes found"

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

# Development mode (all in Docker)
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

# Clean up
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
	cd frontend && npm test
	@echo "$(CYAN)Running backend tests...$(NC)"
	cd backend && npm test