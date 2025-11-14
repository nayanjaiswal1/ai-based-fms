# Finance Management System - Backend

## Overview
NestJS-based backend API for a comprehensive Finance Management System with AI-powered features, real-time notifications, and extensive financial tracking capabilities.

## Tech Stack
- **Runtime**: Node.js 20+
- **Framework**: NestJS 10.3.3
- **Language**: TypeScript 5.3.3
- **Database**: PostgreSQL 16 with TypeORM 0.3.20
- **Cache**: Redis 7
- **Queue**: Bull (Redis-based)
- **Authentication**: JWT with Passport
- **WebSocket**: Socket.IO 4.8.1
- **AI**: OpenAI GPT-3.5-turbo
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   │
│   ├── common/                    # Shared utilities
│   │   ├── constants/             # Constants and enums
│   │   ├── decorators/            # Custom decorators
│   │   ├── filters/               # Exception filters
│   │   ├── guards/                # Auth guards
│   │   ├── interceptors/          # Interceptors
│   │   ├── pipes/                 # Validation pipes
│   │   └── services/              # Shared services
│   │
│   ├── config/                    # Configuration modules
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── upload.config.ts
│   │
│   ├── database/
│   │   ├── entities/              # 34 TypeORM entities
│   │   ├── migrations/            # Database migrations
│   │   └── seeds/                 # Database seeders
│   │
│   └── modules/                   # Feature modules (26 modules)
│       ├── accounts/              # Account management
│       ├── admin/                 # Admin dashboard
│       ├── ai/                    # AI categorization & insights
│       ├── analytics/             # Financial analytics
│       ├── audit/                 # Audit logs
│       ├── auth/                  # Authentication & authorization
│       ├── budgets/               # Budget tracking
│       ├── categories/            # Category management
│       ├── chat/                  # AI chat interface
│       ├── dashboard-preferences/ # User dashboard settings
│       ├── email/                 # Email integration
│       ├── export/                # Data export
│       ├── gdpr/                  # GDPR compliance
│       ├── groups/                # Group expense management
│       ├── import/                # File import
│       ├── insights/              # Financial insights
│       ├── investments/           # Investment tracking
│       ├── job-monitor/           # Background job monitoring
│       ├── lend-borrow/           # Debt tracking
│       ├── notifications/         # Real-time notifications
│       ├── reconciliation/        # Bank reconciliation
│       ├── reports/               # Report generation
│       ├── sessions/              # Session management
│       ├── subscriptions/         # Subscription tiers
│       ├── tags/                  # Tag management
│       └── transactions/          # Transaction CRUD
│
├── test/                          # E2E tests
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md                      # This file
```

## Features

### Core Features
- Multi-account management (Bank, Wallet, Cash, Credit Card, Investment)
- Transaction management with advanced filtering
- Budget tracking with real-time alerts
- Category and tag management
- Group expense splitting
- Investment portfolio tracking
- Lend/borrow debt tracking

### AI-Powered Features
- Automatic transaction categorization
- Receipt parsing and extraction
- Financial insights and recommendations
- Conversational AI chat interface
- Spending predictions
- Anomaly detection

### Analytics & Reporting
- Financial analytics with multiple date presets
- Category spending breakdown
- Monthly trends and comparisons
- Net worth calculation
- Custom report builder
- Export to PDF, Excel, CSV

### Integrations
- Email integration (IMAP/OAuth)
- File import (CSV, Excel, PDF)
- Bank reconciliation
- Google OAuth authentication

### Security & Admin
- JWT authentication with refresh tokens
- Two-Factor Authentication (2FA)
- Role-based access control (RBAC)
- Session management
- Audit logging
- GDPR compliance tools

## Quick Start

### Prerequisites
```bash
node >= 20.0.0
npm >= 9.0.0
PostgreSQL >= 16
Redis >= 7
```

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables
```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fms_dev
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-3.5-turbo

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Database Setup
```bash
# Run migrations
npm run migration:run

# Seed database with default data
npm run seed

# Create admin user
npm run seed:admin
```

### Development
```bash
# Run in development mode with hot reload
npm run start:dev

# Run in debug mode
npm run start:debug
```

### Production
```bash
# Build
npm run build

# Run production build
npm run start:prod
```

### Docker
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## API Documentation

### Swagger UI
Once the application is running, access Swagger documentation at:
```
http://localhost:3000/api/docs
```

### API Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require JWT authentication. Include the access token in requests:

**Using Cookies (Recommended):**
```typescript
fetch('/api/accounts', {
  credentials: 'include'
});
```

