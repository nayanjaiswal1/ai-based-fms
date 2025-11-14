# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Finance Management System (FMS)** - a production-ready, enterprise-grade personal and group finance management platform with AI-powered features. It's a monorepo containing a NestJS backend and React frontend, with 141+ API endpoints, real-time WebSocket support, and OpenAI integration.

## Common Commands

### Backend Development

```bash
cd backend

# Development
npm run start:dev          # Start with hot reload
npm run build              # Production build
npm run start:prod         # Run production build

# Database
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run      # Apply migrations
npm run migration:revert   # Rollback last migration
npm run seed               # Seed default categories, tags
npm run create-admin       # Interactive admin user creation

# Testing
npm test                   # Unit tests
npm run test:watch         # Watch mode
npm run test:cov          # With coverage
npm run test:e2e          # End-to-end tests

# Code Quality
npm run lint              # ESLint
npm run format            # Prettier
```

### Frontend Development

```bash
cd frontend

# Development
npm run dev               # Start Vite dev server (HMR enabled)
npm run build            # TypeScript check + production build
npm run preview          # Preview production build

# Testing
npm test                 # Vitest
npm run test:ui          # Interactive test UI
npm run test:coverage    # With coverage

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier
```

### Docker Operations

```bash
# Development environment
docker-compose up -d                           # Start all services
docker-compose exec backend npm run migration:run  # Run migrations in container
docker-compose exec backend npm run seed       # Seed data in container
docker-compose logs -f backend                 # Follow backend logs
docker-compose down                            # Stop all services

# Database access
docker exec -it postgres_new psql -U fms_user -d fms_db

# Redis access
docker exec -it redis_fms redis-cli
```

## Architecture

### Backend Architecture (NestJS)

**Pattern:** Modular monolith with Controller → Service → Repository architecture

**Key Directories:**
- `backend/src/modules/` - 16 feature modules (auth, accounts, transactions, budgets, groups, etc.)
- `backend/src/database/entities/` - 33+ TypeORM entities
- `backend/src/common/` - Shared guards, decorators, filters, interceptors, pipes
- `backend/src/config/` - Configuration files (database, JWT, Redis, upload)

**Module Structure (typical):**
```
src/modules/transactions/
├── transactions.module.ts      # Module definition
├── transactions.controller.ts  # REST endpoints
├── transactions.service.ts     # Business logic
├── dto/
│   ├── create-transaction.dto.ts
│   └── update-transaction.dto.ts
└── entities/
    └── transaction.entity.ts
```

**Path Aliases (tsconfig.json):**
- `@/*` → `src/*`
- `@config/*` → `src/config/*`
- `@common/*` → `src/common/*`
- `@modules/*` → `src/modules/*`
- `@database/*` → `src/database/*`

**Authentication Flow:**
1. All routes protected by global `JwtAuthGuard` (applied in `app.module.ts`)
2. Use `@Public()` decorator for public endpoints (login, register)
3. Use `@Roles('ADMIN')` decorator for role-restricted endpoints
4. JWT tokens stored in httpOnly cookies (secure, XSS-protected)
5. Access tokens: 7 days, Refresh tokens: 30 days

**Transaction Management Pattern:**
Critical operations use database transactions with pessimistic locking:
```typescript
await this.dataSource.transaction(async (manager) => {
  const account = await manager.findOne(Account, {
    where: { id },
    lock: { mode: 'pessimistic_write' }
  });
  // Perform atomic operations
});
```

**WebSocket Architecture (Socket.IO):**
- Gateway: `backend/src/modules/notifications/notifications.gateway.ts`
- Namespace: `/notifications`
- User-to-socket mapping for targeted broadcasts
- Room-based subscriptions for groups
- Automatic unread count updates

**AI Service Integration:**
- Module: `backend/src/modules/ai/ai.service.ts`
- Uses OpenAI GPT-3.5-turbo for categorization, insights, chat
- Gracefully degrades if `OPENAI_API_KEY` not set
- In-house Levenshtein distance for duplicate detection
- Confidence scoring for auto-categorization

