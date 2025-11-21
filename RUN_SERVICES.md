# Running All Services - Quick Start Guide

This guide explains how to run all services (Docker, Backend, Frontend) for the Finance Management System.

## Prerequisites

- Docker and Docker Compose installed
- Node.js (v18 or higher) installed
- npm dependencies installed in both `backend/` and `frontend/` directories

## Installation

If you haven't installed dependencies yet:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

## Method 1: Using Scripts (Recommended)

### Windows

**Start all services:**
```cmd
start-all.bat
```

**Stop all services:**
```cmd
stop-all.bat
```

### Linux/Mac

**Start all services:**
```bash
./start-all.sh
```

**Stop all services:**
```bash
./stop-all.sh
```

## Method 2: Using VS Code Tasks

1. Open the project in VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "Tasks: Run Task"
4. Select "Start All Services"

This will start all services in separate terminal panels within VS Code.

### Available VS Code Tasks:

- **Start All Services** - Starts Docker, Backend, and Frontend
- **Start Docker Services** - Only starts PostgreSQL and Redis
- **Start Backend** - Only starts the NestJS backend
- **Start Frontend** - Only starts the React frontend
- **Stop Docker Services** - Stops all Docker containers
- **Run Database Migrations** - Runs pending database migrations
- **Seed Database** - Seeds default categories and tags
- **Create Admin User** - Interactive admin user creation
- **Lint Backend** - Run ESLint on backend code
- **Lint Frontend** - Run ESLint on frontend code
- **Build Backend** - Build backend for production
- **Build Frontend** - Build frontend for production
- **Test Backend** - Run backend unit tests
- **Test Frontend** - Run frontend tests
- **Docker Logs - Backend** - View backend logs
- **Docker Logs - All** - View all Docker service logs

## Method 3: Manual Start (Step by Step)

### Step 1: Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)

### Step 2: Start Backend

```bash
cd backend
npm run start:dev
```

The backend will be available at:
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs

### Step 3: Start Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will be available at:
- Application: http://localhost:5173

## First-Time Setup

After starting all services for the first time, you need to:

### 1. Run Database Migrations

```bash
cd backend
npm run migration:run
```

Or use VS Code task: "Run Database Migrations"

### 2. Seed Default Data

```bash
cd backend
npm run seed
```

Or use VS Code task: "Seed Database"

This creates:
- 16 default categories (Food, Transport, Entertainment, etc.)
- 15 default tags (Urgent, Recurring, Cash, etc.)

### 3. Create Admin User

```bash
cd backend
npm run create-admin
```

Or use VS Code task: "Create Admin User"

Follow the interactive prompts to create your admin account.

## Service URLs

Once all services are running:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:3000/api | REST API endpoints |
| API Documentation | http://localhost:3000/api/docs | Swagger UI |
| WebSocket | ws://localhost:3000/notifications | Real-time notifications |
| PostgreSQL | localhost:5432 | Database (user: fms_user) |
| Redis | localhost:6379 | Cache & sessions |

## Debugging

### VS Code Debug Configurations

1. **Attach to Backend** - Attach debugger to running backend (port 9229)
2. **Launch Frontend in Chrome** - Debug frontend in Chrome
3. **Full Stack Debug** - Debug both backend and frontend simultaneously

To use:
1. Start all services first
2. Press `F5` or go to Run and Debug view
3. Select debug configuration
4. Set breakpoints and debug

### Start Backend in Debug Mode

```bash
cd backend
npm run start:debug
```

Then attach the VS Code debugger.

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

**Windows:**
```cmd
# Find process using port 3000 (backend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Find process using port 5173 (frontend)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Docker Services Not Starting

```bash
# Check Docker is running
docker ps

# View Docker logs
docker-compose logs

# Restart Docker services
docker-compose down
docker-compose up -d
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker-compose ps postgres_new

# View PostgreSQL logs
docker-compose logs postgres_new

# Connect to database manually
docker exec -it postgres_new psql -U fms_user -d fms_db
```

### Frontend Not Connecting to Backend

1. Check backend is running on port 3000
2. Verify CORS is configured (should allow http://localhost:5173)
3. Check `frontend/.env` has correct `VITE_API_URL`
4. Clear browser cache and reload

### WebSocket Connection Issues

1. Verify backend WebSocket gateway is initialized
2. Check browser console for connection errors
3. Ensure JWT token is valid (check cookies)
4. Test connection: `wscat -c ws://localhost:3000/notifications`

## Stopping Services

### Stop All Services

**Windows:**
```cmd
stop-all.bat
```

**Linux/Mac:**
```bash
./stop-all.sh
```

### Stop Individual Services

**Docker only:**
```bash
docker-compose down
```

**Backend only (if running in terminal):**
Press `Ctrl+C` in the backend terminal

**Frontend only (if running in terminal):**
Press `Ctrl+C` in the frontend terminal

### Force Kill All Node Processes

**Windows:**
```cmd
taskkill /F /IM node.exe /T
```

**Linux/Mac:**
```bash
pkill -f node
```

## Production Build

### Build Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Build Frontend
```bash
cd frontend
npm run build
npm run preview
```

For full production deployment, see `DEPLOYMENT_GUIDE.md`.

## Environment Variables

### Backend (.env)

Create `backend/.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fms_user
DATABASE_PASSWORD=fms_password
DATABASE_NAME=fms_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional: AI Features
OPENAI_API_KEY=sk-...

# Optional: OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Frontend (.env)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## Quick Commands Reference

```bash
# Development
npm run start:dev          # Backend dev server
npm run dev                # Frontend dev server

# Database
npm run migration:generate # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Rollback migration
npm run seed               # Seed default data
npm run create-admin       # Create admin user

# Testing
npm test                   # Run tests
npm run test:watch         # Watch mode
npm run test:e2e          # E2E tests

# Code Quality
npm run lint              # Run linter
npm run format            # Format code

# Build
npm run build             # Production build
npm run start:prod        # Run production build

# Docker
docker-compose up -d      # Start services
docker-compose down       # Stop services
docker-compose logs -f    # View logs
docker-compose ps         # List services
```

## Need Help?

- Check `SETUP.md` for detailed setup instructions
- Check `CLAUDE.md` for architecture and development guidelines
- Check `DEPLOYMENT_GUIDE.md` for production deployment
- View API documentation at http://localhost:3000/api/docs
