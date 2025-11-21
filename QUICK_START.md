# Quick Start Guide

Get your Finance Management System up and running in minutes!

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ Node.js v18+ installed
- ✅ Git installed

## Installation (One-Time Setup)

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for root, backend, and frontend.

### 2. Start Docker Services

```bash
npm run docker:up
```

Wait 5-10 seconds for PostgreSQL and Redis to initialize.

### 3. Setup Database

```bash
npm run db:migrate
npm run db:seed
```

### 4. Create Admin User

```bash
npm run db:create-admin
```

Follow the prompts to create your admin account.

## Running the Application

### Option 1: Quick Start (Recommended)

**Single Command to Run Everything:**

```bash
npm run dev
```

This runs both backend and frontend concurrently in one terminal.

### Option 2: Using Scripts

**Windows:**
```cmd
start-all.bat
```

**Linux/Mac:**
```bash
./start-all.sh
```

### Option 3: Separate Terminals

**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend:dev
```

## Access the Application

| Service | URL |
|---------|-----|
| 🌐 **Frontend** | http://localhost:5173 |
| 🔌 **Backend API** | http://localhost:3000/api |
| 📚 **API Docs** | http://localhost:3000/api/docs |

## Stopping the Application

**Stop Docker services:**
```bash
npm run docker:down
```

**Stop all processes:**
- Windows: Run `stop-all.bat`
- Linux/Mac: Run `./stop-all.sh`
- Or press `Ctrl+C` in the terminal

## Common Commands

```bash
# Development
npm run dev                    # Run backend + frontend
npm run backend:dev            # Run backend only
npm run frontend:dev           # Run frontend only

# Database
npm run db:migrate             # Run migrations
npm run db:seed                # Seed data
npm run db:create-admin        # Create admin user

# Docker
npm run docker:up              # Start services
npm run docker:down            # Stop services
npm run docker:logs            # View logs

# Testing & Quality
npm run lint                   # Lint all code
npm run test                   # Run all tests
npm run build                  # Build for production
```

## Troubleshooting

### Port 3000 or 5173 Already in Use

**Windows:**
```cmd
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# Restart Docker services
npm run docker:down
npm run docker:up
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker ps

# View logs
npm run docker:logs
```

## Next Steps

1. 📖 Read `RUN_SERVICES.md` for detailed service management
2. 🏗️ Read `CLAUDE.md` for architecture and development guidelines
3. 🚀 Read `DEPLOYMENT_GUIDE.md` for production deployment
4. 📝 Explore API at http://localhost:3000/api/docs

## VS Code Users

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Tasks: Run Task"
3. Select "Start All Services"

All services will start in separate VS Code terminal panels!

## Need Help?

- Check `RUN_SERVICES.md` for comprehensive guide
- Check `SETUP.md` for detailed setup instructions
- View API documentation at http://localhost:3000/api/docs
- Check `BUGS_AND_ISSUES.md` for known issues

Happy coding! 🚀