### Frontend Architecture (React + TypeScript)

**Pattern:** Feature-based organization with Container/Presentational separation

**Key Directories:**
- `frontend/src/features/` - Feature modules (12+ features: auth, dashboard, transactions, etc.)
- `frontend/src/components/` - Shared UI components (shadcn/ui style)
- `frontend/src/hooks/` - 22+ custom React hooks
- `frontend/src/stores/` - Zustand state management
- `frontend/src/services/` - API service layer

**Feature Structure (typical):**
```
src/features/transactions/
├── pages/
│   └── TransactionsPage.tsx    # Container (data fetching)
├── components/
│   ├── TransactionList.tsx     # Presentational
│   └── TransactionForm.tsx
└── config/
    └── transactionConfig.ts    # Constants, schemas
```

**Path Aliases (tsconfig.json):**
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@features/*` → `./src/features/*`
- `@hooks/*` → `./src/hooks/*`
- `@stores/*` → `./src/stores/*`

**State Management Strategy:**
- **Server State:** TanStack Query (React Query) - all API data
- **Client State:** Zustand - auth, preferences, UI state
- **URL State:** `useUrlParams` hook - filters, pagination
- **Form State:** React Hook Form - form handling

**Data Fetching Pattern (TanStack Query):**
```typescript
// Config: frontend/src/config/queryClient.ts
// 5min stale time, 10min cache time, 3 retries
// Persisted to sessionStorage

// Usage in components:
const { data, isLoading } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => api.getTransactions(filters)
});

// Mutations with optimistic updates:
const mutation = useMutation({
  mutationFn: api.createTransaction,
  onMutate: async (newData) => {
    // Optimistic update
    queryClient.setQueryData(['transactions'], (old) => [...old, newData]);
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['transactions'], context.previousData);
  }
});
```

**Custom Hooks Library (22+ hooks):**
- `useCrud` - Generic CRUD with TanStack Query
- `useEntityForm` - Entity form management
- `useFilters` / `useUrlFilters` - Client/URL-synced filtering
- `useWebSocket` - WebSocket connection with auto-reconnect
- `useConfirm` - Confirmation dialogs
- `useVirtualScroll` - Performance for large lists
- `useFeatureAccess` - Subscription-based feature gating

**Routing:**
- Route-based code splitting with `React.lazy`
- Protected route wrapper checks authentication
- Error boundaries per route
- File: `frontend/src/App.tsx`

### Database Schema

**Core Entities (33+ tables):**
- `users` - Authentication, roles, subscription
- `accounts` - Multi-account (bank, wallet, cash, card)
- `transactions` - Financial transactions with indexes on [userId, date], [accountId, date]
- `categories` - Hierarchical tree structure (16 default categories)
- `tags` - Transaction tags (15 default tags)
- `budgets` - Budget tracking with real-time alerts
- `groups` / `group_members` / `group_transactions` - Expense sharing
- `investments` - Portfolio tracking
- `lend_borrow` - Debt tracking with partial payments
- `notifications` - Real-time notifications
- `reminders` - Payment reminders
- `sessions` - Session tracking (device fingerprinting)
- `audit_logs` - Complete audit trail with JSONB old/new values

**Important Indexes:**
- Transactions are heavily indexed for time-series queries
- Composite indexes on [userId, date], [userId, type], [accountId, date]
- Category tree uses materialized path for efficient hierarchical queries

**Migration Pattern:**
```bash
# Generate migration after entity changes
npm run migration:generate -- src/database/migrations/AddFieldToEntity

# Review generated migration in src/database/migrations/
# Modify if needed (e.g., data migrations)

# Apply migration
npm run migration:run

# Rollback if needed
npm run migration:revert
```

### Configuration & Environment

**Backend (.env):**
```env
# Required
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fms_user
DATABASE_PASSWORD=fms_password
DATABASE_NAME=fms_db

JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

REDIS_HOST=localhost
REDIS_PORT=6379

# Optional (enables AI features)
OPENAI_API_KEY=sk-...

# Optional (enables OAuth)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

**Critical Files:**
- `backend/src/config/database.config.ts` - TypeORM configuration
- `backend/src/main.ts` - Bootstrap, middleware, global pipes/filters
- `backend/src/app.module.ts` - Root module
- `frontend/src/config/queryClient.ts` - TanStack Query configuration
- `frontend/src/services/api.ts` - Axios instance with interceptors

## Important Patterns & Conventions

### Backend Conventions

1. **DTOs for Validation:**
   - Use `class-validator` decorators
   - Separate DTOs for create/update operations
   - DTO classes in `dto/` subdirectory

2. **Public Endpoints:**
   - Mark with `@Public()` decorator (from `@common/decorators/public.decorator.ts`)
   - Examples: `/api/auth/login`, `/api/auth/register`

3. **Role-Based Access:**
   - Use `@Roles('ADMIN')` decorator (from `@common/decorators/roles.decorator.ts`)
   - Checked by `RolesGuard` after `JwtAuthGuard`

4. **Error Handling:**
   - Throw built-in NestJS exceptions: `NotFoundException`, `BadRequestException`, etc.
   - Global `HttpExceptionFilter` formats responses consistently

5. **Audit Trail:**
   - Service method `this.auditService.log()` for critical operations
   - Stores old/new values as JSONB
   - Non-blocking (fire-and-forget)

6. **WebSocket Events:**
   - Emit to specific user: `this.notificationsGateway.sendToUser(userId, event, data)`
   - Emit to room: `this.server.to(roomId).emit(event, data)`

### Frontend Conventions

1. **Component Organization:**
   - Pages in `features/*/pages/` (data fetching, state)
   - Components in `features/*/components/` (presentational)
   - Shared components in `components/`

2. **API Calls:**
   - Always use TanStack Query (`useQuery`, `useMutation`)
   - Never use `useEffect` with `axios` directly
   - API functions in `services/api.ts`

3. **Forms:**
   - Use React Hook Form with Zod validation
   - Pattern: Define schema in `config/`, use `useForm` with `zodResolver`

4. **Optimistic Updates:**
   - For mutations that should feel instant (like, favorite, toggle)
   - Use `onMutate` to update cache, `onError` to rollback

5. **Feature Gating:**
   - Use `useFeatureAccess` hook to check subscription tier
   - Disable/hide features for FREE tier
   - Show upgrade prompt

6. **Error Boundaries:**
   - Wrap route components in error boundaries
   - Show user-friendly error messages
   - Log to monitoring service

### Security Practices

1. **Never expose secrets:** API keys, JWT secrets must be in `.env` (gitignored)
2. **Input validation:** Use DTOs with `class-validator` on backend, Zod on frontend
3. **SQL injection prevention:** Always use parameterized queries (TypeORM handles this)
4. **XSS prevention:** Tokens in httpOnly cookies, not localStorage
5. **CORS:** Configured in `backend/src/main.ts` to allow only frontend origin
6. **Rate limiting:** `@nestjs/throttler` configured globally
7. **Helmet:** Security headers configured in `main.ts`

### Performance Considerations

1. **Virtual Scrolling:** Use for lists >100 items (`useVirtualScroll` hook)
2. **Infinite Scroll:** Use `useInfiniteQuery` with cursor pagination
3. **Database Queries:**
   - Always add indexes for frequently queried fields
   - Use `select` to limit fields returned
   - Avoid N+1 queries (use `relations` in TypeORM)
4. **Caching:**
   - Redis cache for expensive computations
   - TanStack Query cache for API responses
5. **Code Splitting:**
   - Routes are lazy-loaded
   - Heavy libraries should be dynamic imports

## Common Development Scenarios

### Adding a New Feature Module (Backend)

1. Generate module: `cd backend && npx nest g module modules/feature-name`
2. Generate controller: `npx nest g controller modules/feature-name`
3. Generate service: `npx nest g service modules/feature-name`
4. Create entity in `src/database/entities/feature-name.entity.ts`
5. Generate migration: `npm run migration:generate -- src/database/migrations/CreateFeatureName`
6. Create DTOs in `modules/feature-name/dto/`
7. Implement service logic, inject repositories
8. Add controller endpoints with validation
9. Import module in `app.module.ts`

### Adding a New Frontend Feature

1. Create feature directory: `frontend/src/features/feature-name/`
2. Create page component: `pages/FeatureNamePage.tsx`
3. Create API functions in `services/api.ts`
4. Create custom hook if needed: `hooks/useFeatureName.ts`
5. Add route in `App.tsx` with lazy loading
6. Add navigation link in `components/Layout/Navigation.tsx`

### Debugging Real-time Issues

1. Check WebSocket connection: Browser DevTools → Network → WS tab
2. Backend logs: `docker-compose logs -f backend | grep Socket`
3. Verify user is authenticated (token in cookies)
4. Check room subscriptions: `console.log` in `useWebSocket` hook
5. Test event emission: Use Socket.IO admin UI or Postman

### Troubleshooting Database Issues

1. Check migrations: `npm run typeorm migration:show`
2. Verify connection: `docker exec -it postgres_new psql -U fms_user -d fms_db -c "SELECT 1"`
3. Check entity synchronization: Look for TypeORM errors in logs
4. Reset database (dev only):
   ```bash
   docker-compose down -v
   docker-compose up -d postgres redis
   docker-compose exec backend npm run migration:run
   docker-compose exec backend npm run seed
   ```

## API Documentation

- **Swagger UI:** `http://localhost:3000/api/docs`
- **Base URL:** `http://localhost:3000/api`
- **WebSocket:** `ws://localhost:3000/notifications`

All 141+ endpoints are documented with Swagger decorators (`@ApiOperation`, `@ApiResponse`, etc.)

## Testing Strategy

**Backend:**
- Unit tests: Test services in isolation with mocked repositories
- E2E tests: Test API endpoints with Supertest
- Location: `backend/test/`

**Frontend:**
- Component tests: Testing Library for user interactions
- Hook tests: Test custom hooks with `renderHook`
- Location: `*.test.tsx` files colocated with components

## Deployment

**Production files:**
- `docker-compose.prod.yml` - Production Docker setup
- `deployment/scripts/deploy.sh` - Automated deployment
- `deployment/nginx/` - Nginx configuration with SSL

**Production checklist:**
1. Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
2. Use production PostgreSQL (not Docker container)
3. Enable SSL/TLS for all traffic
4. Set `NODE_ENV=production`
5. Configure CORS for production domain
6. Set up automated backups
7. Configure monitoring and logging

## Key Technical Decisions

1. **httpOnly Cookies for Auth:** Tokens never exposed to JavaScript (XSS protection)
2. **TypeORM with Active Record:** Entity-based ORM for rapid development
3. **TanStack Query:** Declarative data fetching with automatic caching
4. **Zustand over Redux:** Simpler, less boilerplate for client state
5. **Feature-based Frontend:** Better scalability than type-based (components/, containers/)
6. **WebSocket for Notifications:** Real-time updates without polling
7. **Greedy Settlement Algorithm:** Minimizes number of transactions in group settlements
8. **Levenshtein Distance:** In-house implementation for duplicate detection (no external deps)
9. **Materialized Path for Categories:** Efficient hierarchical queries

## Additional Resources

- Setup guide: `SETUP.md`
- Full README: `README.md`
- Architecture docs: `docs/Architecture.md`
- Deployment guide: `docs/Deployment-Guide.md`
- Development guide: `docs/Development-Guide.md`
