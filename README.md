# 🕸️ Weavyr

A modern, real-time code collection and collaboration tool that helps developers gather, and share code snippets, directories and repositories across their development environment. Meant to be used for feeding context and code to LLMs for better results. Heavily inspired by Repomix.

> ⚠️ **Development Status**: This project is in early development and is not yet stable. APIs and features may change significantly between versions. Use at your own risk.

## 🌐 Usage

### Web Interface

Visit [weaver.spencerjireh.com](https://weaver.spencerjireh.com) to access the web interface.

### CLI Installation

Install the Weavyr CLI tool globally using npm:

```bash
npm install -g weavyr
```

### CLI Usage

```bash
weavyr [OPTIONS]

Options:
  -d <directory>    Search directory (default: current directory)
  -o <file>         Output filename (default: collected_code.txt)
  -e <extensions>   File extensions to include (comma-separated)
  -x <patterns>     Additional patterns to exclude (comma-separated)
  -a               Disable default exclusions
  -q               Quiet mode - suppress progress messages
  -h               Show help message
```

## ✨ Features

- 🔄 Real-time text updates using WebSocket connections
- 🌓 Dark/Light mode support
- 🔍 Full-text search functionality
- ⚡ Fast and responsive interface
- 📱 Mobile-friendly design
- ⚙️ CLI tool for collecting and sending code files
- 🔒 Secure WebSocket implementation
- 🎯 Modern, clean UI with animations and transitions

## 🛠️ Tech Stack

### 🎨 Frontend

- React with TypeScript
- TailwindCSS for styling
- Socket.io-client for real-time updates
- Lucide React for icons

### 🔧 Backend

- Node.js with Express
- TypeScript
- PostgreSQL database
- Socket.io for WebSocket connections

### 🚀 DevOps

- Docker and Docker Compose for containerization
- Nginx for reverse proxy
- CapRover for deployment

## 🏁 Getting Started

### 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally without Docker)
- npm or yarn

### 💻 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd weavyr
```

2. Install dependencies:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:

Create `.env.development` files in both frontend and backend directories using the provided `.env.example` templates.

### 🔨 Development

Start the development environment using Docker Compose:

```bash
make dev
```

Or start services individually:

```bash
# Start frontend
make start-frontend-dev

# Start backend
make start-backend-dev
```

### 🛠️ Local CLI Development

To develop the CLI tool locally:

```bash
# Navigate to the CLI directory
cd cli/weaver-node/weaver

# Build the CLI
npm run build

# Create a global symlink
npm link

# Now you can use 'weavyr' command locally
weavyr --help
```

### 🚀 Production Deployment

Deploy to production using:

```bash
make deploy-prod
```

Or deploy services individually:

```bash
# Deploy backend
make deploy-backend-prod

# Deploy frontend
make deploy-frontend-prod
```

## 📁 Project Structure

```
weavyr/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
├── backend/               # Node.js backend application
│   ├── src/              # Source code
│   └── db/               # Database migrations and schemas
└── cli/                  # Command-line interface tool
```

## 🎯 Features in Detail

### 🔄 Real-time Updates

- WebSocket connection for instant message delivery
- Automatic reconnection handling
- Connection status indicator

### 📝 Message Management

- Expandable message cards
- Copy to clipboard functionality
- Timestamp formatting
- Message sorting (newest/oldest)

### 🔍 Search and Filter

- Real-time search functionality
- ID-based searching
- Content-based filtering

### 🎨 UI/UX

- Responsive design
- Loading states and animations
- Error handling and display
- Empty state handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Credits

Created and maintained by Spencer Jireh Cebrian

---

<div align="center">
  <strong>Like this project? Give it a ⭐️!</strong>
</div>
