# Shared Components

## Overview
This directory contains reusable components used throughout the Finance Management System frontend. Components are organized by functionality and follow a consistent design pattern.

## Component Categories

### UI Primitives (`/ui`)
Base components built on Radix UI primitives, styled with Tailwind CSS.

### Form Components (`/form`)
Form fields and form-related components with validation support.

### Layout Components (`/layout`)
Application layout components (Header, Sidebar, Navigation).

### Feature Components
Specialized components for specific features (2FA, Audit, Export, etc.).

## Directory Structure

```
components/
├── 2fa/                      # Two-Factor Authentication
│   ├── Enable2FA.tsx
│   ├── Verify2FA.tsx
│   └── Disable2FA.tsx
│
├── a11y/                     # Accessibility Components
│   ├── FocusTrap.tsx
│   ├── SkipNavLink.tsx
│   ├── ScreenReaderOnly.tsx
│   └── LiveRegion.tsx
│
├── audit/                    # Audit Trail Components
│   ├── AuditLog.tsx
│   └── AuditEntry.tsx
│
├── cards/                    # Card Components
│   ├── StatCard.tsx
│   ├── InfoCard.tsx
│   └── MetricCard.tsx
│
├── error-boundary/           # Error Handling
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── RouteErrorBoundary.tsx
│
├── export/                   # Export Components
│   ├── ExportMenu.tsx
│   └── ExportButton.tsx
│
├── feature-gate/             # Subscription Feature Gates
│   ├── FeatureGate.tsx
│   └── UpgradePrompt.tsx
│
├── filters/                  # Filter Components
│   ├── DateRangeFilter.tsx
│   ├── CategoryFilter.tsx
│   └── AmountRangeFilter.tsx
│
├── form/                     # Form Components
│   ├── FormField.tsx
│   └── fields/
│       ├── TextField.tsx
│       ├── SelectField.tsx
│       ├── DateField.tsx
│       ├── CurrencyField.tsx
│       ├── TextAreaField.tsx
│       ├── CheckboxField.tsx
│       ├── RadioField.tsx
│       ├── SwitchField.tsx
│       ├── FileUploadField.tsx
│       ├── TagSelectField.tsx
│       ├── CategorySelectField.tsx
│       └── AccountSelectField.tsx
│
├── i18n/                     # Internationalization
│   └── LanguageSwitcher.tsx
│
├── layout/                   # Layout Components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── MobileNav.tsx
│   ├── PageLayout.tsx
│   └── Container.tsx
│
├── skeleton/                 # Loading Skeletons
│   ├── TableSkeleton.tsx
│   ├── CardSkeleton.tsx
│   └── FormSkeleton.tsx
│
├── subscription/             # Subscription Components
│   ├── SubscriptionBadge.tsx
│   └── SubscriptionStatus.tsx
│
├── table/                    # Table Components
│   ├── DataTable.tsx
│   ├── TableHeader.tsx
│   └── TableRow.tsx
│
├── tabs/                     # Tab Components
│   ├── TabList.tsx
│   └── TabPanel.tsx
│
├── theme/                    # Theme Components
│   └── ThemeToggle.tsx
│
├── ui/                       # Base UI Primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── alert.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── skeleton.tsx
│   ├── progress.tsx
│   ├── tooltip.tsx
│   ├── dropdown-menu.tsx
│   ├── checkbox.tsx
│   ├── radio-group.tsx
│   ├── switch.tsx
│   ├── slider.tsx
│   └── date-picker.tsx
│
├── virtual/                  # Virtual Scrolling
│   └── VirtualList.tsx
│
└── README.md                 # This file
```

## UI Primitives (`/ui`)

### Button
Button component with multiple variants.

**Variants:**
- `default` - Primary button
- `secondary` - Secondary button
- `outline` - Outlined button
- `ghost` - Transparent button
- `destructive` - Danger/delete button
- `link` - Link-styled button

**Sizes:**
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

**Usage:**
```typescript
import { Button } from '@/components/ui/button';

<Button variant="default" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="destructive" size="sm">
  Delete
</Button>
```

### Input
Text input component with validation support.

