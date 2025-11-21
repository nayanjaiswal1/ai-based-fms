# Task Configuration Files Summary

This document lists all the task configuration files created to help you run all services easily.

## Files Created

### 1. VS Code Configuration Files

#### `.vscode/tasks.json`
- **Purpose:** VS Code task definitions for running services
- **Features:**
  - Start All Services (combined task)
  - Start Docker Services
  - Start Backend
  - Start Frontend
  - Stop Docker Services
  - Database operations (migrations, seed, create admin)
  - Lint and test tasks
  - Build tasks
  - Docker logs viewing

**How to use:**
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select the task you want to run

#### `.vscode/launch.json`
- **Purpose:** VS Code debugging configurations
- **Features:**
  - Attach to Backend (port 9229)
  - Launch Frontend in Chrome
  - Full Stack Debug (compound configuration)

**How to use:**
1. Start services first
2. Press `F5` or go to Run and Debug view
3. Select debug configuration

### 2. Scripts for Running Services

#### `start-all.bat` (Windows)
- **Purpose:** Start all services on Windows
- **What it does:**
  1. Starts Docker services (PostgreSQL, Redis)
  2. Starts Backend (NestJS) in new window
  3. Starts Frontend (React) in new window
  4. Shows Docker logs

**How to use:**
```cmd
start-all.bat
```

#### `stop-all.bat` (Windows)
- **Purpose:** Stop all services on Windows
- **What it does:**
  1. Stops Docker containers
  2. Kills all Node.js processes

**How to use:**
```cmd
stop-all.bat
```

#### `start-all.sh` (Linux/Mac)
- **Purpose:** Start all services on Linux/Mac
- **What it does:**
  1. Starts Docker services
  2. Starts Backend as background process
  3. Starts Frontend as background process
  4. Shows PIDs and service URLs

**How to use:**
```bash
chmod +x start-all.sh  # First time only
./start-all.sh
```

#### `stop-all.sh` (Linux/Mac)
- **Purpose:** Stop all services on Linux/Mac
- **What it does:**
  1. Stops Docker containers
  2. Kills Node.js processes

**How to use:**
```bash
chmod +x stop-all.sh  # First time only
./stop-all.sh
```

#### `dev.bat` (Windows)
- **Purpose:** Quick development start using concurrently
- **What it does:**
  1. Checks and installs root dependencies if needed
  2. Runs backend and frontend concurrently

**How to use:**
```cmd
dev.bat
```

### 3. NPM Scripts Configuration

#### `package.json` (Root Level)
- **Purpose:** Centralized npm scripts for the entire monorepo
- **Key Scripts:**

**Development:**
```bash
npm run dev                    # Run backend + frontend concurrently
npm run dev:all                # Run docker + backend + frontend
npm run backend:dev            # Backend only
npm run frontend:dev           # Frontend only
```

**Docker:**
```bash
npm run docker:up              # Start Docker services
npm run docker:down            # Stop Docker services
npm run docker:logs            # View logs
npm run docker:ps              # List services
```

**Database:**
```bash
npm run db:migrate             # Run migrations
npm run db:migrate:revert      # Rollback migration
npm run db:seed                # Seed default data
npm run db:create-admin        # Create admin user
```

**Code Quality:**
```bash
npm run lint                   # Lint all code
npm run format                 # Format all code
npm run test                   # Run all tests
npm run build                  # Build all projects
```

**Utilities:**
```bash
npm run install:all            # Install all dependencies
npm run setup:dev              # First-time setup
npm run clean                  # Clean build artifacts
```

### 4. Documentation Files

#### `RUN_SERVICES.md`
- **Purpose:** Comprehensive guide for running services
- **Contents:**
  - Multiple methods to run services
  - VS Code tasks documentation
  - First-time setup guide
  - Service URLs reference
  - Debugging instructions
  - Troubleshooting guide
  - Environment variables
  - Quick commands reference

#### `QUICK_START.md`
- **Purpose:** Quick start guide for new users
- **Contents:**
  - Prerequisites checklist
  - Installation steps
  - Multiple ways to run the app
  - Service URLs
  - Common commands
  - Basic troubleshooting
  - Next steps

