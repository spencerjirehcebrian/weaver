# Weaver 🕸️

A modern, real-time code collection and collaboration tool that helps developers gather, organize, and share code snippets across their development environment.

> ⚠️ **Development Status**: This project is in early development and is not yet stable. APIs and features may change significantly between versions. Use at your own risk.

## ✨ Features

- **Real-time Sync** - Instantly collect and synchronize code across your development environment
- **Modern Interface** - Clean, responsive design with dark/light mode support
- **Powerful Search** - Quickly find code snippets with full-text search
- **CLI Tool** - Seamlessly collect code from your terminal
- **Live Updates** - Real-time WebSocket updates for collaborative workflows
- **Code Organization** - Automatic language detection and syntax highlighting
- **Quick Copy** - One-click code copying with visual feedback
- **Docker Ready** - Easy deployment with Docker Compose

## 🚀 Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/weaver
cd weaver
```

2. Start the application:

```bash
make dev
```

3. Access the interfaces:

- Web UI: http://localhost:3010
- API: http://localhost:4000

## 🛠️ CLI Installation

### One-Line Install (Linux/macOS)

```bash
curl -sSL https://raw.githubusercontent.com/yourusername/weaver/main/install.sh | bash
```

### Manual Install

```bash
./install.sh
# or
make install-cli
```

### CLI Usage

```bash
# Collect code from current directory
weaver

# Specify target directory
weaver -d /path/to/project

# Filter specific extensions
weaver -e js,py,go

# Exclude patterns
weaver -x "*.test.js,*.min.js"

# Show help
weaver -h
```

## 🏗️ Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 14+

### Environment Setup

1. **Start Services**

```bash
# Development mode
make dev

# Production mode
make up
```

2. **Install Dependencies**

```bash
make install
```

3. **Database Setup**

```bash
make db-init
```

### Available Commands

```bash
make dev          # Start development environment
make up          # Start production environment
make down        # Stop all services
make install     # Install dependencies
make install-cli # Install CLI tool
make test        # Run tests
make clean       # Clean environment
make logs        # View logs
```

## 📁 Project Structure

```
weaver/
├── backend/                # Node.js/Express backend
│   ├── src/               # Backend source code
│   ├── db/                # Database migrations & schemas
│   └── Dockerfile
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.tsx       # Main application
│   └── Dockerfile
├── cli/                   # CLI tool
│   └── weaver.sh         # CLI implementation
├── docker-compose.yml     # Docker services config
├── install.sh            # CLI installer
└── Makefile              # Build automation
```

## 🔧 Configuration

### Environment Variables

**Backend**

```env
NODE_ENV=development
PORT=4000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=weaver
DB_USER=postgres
DB_PASSWORD=postgres
```

**Frontend**

```env
PORT=3010
REACT_APP_API_URL=http://localhost:4000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Credits

Created and maintained by Spencer Jireh Cebrian

---

<div align="center">
  <strong>Like this project? Give it a ⭐️!</strong>
</div>
