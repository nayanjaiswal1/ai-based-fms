# Finance Management System - Frontend

## Overview
Modern, responsive React-based frontend for a comprehensive Finance Management System with AI-powered features, real-time updates, and extensive financial tracking capabilities.

## Tech Stack
- **Framework**: React 18.2.0 with TypeScript 5.3.3
- **Build Tool**: Vite 5.1.3
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**:
  - Radix UI (primitives)
  - Material UI (@mui/material)
  - Custom component library (shadcn/ui pattern)
- **State Management**:
  - Zustand 4.5.1 (global state)
  - TanStack Query 5.22.2 (server state)
- **Routing**: React Router 6.22.1
- **Forms**: React Hook Form 7.66.0 + Zod validation
- **Charts**: Recharts 2.12.0
- **Internationalization**: i18next 25.6.2
- **PWA**: vite-plugin-pwa with Workbox

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                   # Application entry point
│   ├── App.tsx                    # Root component with routing
│   ├── service-worker.ts          # PWA service worker
│   │
│   ├── components/                # Shared components
│   │   ├── 2fa/                  # Two-factor authentication
│   │   ├── a11y/                 # Accessibility components
│   │   ├── audit/                # Audit trail components
│   │   ├── cards/                # Card components
│   │   ├── error-boundary/       # Error boundary wrapper
│   │   ├── export/               # Export menu & buttons
│   │   ├── feature-gate/         # Subscription feature gates
│   │   ├── filters/              # Filter components
│   │   ├── form/                 # Form components & fields
│   │   ├── i18n/                 # Language switcher
│   │   ├── layout/               # Layout (Header, Sidebar, MobileNav)
│   │   ├── skeleton/             # Loading skeletons
│   │   ├── subscription/         # Subscription status
│   │   ├── table/                # Data table
│   │   ├── tabs/                 # Tab components
│   │   ├── theme/                # Theme toggle
│   │   ├── ui/                   # Base UI primitives (19 components)
│   │   └── virtual/              # Virtual scrolling
│   │
│   ├── config/                    # Configuration files
│   │   ├── api.config.ts         # API endpoints & OAuth config
│   │   ├── routes.config.tsx     # Centralized routing
│   │   ├── features.config.ts    # Feature flags
│   │   ├── datePresets.config.ts # Date range presets
│   │   ├── queryClient.ts        # TanStack Query config
│   │   └── accessibility.ts      # A11y settings
│   │
│   ├── contexts/                  # React contexts
│   │   └── ThemeContext.tsx
│   │
│   ├── features/                  # Feature modules (24 features)
│   │   ├── accounts/             # Account management
│   │   ├── admin/                # Admin dashboard
│   │   ├── ai/                   # AI assistant
│   │   ├── analytics/            # Analytics & charts
│   │   ├── audit/                # Activity log
│   │   ├── auth/                 # Login, register, password reset
│   │   ├── budgets/              # Budget management
│   │   ├── categories/           # Category management
│   │   ├── dashboard/            # Main dashboard
│   │   ├── email/                # Email integration
│   │   ├── groups/               # Group expenses
│   │   ├── import/               # File import
│   │   ├── insights/             # Financial insights
│   │   ├── investments/          # Investment tracking
│   │   ├── lend-borrow/          # Lend/borrow tracking
│   │   ├── notifications/        # Notifications panel
│   │   ├── reconciliation/       # Bank reconciliation
│   │   ├── reminders/            # Reminder management
│   │   ├── reports/              # Report builder
│   │   ├── settings/             # Settings (8 tabs)
│   │   ├── tags/                 # Tag management
│   │   └── transactions/         # Transaction management
│   │
│   ├── hooks/                     # Custom React hooks (20 hooks)
│   │   ├── useAuth.ts
│   │   ├── useCrud.ts
│   │   ├── useEntityForm.ts
│   │   ├── useFeatureAccess.ts
│   │   ├── useFilters.ts
│   │   ├── useWebSocket.ts
│   │   └── ... (14 more)
│   │
│   ├── i18n/                      # Internationalization
│   │   └── config.ts
│   │
│   ├── lib/                       # Utility libraries
│   │   └── form/                 # Form utilities
│   │
│   ├── pages/                     # Standalone pages
│   │   └── GoodbyePage.tsx
│   │
│   ├── services/                  # API services
│   │   ├── api.ts                # Axios instance
│   │   └── subscriptionApi.ts
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── authStore.ts
│   │   └── subscriptionStore.ts
│   │
│   ├── styles/                    # Global styles
│   │   └── index.css
│   │
│   └── utils/                     # Utility functions
│       ├── formatting.ts
│       ├── cache.ts
│       ├── accessibility.ts
│       └── i18n.ts
│
├── public/                        # Static assets
│   └── locales/                  # Translation files (6 languages)
│       ├── en/
│       ├── es/
│       ├── fr/
│       ├── de/
│       ├── ar/
│       └── ja/
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md                      # This file
```

## Features

### Core Features
- **Dashboard**: Customizable widgets with drag-and-drop
- **Accounts**: Multi-account management with balance tracking
- **Transactions**: Advanced filtering, bulk operations, virtual scrolling
- **Budgets**: Real-time progress tracking with alerts
- **Categories & Tags**: Hierarchical categories and custom tags
- **Groups**: Expense splitting with settlement suggestions
- **Investments**: Portfolio tracking with performance metrics
- **Lend/Borrow**: Debt tracking with payment history

### AI-Powered Features
- **Auto-Categorization**: Smart transaction categorization
- **AI Chat**: Conversational financial assistant
- **Insights**: Personalized financial insights and recommendations
- **Receipt Parsing**: Extract transaction details from receipts

### Analytics & Reports
- **Analytics Dashboard**: Category breakdowns, trends, comparisons
- **Custom Reports**: Build and schedule custom reports
- **Export**: PDF, Excel, CSV export options
- **Reconciliation**: Bank statement matching

### User Experience
- **Responsive Design**: Mobile, tablet, desktop optimized
- **Dark Mode**: System-aware theme switching
- **Multi-language**: 6 languages supported (EN, ES, FR, DE, AR, JA)
- **Accessibility**: WCAG 2.1 AA compliant
- **PWA**: Installable, offline-capable
- **Real-time Updates**: WebSocket notifications

## Quick Start

### Prerequisites
```bash
node >= 20.0.0
npm >= 9.0.0
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
# API
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Features (optional)
VITE_ENABLE_AI=true
VITE_ENABLE_EMAIL_INTEGRATION=true

