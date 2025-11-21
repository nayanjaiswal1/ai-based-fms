# FMS Styling Guide

## Overview
This guide defines the unified styling system for the Finance Management System. All developers must follow these conventions to maintain consistency and enable proper dark mode support.

## Design Tokens

### Color System

**✅ ALWAYS USE** theme variables instead of hardcoded Tailwind colors:

| Old (Hardcoded) | New (Theme-aware) | Usage |
|-----------------|-------------------|-------|
| `text-gray-600` | `text-muted-foreground` | Secondary text |
| `text-gray-700` | `text-foreground` | Primary text |
| `bg-gray-100` | `bg-muted` | Muted backgrounds |
| `bg-gray-50` | `bg-accent` | Subtle highlights |
| `text-blue-600` | `text-primary` | Primary brand color |
| `bg-blue-500` | `bg-primary` | Primary buttons/accents |
| `text-red-600` | `text-destructive` | Error states |
| `bg-red-50` | `bg-destructive/10` | Error backgrounds |
| `text-green-600` | `text-success` | Success states |
| `bg-green-50` | `bg-success/10` | Success backgrounds |
| `text-yellow-600` | `text-warning` | Warning states |
| `bg-yellow-50` | `bg-warning/10` | Warning backgrounds |
| `border-gray-300` | `border-border` | Default borders |
| `border-gray-200` | `border-input` | Input borders |

### Available Theme Colors

```tsx
// Primary Colors
bg-primary text-primary-foreground
bg-secondary text-secondary-foreground

// Status Colors
bg-success text-success-foreground
bg-warning text-warning-foreground
bg-destructive text-destructive-foreground

// Neutral Colors
bg-background text-foreground
bg-card text-card-foreground
bg-muted text-muted-foreground
bg-accent text-accent-foreground

// Borders & Inputs
border-border
border-input
ring-ring
```

## Spacing System

### Use Standardized Spacing Classes

```tsx
// Section Spacing (between major sections)
<div className="section-spacing"> // space-y-6 md:space-y-8
  <section>...</section>
  <section>...</section>
</div>

// Card Padding
<div className="card-spacing"> // p-6
  Content
</div>

// Form Spacing (between form fields)
<form className="form-spacing"> // space-y-4
  <input />
  <input />
</form>

// Input Group Spacing (label + input)
<div className="input-spacing"> // space-y-2
  <label>Name</label>
  <input />
</div>
```

### Standard Spacing Values

| Context | Mobile | Tablet+ | Usage |
|---------|--------|---------|-------|
| Page sections | `space-y-6` | `md:space-y-8` | Between major page sections |
| Card grid | `gap-4` | `md:gap-6` | Grid of cards |
| Form fields | `space-y-4` | - | Between inputs in forms |
| Input groups | `space-y-2` | - | Label + input pairs |
| Button groups | `gap-3` | - | Side-by-side buttons |

## Typography

### Headings

All headings use serif font and are theme-aware:

```tsx
<h1>Page Title</h1> // text-4xl md:text-5xl lg:text-6xl font-extrabold
<h2>Section Title</h2> // text-3xl md:text-4xl font-bold
<h3>Subsection</h3> // text-2xl md:text-3xl font-semibold
<h4>Card Title</h4> // text-xl md:text-2xl font-semibold
<h5>Small Title</h5> // text-lg md:text-xl font-medium
<h6>Micro Title</h6> // text-base md:text-lg font-medium
```

### Body Text

```tsx
// Large body text
<p className="text-base">Normal paragraph</p>

// Default body text
<p className="text-sm">Most UI text</p>

// Small text
<p className="text-xs">Captions, metadata</p>

// Muted text
<p className="text-muted-foreground">Secondary information</p>
```

### Font Weights

| Weight | Usage |
|--------|-------|
| `font-medium` | Labels, form fields |
| `font-semibold` | Buttons, emphasized text |
| `font-bold` | Headings (h2-h3) |
| `font-extrabold` | Page titles (h1) |

## Buttons

### Use Standardized Button Classes

```tsx
// Primary action button
<button className="btn-primary">
  Save Changes
</button>

// Secondary button
<button className="btn-secondary">
  Cancel
</button>

// Destructive action
<button className="btn-destructive">
  Delete
</button>

// Outlined button
<button className="btn-outline">
  Learn More
</button>

// Ghost button (minimal)
<button className="btn-ghost">
  <Settings className="h-4 w-4" />
</button>
```

**❌ DON'T** create custom button styles
**✅ DO** use the Button component or standardized classes

## Form Inputs

### Use Standardized Input Styling

```tsx
// Standard input
<input
  className="input-base"
  type="text"
  placeholder="Enter value"
/>

// Or use the Input component
<Input placeholder="Enter value" />
```

### Form Structure

```tsx
<form className="form-spacing">
  <div className="input-spacing">
    <label className="text-sm font-medium text-foreground">
      Email Address
    </label>
    <input
      type="email"
      className="input-base"
      placeholder="you@example.com"
    />
    <p className="text-xs text-muted-foreground">
      We'll never share your email
    </p>
  </div>
</form>
```

## Cards

### Standard Card Structure