**Props:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}
```

**Usage:**
```typescript
import { Input } from '@/components/ui/input';

<Input
  type="email"
  placeholder="Enter email"
  error={errors.email?.message}
/>
```

### Select
Dropdown select component.

**Usage:**
```typescript
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dialog
Modal dialog component.

**Usage:**
```typescript
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>
```

### Card
Card container component.

**Usage:**
```typescript
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Form Components (`/form`)

### FormField
Generic form field wrapper with label, error message, and help text.

**Usage:**
```typescript
import { FormField } from '@/components/form/FormField';

<FormField
  label="Email"
  error={errors.email?.message}
  required
  helpText="We'll never share your email"
>
  <Input type="email" {...register('email')} />
</FormField>
```

### TextField
Text input field with label and validation.

**Usage:**
```typescript
import { TextField } from '@/components/form/fields/TextField';

<TextField
  name="name"
  label="Full Name"
  control={control}
  required
  rules={{
    minLength: { value: 3, message: 'Name too short' }
  }}
/>
```

### SelectField
Select dropdown field with validation.

**Usage:**
```typescript
import { SelectField } from '@/components/form/fields/SelectField';

<SelectField
  name="category"
  label="Category"
  control={control}
  options={[
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' }
  ]}
  required
/>
```

### DateField
Date picker field.

**Usage:**
```typescript
import { DateField } from '@/components/form/fields/DateField';

<DateField
  name="date"
  label="Transaction Date"
  control={control}
  required
  maxDate={new Date()}
/>
```

### CurrencyField
Currency input with formatting.

**Usage:**
```typescript
import { CurrencyField } from '@/components/form/fields/CurrencyField';

<CurrencyField
  name="amount"
  label="Amount"
  control={control}
  currency="USD"
  required
/>
```

### CategorySelectField
Hierarchical category selector.

**Usage:**
```typescript
import { CategorySelectField } from '@/components/form/fields/CategorySelectField';

<CategorySelectField
  name="categoryId"
  label="Category"
  control={control}
  showHierarchy
  allowCreate
/>
```

## Layout Components (`/layout`)

### Header
Application header with navigation and user menu.

**Features:**
- Logo and branding
- Main navigation links
- User profile dropdown
- Notifications icon
- Theme toggle
- Mobile menu button

**Usage:**
```typescript
import { Header } from '@/components/layout/Header';

<Header />
```

### Sidebar
Desktop sidebar navigation.

**Features:**
- Navigation menu
- Active route highlighting
- Collapsible sections
- Quick actions
- Net worth display

**Usage:**
```typescript
import { Sidebar } from '@/components/layout/Sidebar';

<div className="flex">
  <Sidebar />
  <main>
    {children}
  </main>
</div>
```

### MobileNav
Mobile bottom navigation.

**Features:**
- 5 primary navigation items
- Active route highlighting
- Badge notifications
- Touch-optimized

**Usage:**
```typescript
import { MobileNav } from '@/components/layout/MobileNav';

<MobileNav />
```

### PageLayout
Consistent page layout wrapper.

**Usage:**
```typescript
import { PageLayout } from '@/components/layout/PageLayout';

<PageLayout
  title="Transactions"
  subtitle="Manage your transactions"
  actions={<Button>Add Transaction</Button>}
>
  {children}
</PageLayout>
```

## Feature Components

### FeatureGate
Restrict features based on subscription tier.

**Usage:**
```typescript
import { FeatureGate } from '@/components/feature-gate/FeatureGate';

<FeatureGate feature="AI_CATEGORIZATION" fallback={<UpgradePrompt />}>
  <AICategorization />
</FeatureGate>
```

### ExportMenu
Export data in various formats.

**Usage:**
```typescript
import { ExportMenu } from '@/components/export/ExportMenu';

<ExportMenu
  data={transactions}
  formats={['csv', 'excel', 'pdf']}
  filename="transactions"
  onExport={handleExport}
/>
```

### DateRangeFilter
Date range filter with presets.

**Presets:**
- Today
- Yesterday
- This Week
- Last Week
- This Month
- Last Month
- Last 3 Months
- Last 6 Months
- This Year
- Last Year
- Custom Range

**Usage:**
```typescript
import { DateRangeFilter } from '@/components/filters/DateRangeFilter';