# PWA (optional)
VITE_PWA_ENABLED=true
```

### Development
```bash
# Run development server
npm run dev

# Open browser
# http://localhost:5173
```

### Build
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Testing
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Linting
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Routing

The application uses React Router with centralized route configuration in `src/config/routes.config.tsx`.

### Route Structure
```
/ - Dashboard
/accounts - Account management
/transactions - Transaction list
/budgets - Budget tracking
/analytics - Financial analytics
/groups - Group expenses
/investments - Investment portfolio
/lend-borrow - Debt tracking
/reports - Custom reports
/settings - User settings
  /settings/profile
  /settings/categories
  /settings/tags
  /settings/security
  /settings/sessions
  /settings/appearance
  /settings/reminders
  /settings/privacy
/admin - Admin dashboard (admin only)
```

### Protected Routes
Most routes require authentication. Use `ProtectedRoute` component:

```typescript
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### Public Routes
Public routes (login, register) use standard Route:

```typescript
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
```

## State Management

### Server State (TanStack Query)
Used for API data caching and synchronization:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['accounts'],
  queryFn: fetchAccounts
});

// Mutate data
const mutation = useMutation({
  mutationFn: createAccount,
  onSuccess: () => {
    queryClient.invalidateQueries(['accounts']);
  }
});
```

### Global State (Zustand)
Used for authentication and subscription state:

```typescript
import { useAuthStore } from '@/stores/authStore';

const { user, login, logout } = useAuthStore();
```

### Local State (React Hooks)
Used for component-specific state:

```typescript
const [isOpen, setIsOpen] = useState(false);
```

## API Integration

### Axios Instance
Configured in `src/services/api.ts`:

```typescript
import api from '@/services/api';

// GET request
const accounts = await api.get('/accounts');

// POST request
const newAccount = await api.post('/accounts', data);

// With auth (automatic)
// Access token sent via httpOnly cookie
```

### Error Handling
Global error interceptor handles:
- 401: Redirect to login
- 403: Show forbidden message
- 500: Show error notification

## Components

### Base UI Components (19)
Located in `src/components/ui/`:

- `Button` - Button component with variants
- `Input` - Text input with validation
- `Select` - Dropdown select
- `Dialog` - Modal dialog
- `Card` - Card container
- `Table` - Data table
- `Tabs` - Tab component
- `Alert` - Alert notifications
- `Badge` - Status badges
- `Avatar` - User avatar
- `Skeleton` - Loading skeleton
- `Progress` - Progress bar
- `Tooltip` - Tooltip overlay
- `Dropdown` - Dropdown menu
- `Checkbox` - Checkbox input
- `Radio` - Radio button
- `Switch` - Toggle switch
- `Slider` - Range slider
- `DatePicker` - Date selection

### Form Components
Located in `src/components/form/`:

- `FormField` - Generic form field wrapper
- `TextField` - Text input field
- `SelectField` - Select dropdown field
- `DateField` - Date picker field
- `CurrencyField` - Currency input field
- `TextAreaField` - Multi-line text field
- `CheckboxField` - Checkbox field
- `RadioField` - Radio button field
- `SwitchField` - Toggle switch field
- `FileUploadField` - File upload field
- `TagSelectField` - Multi-select tag field
- `CategorySelectField` - Hierarchical category select

### Layout Components
Located in `src/components/layout/`:

- `Header` - Application header with navigation
- `Sidebar` - Desktop sidebar navigation
- `MobileNav` - Mobile bottom navigation
- `PageLayout` - Page wrapper with consistent spacing
- `Container` - Content container

## Custom Hooks

Located in `src/hooks/`:

### Core Hooks
- `useAuth()` - Authentication state and methods
- `useWebSocket()` - WebSocket connection and events
- `useFeatureAccess()` - Subscription feature gating
- `useFilters()` - Advanced filtering logic
- `usePagination()` - Pagination state
- `useCrud()` - Generic CRUD operations
- `useEntityForm()` - Entity form management

### Data Hooks
- `useAccounts()` - Fetch and manage accounts
- `useTransactions()` - Fetch and manage transactions
- `useBudgets()` - Fetch and manage budgets
- `useCategories()` - Fetch and manage categories
- `useTags()` - Fetch and manage tags

### Utility Hooks
- `useTheme()` - Theme management
- `useI18n()` - Internationalization
- `useDebounce()` - Debounce values
- `useVirtualScroll()` - Virtual scrolling
- `useInfiniteScroll()` - Infinite scrolling

## Styling

### Tailwind CSS
Utility-first CSS framework with custom configuration:

```typescript
// Example usage
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Dashboard
  </h1>
