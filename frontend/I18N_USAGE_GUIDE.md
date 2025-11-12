# Internationalization (i18n) Usage Guide

This guide explains how to use the i18n system in the Finance Management System.

## Overview

The application supports 6 languages:
- **English (en)** - Default
- **Spanish (es)**
- **French (fr)**
- **German (de)**
- **Japanese (ja)**
- **Arabic (ar)** - RTL support

## Quick Start

### 1. Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common'); // Specify namespace

  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <p>{t('messages.loading')}</p>
    </div>
  );
}
```

### 2. Using Multiple Namespaces

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['common', 'transactions']);

  return (
    <div>
      <h1>{t('common:navigation.transactions')}</h1>
      <button>{t('transactions:actions.create')}</button>
    </div>
  );
}
```

### 3. Interpolation

```tsx
// Translation: "Welcome back, {{name}}!"
<h1>{t('dashboard:welcome', { name: user.name })}</h1>

// Translation: "Showing {{from}}-{{to}} of {{total}}"
<p>{t('common:pagination.showing', { from: 1, to: 10, total: 100 })}</p>
```

### 4. Pluralization

```tsx
// Translation keys:
// "items_one": "{{count}} item"
// "items_other": "{{count}} items"

<p>{t('items', { count: 1 })}</p> // "1 item"
<p>{t('items', { count: 5 })}</p> // "5 items"
```

### 5. Using the useLocale Hook

```tsx
import { useLocale } from '@/hooks/useLocale';

function MyComponent() {
  const {
    language,           // Current language code
    setLanguage,        // Change language function
    isRTL,             // Boolean for RTL
    direction,         // 'ltr' or 'rtl'
    format,            // Formatting functions
  } = useLocale();

  return (
    <div dir={direction}>
      <p>{format.currency(1000, 'USD')}</p>
      <p>{format.date(new Date())}</p>
      <p>{format.number(12345.67)}</p>
      <p>{format.percentage(85)}</p>
      <p>{format.relativeTime(someDate)}</p>
    </div>
  );
}
```

## Available Namespaces

- **common** - Navigation, actions, messages, validation
- **auth** - Login, register, password reset
- **dashboard** - Dashboard widgets and stats
- **transactions** - Transaction management
- **accounts** - Account management
- **budgets** - Budget management
- **analytics** - Analytics and reports
- **settings** - Settings pages
- **notifications** - Notifications
- **groups** - Group expenses
- **investments** - Investment tracking
- **lendBorrow** - Lend & borrow management
- **email** - Email integration
- **import** - Data import
- **ai** - AI assistant
- **insights** - Financial insights
- **audit** - Activity log

## Formatting Functions

### Currency

```tsx
const { format } = useLocale();

// Basic usage
format.currency(1234.56, 'USD') // "$1,234.56"

// With options
format.currency(1234.56, 'EUR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})
```

### Date & Time

```tsx
const { format } = useLocale();

// Date
format.date(new Date()) // "Jan 15, 2024"

// Time
format.time(new Date()) // "10:30 AM"

// Date and Time
format.dateTime(new Date()) // "Jan 15, 2024, 10:30 AM"

// Relative Time
format.relativeTime(someDate) // "2 hours ago", "in 3 days"
```

### Numbers

```tsx
const { format } = useLocale();

// Basic number
format.number(12345.67) // "12,345.67"

// Percentage
format.percentage(85) // "85%"

// Compact number
format.compactNumber(1500000) // "1.5M"
```

## Language Switcher Component

### Select Variant (Default)

```tsx
import { LanguageSwitcher } from '@/components/i18n';

<LanguageSwitcher
  variant="select"
  showIcon={true}
  showLabel={true}
/>
```

### Inline Variant (For Settings)

```tsx
import { LanguageSwitcher } from '@/components/i18n';

<LanguageSwitcher
  variant="inline"
  showIcon={true}
  showLabel={true}
/>
```

## RTL Support

The application automatically handles RTL languages (like Arabic):

### Automatic Handling
- Direction is set on `<html>` element
- CSS logical properties are used (start/end instead of left/right)
- Layout automatically mirrors for RTL languages

### Using Logical Properties in Tailwind

