# Finance Management System - Development Guide

## Overview

This guide will help you set up the development environment and understand the project structure for the Finance Management System.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-based-fms
```

### 2. Environment Setup

#### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
```

#### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
npm install
```

### 3. Start with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 4. Manual Start (Without Docker)

#### Start PostgreSQL and Redis

```bash
# PostgreSQL
psql -U postgres
CREATE DATABASE fms_db;
CREATE USER fms_user WITH PASSWORD 'fms_password';
GRANT ALL PRIVILEGES ON DATABASE fms_db TO fms_user;

# Redis
redis-server
```

#### Start Backend

```bash
cd backend
npm run start:dev
```

#### Start Frontend

```bash
cd frontend
npm run dev
```

## Project Structure

```
ai-based-fms/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── common/         # Shared utilities, guards, pipes
│   │   ├── config/         # Configuration files
│   │   ├── database/       # Database entities and migrations
│   │   ├── modules/        # Feature modules
│   │   ├── jobs/           # Background jobs
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Application entry point
│   ├── test/               # Tests
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature-based modules
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── stores/        # State management (Zustand)
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Application entry point
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                   # Documentation
├── docker-compose.yml      # Docker orchestration
└── README.md              # Project overview
```

## Backend Development

### Module Structure

Each feature module follows this structure:

```
modules/
└── feature-name/
    ├── dto/                # Data Transfer Objects
    ├── entities/           # Database entities
    ├── feature.controller.ts
    ├── feature.service.ts
    ├── feature.module.ts
    └── feature.spec.ts     # Tests
```

### Creating a New Module

```bash
cd backend
nest generate module modules/feature-name
nest generate service modules/feature-name
nest generate controller modules/feature-name
```

### Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Frontend Development

### Component Structure

- **UI Components**: Reusable presentational components
- **Feature Components**: Feature-specific business logic components
- **Pages**: Route-level components
- **Layouts**: Structural components (Sidebar, Header, etc.)

### Adding a New Feature

1. Create feature directory: `src/features/feature-name/`
2. Add pages: `src/features/feature-name/pages/`
3. Add components: `src/features/feature-name/components/`
4. Add API service: `src/services/feature-api.ts`
5. Add route in `App.tsx`

### State Management

We use Zustand for state management:

```typescript
import { create } from 'zustand';

interface FeatureState {
  data: any;
  setData: (data: any) => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

### API Integration

Use React Query for data fetching:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { featureApi } from '@services/api';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['feature-key'],
  queryFn: featureApi.getAll,
});

// Mutation
const mutation = useMutation({
  mutationFn: featureApi.create,
  onSuccess: () => {
    // Handle success
  },
});
```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define proper types for all data structures
- Avoid `any` type when possible
- Use interfaces for object shapes
- Use enums for constants

### Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.service.ts`)
- **Classes**: PascalCase (e.g., `UserProfileService`)
- **Functions/Variables**: camelCase (e.g., `getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### Best Practices

1. **DRY**: Don't Repeat Yourself
2. **SOLID**: Follow SOLID principles
3. **Separation of Concerns**: Keep business logic separate from presentation
4. **Error Handling**: Always handle errors gracefully
5. **Security**: Validate and sanitize all inputs
6. **Performance**: Optimize queries and minimize renders

## API Documentation

The API documentation is available at:
```
http://localhost:3000/api/docs
```

## Environment Variables

### Backend

```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=fms_user
DATABASE_PASSWORD=fms_password
DATABASE_NAME=fms_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### Frontend

```env
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_AI_FEATURES=true
```

## Debugging

### Backend

```bash
# Debug mode
npm run start:debug

# Attach debugger on port 9229
```

### Frontend

Use React DevTools and Redux DevTools browser extensions.

## Common Issues

### Issue: Database connection failed

**Solution**: Ensure PostgreSQL is running and credentials are correct.

### Issue: Port already in use

**Solution**: Kill the process using the port:
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Issue: Module not found

**Solution**: Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "Add new feature"`
3. Push to branch: `git push origin feature/new-feature`
4. Create Pull Request

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

## Support

For issues and questions, please create an issue in the repository or contact the development team.
