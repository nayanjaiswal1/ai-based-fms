# Finance Management System (FMS)

An intelligent, unified platform for tracking, managing, and analyzing personal and group finances.

## Overview

The Finance Management System (FMS) helps individuals and groups manage their financial lives through:

- **Automated Data Capture**: Import transactions from emails, statements, and files
- **Intelligent Categorization**: AI-powered transaction categorization and tagging
- **Collaborative Expense Tracking**: Manage shared expenses and group settlements
- **Real-time Analytics**: Comprehensive dashboards and insights
- **Budget Management**: Create and track budgets with AI assistance
- **Investment Tracking**: Monitor portfolio performance and diversification

## Documentation

- [Full Requirements Specification](docs/FMS-Requirements-Specification.md) - Complete functional and non-functional requirements

## Key Features

### Core Capabilities
- Multi-account management (bank, wallet, cash, card)
- Transaction management with bulk import
- Category and tag system with hierarchy support
- Budget creation and tracking
- Group expense management and settlements
- Lend/borrow tracking
- Investment portfolio monitoring

### Automation & Intelligence
- Email integration for automatic transaction extraction
- File import from PDF, CSV, and Excel
- AI-assisted categorization and budgeting
- Duplicate detection and merging
- Natural language transaction input via chat interface

### Analytics & Insights
- Income, expense, and savings tracking
- Net worth calculation
- Category-wise spending analysis
- Budget progress monitoring
- Investment performance metrics
- AI-driven insights and recommendations

## Non-Functional Highlights

- **Security**: End-to-end encryption, secure authentication, data privacy compliance
- **Performance**: Fast response times, efficient data handling, smart caching
- **Reliability**: Transaction safety, auto-backup, audit logging
- **Scalability**: Modular architecture supporting growth
- **Usability**: Clean interface, responsive design, accessibility support
- **Auditability**: Complete transaction history and version tracking

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: NestJS 10 (modular, scalable, enterprise-ready)
- **Database**: PostgreSQL 16 with TypeORM
- **Caching**: Redis 7
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 (fast, modern)
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand 4
- **Data Fetching**: TanStack Query 5
- **Routing**: React Router 6

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Testing**: Jest, Vitest

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd ai-based-fms

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# API Documentation: http://localhost:3000/api/docs
```

### Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
# Ensure PostgreSQL and Redis are running
# Update backend/.env with your database credentials
```

## Project Structure

```
ai-based-fms/
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── common/        # Shared utilities
│   │   ├── config/        # Configuration
│   │   ├── database/      # Entities & migrations
│   │   ├── modules/       # Feature modules
│   │   └── main.ts        # Entry point
│   └── package.json
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── features/     # Feature modules
│   │   ├── services/     # API services
│   │   └── App.tsx       # Main component
│   └── package.json
├── docs/                  # Documentation
├── docker-compose.yml     # Docker orchestration
└── README.md             # This file
```

## Documentation

- 📋 [Requirements Specification](docs/FMS-Requirements-Specification.md) - Complete functional requirements
- 🏗️ [Architecture](docs/Architecture.md) - Technical architecture and design
- 💻 [Development Guide](docs/Development-Guide.md) - Setup and development workflow
- 🚀 [Deployment Guide](docs/Deployment-Guide.md) - Production deployment
- 📊 [Project Summary](docs/Project-Summary.md) - Implementation status and roadmap

## Current Implementation Status

### ✅ Completed
- Complete database schema (16 entities)
- Authentication & authorization
- Account management
- Transaction management (core)
- Modern frontend with React 18
- Docker deployment setup
- Comprehensive documentation

### 🚧 In Progress
- Additional backend modules (budgets, groups, investments)
- Complete frontend UI for all features
- AI integrations
- Advanced analytics
- Background jobs

See [Project Summary](docs/Project-Summary.md) for detailed status.

## API Documentation

Once the application is running, access the interactive API documentation at:
```
http://localhost:3000/api/docs
```

## Development

### Running Tests

**Backend:**
```bash
cd backend
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

**Frontend:**
```bash
cd frontend
npm test              # Component tests
```

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read the [Development Guide](docs/Development-Guide.md) before contributing.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Rate limiting
- Security headers (Helmet)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or feature requests:
- Create an issue in the repository
- Check the documentation
- Review existing issues

## Roadmap

- [ ] Complete all backend modules
- [ ] Full frontend implementation
- [ ] AI integration (OpenAI)
- [ ] Mobile applications
- [ ] Advanced analytics
- [ ] Real-time features
- [ ] Multi-language support

---

**Built with modern technologies and best practices for a production-ready finance management solution.**