```tsx
// Instead of ml-4 (margin-left), use:
<div className="ms-4">  // margin-inline-start

// Instead of mr-4 (margin-right), use:
<div className="me-4">  // margin-inline-end

// Instead of text-left, use:
<div className="text-start">

// Instead of text-right, use:
<div className="text-end">

// Instead of pl-4, use:
<div className="ps-4">  // padding-inline-start

// Instead of pr-4, use:
<div className="pe-4">  // padding-inline-end
```

### Detecting RTL

```tsx
import { useLocale } from '@/hooks/useLocale';

function MyComponent() {
  const { isRTL, direction } = useLocale();

  return (
    <div dir={direction}>
      {isRTL && <p>This is RTL mode</p>}
    </div>
  );
}
```

## Best Practices

### 1. Always Use Translation Keys

❌ **Don't:**
```tsx
<button>Add Transaction</button>
```

✅ **Do:**
```tsx
<button>{t('transactions:actions.create')}</button>
```

### 2. Use Fallback Values for Development

```tsx
// This helps during development when translations are missing
<h1>{t('newFeature.title', 'New Feature Title')}</h1>
```

### 3. Organize Keys by Feature

```
transactions:
  actions:
    create: "Create Transaction"
    update: "Update Transaction"
  fields:
    date: "Date"
    amount: "Amount"
```

### 4. Use Logical CSS Properties

```tsx
// This works in both LTR and RTL
<div className="ms-4 me-2 ps-6 pe-4">
```

### 5. Handle Plurals Properly

```json
{
  "transaction_one": "{{count}} transaction",
  "transaction_other": "{{count}} transactions"
}
```

### 6. Keep Formatting Consistent

```tsx
const { format } = useLocale();

// Use formatting functions for consistency
<p>{format.currency(amount, currency)}</p>
<p>{format.date(date)}</p>
```

## Adding New Translations

### 1. Add Key to English Translation

Edit `/public/locales/en/{namespace}.json`:

```json
{
  "myNewFeature": {
    "title": "My New Feature",
    "description": "This is a new feature"
  }
}
```

### 2. Add to Other Languages

Copy the structure to other language files and translate:

`/public/locales/es/{namespace}.json`:
```json
{
  "myNewFeature": {
    "title": "Mi Nueva Función",
    "description": "Esta es una nueva función"
  }
}
```

### 3. Use in Component

```tsx
<h1>{t('myNewFeature.title')}</h1>
<p>{t('myNewFeature.description')}</p>
```

## Common Patterns

### Loading States

```tsx
const { t } = useTranslation('common');

{isLoading && <p>{t('actions.loading')}</p>}
```

### Error Messages

```tsx
const { t } = useTranslation('common');

{error && <p>{t('messages.error')}</p>}
```

### Confirmation Dialogs

```tsx
const { t } = useTranslation('common');

const handleDelete = () => {
  if (confirm(t('messages.confirmDelete'))) {
    // Delete item
  }
};
```

### Form Labels

```tsx
const { t } = useTranslation('transactions');

<label>
  {t('fields.amount')}
  <input type="number" />
</label>
```

## Testing

### Testing Components with i18n

```tsx
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

function renderWithI18n(component) {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
}

test('renders translated text', () => {
  const { getByText } = renderWithI18n(<MyComponent />);
  expect(getByText('Dashboard')).toBeInTheDocument();
});
```

## Troubleshooting

### Translation Not Showing

1. **Check if namespace is loaded:**
   ```tsx
   const { t, ready } = useTranslation('myNamespace');
   if (!ready) return <div>Loading...</div>;
   ```

2. **Check translation key:**
   ```tsx
   // Verify the key exists in the JSON file
   console.log(t('myKey', { returnObjects: true }));
   ```

3. **Check for typos:**
   ```tsx
   // Make sure namespace and key are correct
   t('common:navigation.dashboard') // ✅
   t('comman:navigation.dashboard') // ❌ typo
   ```

### Language Not Changing

1. **Clear localStorage:**
   ```tsx
   localStorage.removeItem('i18nextLng');
   ```

2. **Check if language is supported:**
   ```tsx
   import { supportedLanguages } from '@/i18n/config';
   console.log(supportedLanguages);
   ```

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Intl API Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)

## Support

For issues or questions about i18n:
1. Check this guide first
2. Review translation files in `/public/locales/`
3. Check console for i18n warnings
4. Verify namespace and key paths