#### `TASK_CONFIGS_SUMMARY.md` (This File)
- **Purpose:** Overview of all task configuration files
- **Contents:**
  - List of all files created
  - Purpose and features of each file
  - Usage instructions

## Quick Reference

### First-Time Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start Docker services:**
   ```bash
   npm run docker:up
   ```

3. **Setup database:**
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run db:create-admin
   ```

### Daily Development Workflow

**Option 1: Single Command (Recommended)**
```bash
npm run dev
```

**Option 2: Using Scripts**
- Windows: `start-all.bat`
- Linux/Mac: `./start-all.sh`

**Option 3: VS Code Tasks**
1. Press `Ctrl+Shift+P`
2. Select "Tasks: Run Task"
3. Choose "Start All Services"

### Stopping Services

**Quick Stop:**
```bash
npm run docker:down
```
Then press `Ctrl+C` in terminal running dev servers.

**Complete Stop:**
- Windows: `stop-all.bat`
- Linux/Mac: `./stop-all.sh`

## Service URLs After Starting

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React application |
| Backend API | http://localhost:3000/api | REST API |
| API Docs | http://localhost:3000/api/docs | Swagger UI |
| WebSocket | ws://localhost:3000/notifications | Real-time updates |

## Dependencies Required

The root `package.json` includes these dependencies for the task runner:

- **concurrently**: Run multiple commands concurrently
- **rimraf**: Cross-platform file deletion

Install with:
```bash
npm install
```

## File Structure

```
ai-based-fms/
├── .vscode/
│   ├── tasks.json          # VS Code tasks
│   └── launch.json         # VS Code debug configs
├── backend/                # Backend application
├── frontend/               # Frontend application
├── start-all.bat          # Windows start script
├── stop-all.bat           # Windows stop script
├── start-all.sh           # Linux/Mac start script
├── stop-all.sh            # Linux/Mac stop script
├── dev.bat                # Windows dev script
├── package.json           # Root npm scripts
├── docker-compose.yml     # Docker configuration
├── RUN_SERVICES.md        # Detailed guide
├── QUICK_START.md         # Quick start guide
└── TASK_CONFIGS_SUMMARY.md # This file
```

## Customization

### Adding Custom Tasks

Edit `.vscode/tasks.json` to add new tasks:

```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "your-command-here",
  "problemMatcher": []
}
```

### Adding Custom NPM Scripts

Edit root `package.json`:

```json
{
  "scripts": {
    "my-script": "echo 'Hello World'"
  }
}
```

### Modifying Start Scripts

- Windows: Edit `start-all.bat` and `stop-all.bat`
- Linux/Mac: Edit `start-all.sh` and `stop-all.sh`

## Best Practices

1. **Use `npm run dev` for daily development** - Fastest and simplest
2. **Use VS Code tasks for specific operations** - Migrations, seeds, etc.
3. **Use start-all scripts for demo/presentation** - Visual separate windows
4. **Always run `npm run docker:up` before backend** - Database must be ready
5. **Use `npm run docker:down` when done** - Free up system resources

## Troubleshooting

### Tasks not appearing in VS Code
- Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
- Check `.vscode/tasks.json` for syntax errors

### Concurrently not working
```bash
# Install root dependencies
npm install
```

### Scripts not executable (Linux/Mac)
```bash
chmod +x start-all.sh stop-all.sh
```

### Port conflicts
```bash
# Check what's using ports
npm run docker:ps
netstat -ano | findstr :3000  # Windows
lsof -ti:3000                 # Linux/Mac
```

## Additional Resources

- **Architecture:** `CLAUDE.md`
- **Setup Guide:** `SETUP.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md`
- **API Documentation:** http://localhost:3000/api/docs (when running)

## Support

If you encounter issues:
1. Check `RUN_SERVICES.md` troubleshooting section
2. Check `BUGS_AND_ISSUES.md` for known issues
3. Verify all prerequisites are installed
4. Check Docker Desktop is running
5. Verify ports 3000, 5173, 5432, 6379 are available

---

**Last Updated:** 2025-11-20
**Version:** 1.0.0