**Using Header:**
```typescript
fetch('/api/accounts', {
  headers: {
    'Authorization': 'Bearer <access-token>'
  }
});
```

## Module Documentation

Each module has its own detailed README:

- [Accounts Module](./src/modules/accounts/README.md) - Account management
- [Transactions Module](./src/modules/transactions/README.md) - Transaction CRUD
- [Budgets Module](./src/modules/budgets/README.md) - Budget tracking
- [AI Module](./src/modules/ai/README.md) - AI-powered features
- [Auth Module](./src/modules/auth/README.md) - Authentication & authorization
- [Groups Module](./src/modules/groups/README.md) - Group expense management
- [Analytics Module](./src/modules/analytics/README.md) - Financial analytics
- [Import Module](./src/modules/import/README.md) - File import
- [Export Module](./src/modules/export/README.md) - Data export
- [Notifications Module](./src/modules/notifications/README.md) - Real-time notifications

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch

# Specific module
npm run test -- accounts
```

## Database

### Entities (34 Total)
- User, Session, Account, Transaction
- Category, Tag, Budget, Subscription
- Group, GroupMember, GroupTransaction
- LendBorrow, Investment, Invoice
- Notification, Reminder
- AICategorization, ImportLog, EmailConnection
- Reconciliation, Report, Job, AuditLog
- And more...

### Migrations
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Seeds
```bash
# Run all seeds
npm run seed

# Run specific seed
npm run seed:categories
npm run seed:admin
```

## Performance Optimizations

### Caching
- Redis caching for frequently accessed data
- Cache TTL: 3600s (1 hour) for static data, 300s (5 min) for dynamic data
- Cache invalidation on data updates

### Database
- Indexes on frequently queried columns
- Connection pooling (max: 10 connections)
- Query optimization with proper relations
- Pagination on list endpoints

### Background Jobs
- Bull queues for async operations
- Email sending
- Report generation
- Data import processing
- Periodic calculations

## Security

### Authentication
- JWT with access and refresh tokens
- Secure httpOnly cookies
- 2FA support (TOTP)
- Google OAuth integration

### Authorization
- Role-based access control (RBAC)
- Feature gating by subscription tier
- Route guards and decorators

### Protection
- Helmet security headers
- CORS configuration
- Rate limiting (100 req/min)
- Input validation with class-validator
- SQL injection prevention (TypeORM)
- XSS protection

### Audit
- All sensitive operations logged
- User activity tracking
- Session management
- GDPR compliance tools

## WebSocket Events

### Connection
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-access-token' }
});
```

### Events
```typescript
// Notifications
socket.on('notification.new', (notification) => {});

// Budget alerts
socket.on('budget.alert', (alert) => {});
socket.on('budget.exceeded', (data) => {});

// Transactions
socket.on('transaction.created', (transaction) => {});
socket.on('transaction.updated', (transaction) => {});

// Balance updates
socket.on('balance.updated', (data) => {});

// Group events
socket.on('group.expense.added', (data) => {});
socket.on('group.settlement', (data) => {});
```

## Deployment

### Build
```bash
npm run build
```

### Environment
Set `NODE_ENV=production` for production builds.

### Database
Run migrations in production:
```bash
npm run migration:run
```

### Process Manager
Use PM2 for production:
```bash
pm2 start dist/main.js --name fms-backend
```

### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Check
```
GET /api/health
```

### Job Monitoring
Access job queue dashboard:
```
http://localhost:3000/api/admin/jobs
```

### Logs
Logs are output to console and can be captured by your logging solution.

## Contributing

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add JSDoc comments for public APIs

### Branching
- `main` - Production
- `develop` - Development
- `feature/*` - Features
- `bugfix/*` - Bug fixes

### Pull Requests
1. Create feature branch
2. Write tests
3. Ensure all tests pass
4. Update documentation
5. Submit PR

## Troubleshooting

### Common Issues

**Database connection fails:**
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Verify credentials in .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

**Redis connection fails:**
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

**Migration errors:**
```bash
# Drop database and recreate (development only!)
npm run migration:revert
npm run migration:run
```

**Port already in use:**
```bash
# Change PORT in .env
PORT=3001
```

## License
MIT

## Support
For issues and questions, please open an issue on GitHub.

## Links
- [Frontend Repository](../frontend/README.md)
- [API Documentation](http://localhost:3000/api/docs)
- [Deployment Guide](../docs/Deployment-Guide.md)
- [Architecture Documentation](../docs/Architecture.md)