```tsx
<div className="surface-elevated rounded-lg card-spacing">
  <h3 className="text-lg font-semibold text-foreground mb-4">
    Card Title
  </h3>
  <p className="text-sm text-muted-foreground">
    Card content goes here
  </p>
</div>
```

## Badges & Status Indicators

### Use Standardized Badge Classes

```tsx
// Success badge
<span className="badge-success">
  Active
</span>

// Warning badge
<span className="badge-warning">
  Pending
</span>

// Error badge
<span className="badge-destructive">
  Failed
</span>

// Info badge
<span className="badge-info">
  New
</span>

// Muted badge
<span className="badge-muted">
  Draft
</span>
```

## Focus States

### ALWAYS use `focus-visible:`

```tsx
// ✅ Correct - keyboard focus only
<button className="focus-visible:ring-2 focus-visible:ring-ring">
  Click me
</button>

// ❌ Wrong - triggers on mouse click
<button className="focus:ring-2 focus:ring-blue-500">
  Click me
</button>
```

All interactive elements MUST have proper focus states:
- `focus-visible:outline-none`
- `focus-visible:ring-2`
- `focus-visible:ring-ring`
- `focus-visible:ring-offset-2`

## Responsive Design

### Mobile-First Approach

```tsx
// ✅ Correct
<div className="px-4 md:px-6 lg:px-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {/* Cards */}
  </div>
</div>

// ❌ Wrong - no mobile consideration
<div className="px-8">
  <div className="grid grid-cols-3 gap-6">
    {/* Cards */}
  </div>
</div>
```

### Breakpoint Guidelines

| Breakpoint | Value | Usage |
|------------|-------|-------|
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Desktops |
| `xl:` | 1280px | Large desktops |
| `2xl:` | 1536px | Extra large screens |

## Dark Mode

### Theme-Aware Components

All components MUST support dark mode by using theme variables:

```tsx
// ✅ Automatically adapts to dark mode
<div className="bg-card text-card-foreground border border-border">
  Content
</div>

// ❌ Stays the same in dark mode
<div className="bg-white text-gray-900 border border-gray-200">
  Content
</div>
```

### Manual Dark Mode Overrides (when necessary)

```tsx
// Only use when theme variables don't work
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Special case
</div>
```

## Animation & Transitions

### Standard Transition Duration

```tsx
// Default transitions (most UI elements)
<button className="transition-all duration-200">
  Hover me
</button>

// Color-only transitions (links, text)
<a className="transition-colors duration-200">
  Link
</a>
```

### Respect Reduced Motion

All animations automatically respect `prefers-reduced-motion` via CSS.

## Examples

### Complete Form Example

```tsx
<form className="form-spacing max-w-md">
  <div className="input-spacing">
    <label className="text-sm font-medium text-foreground">
      Full Name
    </label>
    <input
      type="text"
      className="input-base"
      placeholder="John Doe"
    />
  </div>

  <div className="input-spacing">
    <label className="text-sm font-medium text-foreground">
      Email Address
    </label>
    <input
      type="email"
      className="input-base"
      placeholder="john@example.com"
    />
    <p className="text-xs text-muted-foreground">
      We'll never share your email
    </p>
  </div>

  <div className="flex gap-3 pt-4">
    <button type="submit" className="btn-primary flex-1">
      Save Changes
    </button>
    <button type="button" className="btn-outline">
      Cancel
    </button>
  </div>
</form>
```

### Complete Card Example

```tsx
<div className="surface-elevated rounded-lg overflow-hidden">
  <div className="card-spacing border-b border-border">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-foreground">
        Account Summary
      </h3>
      <span className="badge-success">Active</span>
    </div>
  </div>

  <div className="card-spacing space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Total Balance</span>
      <span className="text-2xl font-bold text-foreground">$12,450.00</span>
    </div>

    <div className="flex gap-3">
      <button className="btn-primary flex-1">
        View Details
      </button>
      <button className="btn-outline">
        Export
      </button>
    </div>
  </div>
</div>
```

## Migration Checklist

When refactoring existing components:

- [ ] Replace all hardcoded colors with theme variables
- [ ] Use standardized spacing classes
- [ ] Replace `focus:` with `focus-visible:`
- [ ] Ensure proper responsive breakpoints
- [ ] Use standardized button/badge/input classes
- [ ] Test in both light and dark modes
- [ ] Verify reduced motion support

## Common Mistakes to Avoid

1. **❌ Hardcoded Colors**: `bg-blue-500` → **✅** `bg-primary`
2. **❌ Inconsistent Spacing**: `p-3`, `p-5`, `p-7` → **✅** `card-spacing`
3. **❌ Wrong Focus**: `focus:ring-` → **✅** `focus-visible:ring-`
4. **❌ Missing Dark Mode**: `bg-white` → **✅** `bg-card`
5. **❌ Non-responsive**: `grid-cols-3` → **✅** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## Questions?

For styling questions or clarifications, refer to:
- `frontend/src/styles/index.css` - All design tokens
- `frontend/tailwind.config.js` - Tailwind configuration
- This guide - Styling conventions

---

**Last Updated**: November 2025
**Version**: 2.0