<DateRangeFilter
  value={{ startDate, endDate }}
  onChange={setDateRange}
  presets
/>
```

### ThemeToggle
Toggle between light and dark themes.

**Usage:**
```typescript
import { ThemeToggle } from '@/components/theme/ThemeToggle';

<ThemeToggle />
```

### LanguageSwitcher
Switch between supported languages.

**Usage:**
```typescript
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

<LanguageSwitcher />
```

## Accessibility Components (`/a11y`)

### FocusTrap
Trap focus within a component (used in modals).

**Usage:**
```typescript
import { FocusTrap } from '@/components/a11y/FocusTrap';

<FocusTrap active={isModalOpen}>
  <div role="dialog">
    <h2>Modal Title</h2>
    <button>Close</button>
  </div>
</FocusTrap>
```

### SkipNavLink
Skip to main content link for keyboard users.

**Usage:**
```typescript
import { SkipNavLink } from '@/components/a11y/SkipNavLink';

<SkipNavLink href="#main-content">
  Skip to main content
</SkipNavLink>

<main id="main-content">
  {children}
</main>
```

### ScreenReaderOnly
Visually hidden content for screen readers.

**Usage:**
```typescript
import { ScreenReaderOnly } from '@/components/a11y/ScreenReaderOnly';

<ScreenReaderOnly>
  This text is only visible to screen readers
</ScreenReaderOnly>
```

### LiveRegion
Announce dynamic content to screen readers.

**Usage:**
```typescript
import { LiveRegion } from '@/components/a11y/LiveRegion';

<LiveRegion aria-live="polite">
  {statusMessage}
</LiveRegion>
```

## Loading Skeletons (`/skeleton`)

### TableSkeleton
Loading skeleton for tables.

**Usage:**
```typescript
import { TableSkeleton } from '@/components/skeleton/TableSkeleton';

{isLoading ? (
  <TableSkeleton rows={10} columns={6} />
) : (
  <Table data={data} />
)}
```

### CardSkeleton
Loading skeleton for cards.

**Usage:**
```typescript
import { CardSkeleton } from '@/components/skeleton/CardSkeleton';

{isLoading ? <CardSkeleton count={3} /> : <CardList />}
```

## Best Practices

### Component Design
1. **Single Responsibility** - Each component has one purpose
2. **Composition** - Build complex components from simple ones
3. **Prop Drilling** - Avoid deep prop drilling, use context when needed
4. **TypeScript** - Fully typed props and state
5. **Accessibility** - WCAG 2.1 AA compliant

### Styling
1. **Tailwind First** - Use Tailwind utilities
2. **Consistent Spacing** - Use spacing scale (p-4, m-2, etc.)
3. **Dark Mode** - Support dark mode with `dark:` prefix
4. **Responsive** - Mobile-first responsive design
5. **Theme Variables** - Use CSS variables for colors

### Performance
1. **Lazy Loading** - Lazy load heavy components
2. **Memoization** - Memo expensive components
3. **Code Splitting** - Split large component files
4. **Virtual Scrolling** - Use for long lists
5. **Debouncing** - Debounce user input

### Testing
1. **Unit Tests** - Test component logic
2. **Integration Tests** - Test component interactions
3. **Accessibility Tests** - Test with screen readers
4. **Visual Regression** - Test visual changes
5. **E2E Tests** - Test user flows

## Component Template

```typescript
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  /** Description of prop */
  propName: string;
  /** Optional prop */
  optionalProp?: boolean;
  /** Callback function */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ComponentName - Short description
 *
 * @example
 * ```tsx
 * <ComponentName propName="value" />
 * ```
 */
export const ComponentName: FC<ComponentNameProps> = ({
  propName,
  optionalProp = false,
  onClick,
  className
}) => {
  return (
    <div className={cn('base-classes', className)}>
      {/* Component content */}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
```

## Related Documentation
- [Hooks](../hooks/README.md) - Custom React hooks
- [Features](../features/README.md) - Feature modules
- [Utilities](../utils/README.md) - Utility functions
- [Styles](../styles/README.md) - Global styles