</div>
```

### Theme Customization
Located in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...},
      success: {...},
      warning: {...},
      error: {...}
    }
  }
}
```

### Dark Mode
System-aware with manual toggle:

```typescript
import { useTheme } from '@/hooks/useTheme';

const { theme, toggleTheme } = useTheme();
// theme: 'light' | 'dark' | 'system'
```

## Internationalization (i18n)

### Supported Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Arabic (ar)
- Japanese (ja)

### Usage
```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Translate
<h1>{t('dashboard.welcome')}</h1>

// Change language
i18n.changeLanguage('es');
```

### Translation Files
Located in `public/locales/{lang}/translation.json`:

```json
{
  "dashboard": {
    "welcome": "Welcome to your dashboard",
    "netWorth": "Net Worth"
  }
}
```

## Accessibility

### Features
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles
- Skip navigation links
- High contrast mode support

### Components
Located in `src/components/a11y/`:

- `FocusTrap` - Trap focus within component
- `SkipNavLink` - Skip to main content
- `ScreenReaderOnly` - Visually hidden, screen reader visible
- `LiveRegion` - Announce dynamic content changes

### Guidelines
- All interactive elements keyboard accessible
- Minimum color contrast ratio: 4.5:1
- Form inputs have associated labels
- Error messages announced to screen readers
- Focus indicators visible

## Performance Optimizations

### Code Splitting
- Route-based code splitting with React.lazy()
- Dynamic imports for heavy components
- Vendor chunking in Vite config

### Caching
- TanStack Query caching (5 min default)
- Service worker caching for offline support
- localStorage for user preferences

### Virtual Scrolling
Used for large lists (transactions, etc.):

```typescript
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

const { virtualItems, totalSize } = useVirtualScroll({
  items: transactions,
  estimateSize: 60
});
```

### Image Optimization
- Lazy loading images
- WebP format with fallbacks
- Responsive images with srcset

### Bundle Size
```bash
# Analyze bundle
npm run build -- --stats
npx vite-bundle-visualizer
```

## PWA Features

### Installation
App can be installed on desktop and mobile devices.

### Offline Support
- Offline page caching
- API response caching
- Background sync for failed requests

### Service Worker
Located in `src/service-worker.ts`:

```typescript
// Cache strategies
- Network first for API calls
- Cache first for static assets
- Stale while revalidate for images
```

## WebSocket Integration

### Connection
```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

const { isConnected, on, emit } = useWebSocket();

// Listen for events
useEffect(() => {
  on('notification.new', (notification) => {
    // Handle new notification
  });
}, [on]);
```

### Events
- `notification.new` - New notification
- `budget.alert` - Budget alert
- `transaction.created` - Transaction created
- `balance.updated` - Account balance updated
- `group.expense.added` - Group expense added

## Feature Modules

Each feature has its own detailed README:

- [Dashboard](./src/features/dashboard/README.md) - Customizable dashboard
- [Transactions](./src/features/transactions/README.md) - Transaction management
- [Budgets](./src/features/budgets/README.md) - Budget tracking
- [Analytics](./src/features/analytics/README.md) - Financial analytics
- [Groups](./src/features/groups/README.md) - Group expenses
- [Auth](./src/features/auth/README.md) - Authentication
- [Settings](./src/features/settings/README.md) - User settings

## Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Docker
```bash
docker build -t fms-frontend .
docker run -p 5173:5173 fms-frontend
```

### Static Hosting
Deploy `dist/` directory to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

### Environment Variables
Set production environment variables in your hosting platform.

## Troubleshooting

### Common Issues

**API connection fails:**
```
Check VITE_API_URL in .env
Ensure backend is running
Verify CORS settings
```

**Build fails:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**Type errors:**
```bash
# Regenerate types
npm run type-check
```

**i18n keys missing:**
```
Check translation files in public/locales/
Ensure all keys exist in all language files
```

## Browser Support
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## License
MIT

## Support
For issues and questions, please open an issue on GitHub.

## Links
- [Backend Repository](../backend/README.md)
- [API Documentation](http://localhost:3000/api/docs)
- [Deployment Guide](../docs/Deployment-Guide.md)
