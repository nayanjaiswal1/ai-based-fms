# AI-Based FMS Setup Guide

## Prerequisites
- Docker Desktop installed and running
- Node.js v18+ installed
- Git installed

## Initial Setup Steps

### 1. Database Setup

#### PostgreSQL Container
```bash
# Pull and run PostgreSQL container
docker run --name postgres_new -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=fms_db -p 5432:5432 -d postgres:latest
```

#### Create Database User
```bash
# Create fms_user with password
docker exec postgres_new psql -U postgres -c "CREATE USER fms_user WITH PASSWORD 'fms_password';"

# Grant database privileges
docker exec postgres_new psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fms_db TO fms_user;"

# Grant schema privileges
docker exec postgres_new psql -U postgres -d fms_db -c "GRANT ALL ON SCHEMA public TO fms_user;"

# Grant all table and sequence privileges
docker exec postgres_new psql -U postgres -d fms_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fms_user; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fms_user;"
```

#### Redis Container
```bash
# Pull and run Redis container
docker run --name redis_fms -p 6379:6379 -d redis:7-alpine
```

### 2. Backend Setup

#### Environment Configuration
Create `backend/.env` file with the following configuration:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fms_user
DATABASE_PASSWORD=fms_password
DATABASE_NAME=fms_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
JWT_REFRESH_EXPIRES_IN=30d

# Email (Optional - for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/callback/google

# AI Services (Optional)
OPENAI_API_KEY=your-openai-api-key

# App
APP_NAME=Financial Management System
APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

#### Install Dependencies
```bash
cd backend
npm install
npm install -D tsconfig-paths
```

#### Run Migrations
```bash
npm run migration:run
```

#### Seed Database
```bash
npm run seed
```

#### Start Backend Server
```bash
npm run start:dev
```

The backend should now be running on `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

#### Start Frontend Server
```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173`

## Docker Fixes Applied

### 1. Dockerfile Modifications (Backend)
**Issue**: Windows-compiled bcrypt binaries incompatible with Alpine Linux

**Solution**: Modified `backend/Dockerfile` to exclude node_modules from COPY and use npm install in container

```dockerfile
# Don't copy node_modules
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
```

### 2. Docker Compose Volume Configuration
**Issue**: Windows node_modules conflicting with Linux container

**Solution**: Added named volume for node_modules in `docker-compose.yml`

```yaml
volumes:
  - ./backend/src:/app/src
  - backend_node_modules:/app/node_modules

volumes:
  backend_node_modules:
```

### 3. Package.json Script Updates
**Issue**: nest CLI not in PATH, path aliases not resolving

**Solution**: Updated scripts in `backend/package.json`

```json
{
  "scripts": {
    "seed": "ts-node -r tsconfig-paths/register src/database/seeds/run-seeds.ts"
  }
}
```

## Database Schema

The database includes the following main tables:
- `users` - User accounts and authentication
- `accounts` - Bank accounts and financial accounts
- `transactions` - Financial transactions
- `categories` - Transaction categories (hierarchical)
- `tags` - Transaction tags
- `budgets` - Budget tracking
- `notifications` - User notifications
- `sessions` - User sessions
- `groups` - Expense sharing groups
- `investments` - Investment tracking
- `lend_borrow` - Lending/borrowing records
- `reminders` - Payment reminders
- `audit_logs` - Audit trail
- And 20+ more tables for complete FMS functionality

## Default Seeded Data

After running `npm run seed`, the following data is available:

### Default Categories
- **Expense Categories**: Food & Dining, Transportation, Shopping, Bills & Utilities, Healthcare, Entertainment, Education, Travel, Personal Care, Home, Gifts & Donations, Business, Taxes, Insurance, Pets, Kids, Subscriptions, Miscellaneous
- **Income Categories**: Salary, Freelance, Business, Investments, Gifts, Refunds, Other Income

### Default Tags
Common tags for organizing transactions: grocery, coffee, fuel, lunch, dinner, etc.

## Creating Admin User

```bash
cd backend
npm run create-admin
```

Follow the interactive prompts to create an admin user.

## API Endpoints

Backend API is accessible at `http://localhost:3000/api`

Key endpoints:
- `/api/auth/*` - Authentication (register, login, OAuth)
- `/api/accounts/*` - Account management
- `/api/transactions/*` - Transaction CRUD
- `/api/categories/*` - Category management
- `/api/budgets/*` - Budget tracking
- `/api/analytics/*` - Financial analytics
- `/api/ai/*` - AI-powered features
- `/api/notifications/*` - WebSocket notifications

## WebSocket Connection

WebSocket gateway available at `/notifications` namespace:
- URL: `ws://localhost:3000/notifications`
- Requires authentication token

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
netstat -ano | Select-String ':3000' | Select-String 'LISTENING'

# Kill process (Windows PowerShell)
Stop-Process -Id <PID> -Force
```

### Database Connection Issues
```bash
# Check if PostgreSQL container is running
docker ps | Select-String postgres

# Check PostgreSQL logs
docker logs postgres_new

# Verify user exists
docker exec postgres_new psql -U postgres -c "\du"

# Test connection
docker exec postgres_new psql -U fms_user -d fms_db -c "SELECT 1"
```

### Migration Errors
```bash
# Check migration status
npm run migration:show

# Revert last migration
npm run migration:revert

# Generate new migration
npm run migration:generate -- src/database/migrations/MigrationName
```

### Redis Connection Issues
```bash
# Check if Redis container is running
docker ps | Select-String redis

# Test Redis connection
docker exec -it redis_fms redis-cli ping
```

## Development Workflow

1. **Backend Development**: Code is auto-reloaded when files in `src/` change
2. **Frontend Development**: Vite provides HMR (Hot Module Replacement)
3. **Database Changes**: 
   - Create migration: `npm run migration:generate -- src/database/migrations/MigrationName`
   - Run migrations: `npm run migration:run`
   - Revert migration: `npm run migration:revert`

## Production Deployment

See `docs/Deployment-Guide.md` for production deployment instructions.

## Tech Stack

### Backend
- NestJS v10.3.3
- TypeORM 0.3.20
- PostgreSQL 18
- Redis 7
- Socket.IO 4.8.1
- JWT Authentication
- Bull Queue (job processing)
- Class Validator/Transformer

### Frontend
- React 18
- TypeScript
- Vite
- TanStack Query (React Query)
- Zustand (State Management)
- Socket.IO Client
- Tailwind CSS
- shadcn/ui Components
- i18next (Internationalization)

## Features

- ✅ User Authentication (Local + Google OAuth + 2FA)
- ✅ Multi-account Management
- ✅ Transaction Tracking
- ✅ Hierarchical Categories
- ✅ Budget Management
- ✅ Financial Analytics & Reports
- ✅ AI-powered Categorization
- ✅ Receipt Parsing (OCR)
- ✅ Investment Tracking
- ✅ Lending/Borrowing Records
- ✅ Expense Sharing Groups
- ✅ Real-time Notifications
- ✅ Data Import/Export
- ✅ Multi-language Support
- ✅ Dark Mode
- ✅ Accessibility (A11y)
- ✅ Audit Trail
- ✅ GDPR Compliance
- ✅ Admin Dashboard

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in `backend/logs/` (if enabled)
3. Check Docker container logs: `docker logs <container_name>`
4. Verify environment variables are set correctly

## License

[Add your license information here]
