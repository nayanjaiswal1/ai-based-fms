# Accessibility Quick Reference Card

Quick reference for developers building accessible components.

---

## 🎯 Quick Checklist

When creating a new component, ensure:

- [ ] All interactive elements are keyboard accessible
- [ ] Proper ARIA attributes added
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Semantic HTML used
- [ ] Screen reader tested
- [ ] No keyboard traps

---

## 🔧 Common Patterns

### Button with Icon Only

```tsx
<button
  onClick={handleClick}
  aria-label="Delete transaction"
  type="button"
  className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
>
  <TrashIcon aria-hidden="true" />
</button>
```

### Button with Icon and Text

```tsx
<button
  onClick={handleClick}
  type="button"
  className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
>
  <SaveIcon aria-hidden="true" />
  <span>Save</span>
</button>
```

### Form Field

```tsx
<FieldWrapper
  label="Email"
  required
  description="Enter your email address"
  error={errors.email}
  htmlFor="email"
>
  <input
    id="email"
    type="email"
    name="email"
    autoComplete="email"
    aria-required="true"
    aria-invalid={!!errors.email}
  />
</FieldWrapper>
```

### Modal

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function MyModal({ isOpen, onClose, title, children }) {
  const titleId = useId();
  const modalRef = useFocusTrap({ isActive: isOpen });

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} ref={modalRef}>
      <h2 id={titleId}>{title}</h2>
      {children}
      <button onClick={onClose} aria-label="Close">
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
```

### Navigation

```tsx
<nav aria-label="Main navigation">
  {items.map(item => (
    <NavLink
      to={item.href}
      aria-current={({ isActive }) => isActive ? 'page' : undefined}
      className="focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <item.icon aria-hidden="true" />
      <span>{item.name}</span>
    </NavLink>
  ))}
</nav>
```

### Loading State

```tsx
import { useAnnouncer } from '@/hooks/useAnnouncer';

function DataLoader() {
  const { announceLoading, announceSuccess } = useAnnouncer();

  useEffect(() => {
    if (isLoading) {
      announceLoading('Loading transactions');
    } else if (data) {
      announceSuccess('Transactions loaded successfully');
    }
  }, [isLoading, data]);

  return (
    <div aria-busy={isLoading} aria-live="polite">
      {isLoading ? <Spinner /> : <DataTable data={data} />}
    </div>
  );
}
```

---

## 📚 Common ARIA Attributes

| Attribute | Usage | Example |
|-----------|-------|---------|
| `aria-label` | Label for elements without visible text | `<button aria-label="Close">×</button>` |
| `aria-labelledby` | Reference to visible label | `<div role="dialog" aria-labelledby="title">` |
| `aria-describedby` | Additional description | `<input aria-describedby="help-text">` |
| `aria-hidden` | Hide from screen readers | `<Icon aria-hidden="true" />` |
| `aria-live` | Announce dynamic changes | `<div aria-live="polite">` |
| `aria-current` | Current item in set | `<a aria-current="page">` |
| `aria-expanded` | Toggle state | `<button aria-expanded={isOpen}>` |
| `aria-invalid` | Validation error | `<input aria-invalid="true">` |
| `aria-required` | Required field | `<input aria-required="true">` |
| `aria-modal` | Modal dialog | `<div role="dialog" aria-modal="true">` |

---

## 🎨 Focus Styles

Always include focus styles:

```tsx
className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
```

For inset focus:

```tsx
className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
```

---

## 🔤 Semantic HTML

Use semantic elements instead of divs:

```tsx
// ❌ Bad
<div className="header">...</div>
<div className="nav">...</div>
<div className="main">...</div>

// ✅ Good
<header>...</header>
<nav aria-label="Main navigation">...</nav>
<main id="main-content">...</main>
```

---

## 🎯 Heading Hierarchy

Maintain proper heading order:

```tsx
<h1>Page Title</h1>           // One per page
  <h2>Section Title</h2>      // Major sections
    <h3>Subsection</h3>       // Subsections
      <h4>Card Title</h4>     // Minor sections
```

**Never skip levels!**

---

## 🎹 Keyboard Shortcuts

```tsx
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

useKeyboardShortcut({
  key: 's',
  modifiers: ['ctrl', 'meta'],
  callback: handleSave,
  description: 'Save changes',
});
```

---

## 📢 Screen Reader Announcements

```tsx
import { useAnnouncer } from '@/hooks/useAnnouncer';

const { announce, announceSuccess, announceError } = useAnnouncer();

// Polite announcement
announceSuccess('Transaction saved');

// Assertive announcement
announceError('Failed to save');

// Custom
announce('Custom message', { politeness: 'polite' });
```

---

## 👁️ Visually Hidden Text

```tsx
import { VisuallyHidden } from '@/components/a11y';

<button>
  <Icon aria-hidden="true" />
  <VisuallyHidden>Delete transaction</VisuallyHidden>
</button>
```

Or use the CSS class:

```tsx
<span className="sr-only">For screen readers only</span>
```

---

## 🔒 Focus Trap

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

const modalRef = useFocusTrap({
  isActive: isOpen,
  autoFocus: true,
  restoreFocus: true,
});

<div ref={modalRef}>...</div>
```

---

## 🎨 Color Contrast Requirements

- **Normal text**: 4.5:1 minimum
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum
- **UI components**: 3:1 minimum

Test with: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🧪 Testing Checklist

### Keyboard
- [ ] Tab through all elements
- [ ] All interactive elements reachable
- [ ] Logical tab order
- [ ] Visible focus indicators
- [ ] Escape closes modals
- [ ] No keyboard traps

### Screen Reader
- [ ] All images have alt text
- [ ] Buttons have clear labels
- [ ] Form errors announced
- [ ] Loading states announced
- [ ] Page title announced

### Visual
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Works in light and dark mode
- [ ] Text resizes correctly

---

## 📦 Available Components

```tsx
import {
  SkipNav,          // Skip to main content
  VisuallyHidden,   // Screen reader only text
  FocusTrap,        // Focus trapping
  LiveRegion,       // ARIA live announcements
  AlertRegion,      // Assertive announcements
  StatusRegion,     // Polite announcements
} from '@/components/a11y';
```

---

## 🔗 Quick Links

- [Full Documentation](/frontend/ACCESSIBILITY.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## ⚠️ Common Mistakes

### ❌ Don't Do This

```tsx
// Missing aria-label on icon button
<button onClick={handleDelete}>
  <TrashIcon />
</button>

// Icon not hidden from screen readers
<button aria-label="Delete">
  <TrashIcon />
</button>

// Missing type attribute
<button onClick={handleClick}>Click me</button>

// No focus styles
<button className="px-4 py-2">Click me</button>
```

### ✅ Do This

```tsx
// Proper icon button
<button
  onClick={handleDelete}
  aria-label="Delete transaction"
  type="button"
  className="focus:outline-none focus:ring-2 focus:ring-ring"
>
  <TrashIcon aria-hidden="true" />
</button>
```

---

## 💡 Pro Tips

1. **Test early and often** - Don't wait until the end
2. **Use semantic HTML** - It's accessible by default
3. **Keyboard first** - If it works with keyboard, it works for everyone
4. **Screen reader test** - You'll catch issues you never expected
5. **Use the tools** - axe DevTools, Lighthouse, WAVE
6. **Ask for help** - Accessibility is complex, we're here to help!

---

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install

# Run accessibility audit
npm run lighthouse

# Run automated tests
npm run test:a11y
```

---

_Remember: Accessibility is not optional!_
