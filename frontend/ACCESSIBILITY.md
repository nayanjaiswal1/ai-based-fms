# Accessibility (WCAG 2.1 AA Compliance) Documentation

## Overview

This Finance Management System has been designed and implemented to meet **WCAG 2.1 Level AA** accessibility standards, ensuring the application is usable by people with various disabilities.

## Table of Contents

1. [Keyboard Navigation](#keyboard-navigation)
2. [Screen Reader Support](#screen-reader-support)
3. [Focus Management](#focus-management)
4. [Color Contrast](#color-contrast)
5. [ARIA Attributes](#aria-attributes)
6. [Semantic HTML](#semantic-html)
7. [Forms Accessibility](#forms-accessibility)
8. [Components](#components)
9. [Utilities & Hooks](#utilities--hooks)
10. [Testing](#testing)

---

## Keyboard Navigation

All interactive elements are fully keyboard accessible.

### Global Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move focus forward |
| `Shift + Tab` | Move focus backward |
| `Enter` / `Space` | Activate buttons and links |
| `Escape` | Close modals and dialogs |

### Skip Navigation

- **Skip to Main Content**: Press `Tab` on page load to reveal skip link
- Allows keyboard users to bypass repetitive navigation
- Complies with WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)

### Focus Indicators

- All interactive elements have visible focus indicators
- Focus indicators use a 2px outline with offset for clarity
- Custom `focus:ring-2 focus:ring-ring focus:ring-offset-2` classes

---

## Screen Reader Support

The application provides comprehensive screen reader support for NVDA, JAWS, and VoiceOver.

### Screen Reader Features

1. **ARIA Live Regions**: Dynamic content updates are announced
2. **Descriptive Labels**: All buttons and interactive elements have clear labels
3. **Status Messages**: Loading states, success, and error messages are announced
4. **Hidden Icons**: Decorative icons are hidden with `aria-hidden="true"`
5. **Visually Hidden Text**: Additional context for screen reader users

### Example Usage

```tsx
import { useAnnouncer } from '@/hooks/useAnnouncer';

function MyComponent() {
  const { announceSuccess, announceError } = useAnnouncer();

  const handleSave = async () => {
    try {
      await saveData();
      announceSuccess('Data saved successfully');
    } catch (error) {
      announceError('Failed to save data');
    }
  };
}
```

---

## Focus Management

### Focus Trap in Modals

All modals implement focus trapping to keep keyboard navigation within the modal.

**Features:**
- Focus automatically moves to the first focusable element
- Tab cycles through elements within the modal
- Escape key closes the modal
- Focus returns to the trigger element when modal closes

**Implementation:**

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function MyModal({ isOpen, onClose }) {
  const modalRef = useFocusTrap({
    isActive: isOpen,
    autoFocus: true,
    restoreFocus: true,
  });

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

### Focus Order

- Logical tab order follows visual layout
- Tab order matches reading order (left to right, top to bottom)
- No keyboard traps (except intentional ones in modals)

---

## Color Contrast

All text meets WCAG AA contrast ratios:

- **Normal text** (< 18pt): 4.5:1 minimum contrast ratio
- **Large text** (≥ 18pt or ≥ 14pt bold): 3:1 minimum contrast ratio

### Theme Support

- **Light Mode**: Dark text on light backgrounds
- **Dark Mode**: Light text on dark backgrounds
- **System Mode**: Respects user's OS preference

### Color Independence

- Information is never conveyed by color alone
- Icons and patterns supplement color coding
- Status indicators use icons + color + text

---

## ARIA Attributes

### Common ARIA Attributes Used

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Labels elements without visible text | Icon buttons |
| `aria-labelledby` | References visible label | Modal titles |
| `aria-describedby` | Additional description | Form field help text |
| `aria-live` | Announces dynamic content | Status messages |
| `aria-modal` | Identifies modal dialogs | Modal overlays |
| `aria-hidden` | Hides decorative elements | Icons |
| `aria-current` | Indicates current item | Active navigation |
| `aria-expanded` | Toggle state | Dropdowns, accordions |
| `aria-invalid` | Form validation errors | Invalid inputs |
| `aria-required` | Required form fields | Required inputs |

### Example: Accessible Button

```tsx
<button
  onClick={handleClick}
  aria-label="Delete transaction"
  type="button"
  className="focus:outline-none focus:ring-2 focus:ring-ring"
>
  <TrashIcon aria-hidden="true" />
</button>
```

---

## Semantic HTML

### HTML5 Semantic Elements

The application uses proper semantic HTML5 elements:

- `<header>` - Page header with branding and user actions
- `<nav>` - Navigation menus (sidebar, mobile nav)
- `<main>` - Main content area (marked with `id="main-content"`)
- `<aside>` - Sidebar navigation
- `<article>` - Individual transactions, reports
- `<section>` - Content sections within pages
- `<footer>` - Page footer (if applicable)

### Heading Hierarchy

Proper heading hierarchy is maintained:

- `<h1>` - Page title (one per page)
- `<h2>` - Major sections
- `<h3>` - Subsections
- `<h4>` - Card titles, minor sections

**Important**: Never skip heading levels!

---

## Forms Accessibility

### Form Field Requirements

All form fields include:

1. **Visible Labels**: Every input has an associated `<label>`
2. **Required Indicators**: Required fields marked with asterisk (*)
3. **Error Messages**: Validation errors announced to screen readers
4. **Help Text**: Additional guidance with `aria-describedby`
5. **Autocomplete**: Appropriate `autocomplete` attributes

### Example: Accessible Form Field

```tsx
<FieldWrapper
  label="Email Address"
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
    aria-describedby="email-description email-error"
  />
</FieldWrapper>
```

### Form Validation

- Inline validation with real-time feedback
- Error messages use `role="alert"` and `aria-live="polite"`
- Errors are associated with fields using `aria-describedby`
- Clear, actionable error messages

---

## Components

### Accessibility Components

#### 1. SkipNav

Allows keyboard users to skip navigation and jump to main content.

```tsx
import { SkipNav } from '@/components/a11y';

<SkipNav /> // Uses default target: #main-content
<SkipNav targetId="custom-target">Skip to results</SkipNav>
```

#### 2. VisuallyHidden

Hides content visually while keeping it accessible to screen readers.

```tsx
import { VisuallyHidden } from '@/components/a11y';

<button>
  <TrashIcon />
  <VisuallyHidden>Delete transaction</VisuallyHidden>
</button>
```

#### 3. LiveRegion

Announces dynamic content to screen readers.

```tsx
import { LiveRegion, AlertRegion, StatusRegion } from '@/components/a11y';

// Polite announcement
<StatusRegion message="Data loaded successfully" />

// Assertive announcement
<AlertRegion message="Error: Failed to save" />

// Custom
<LiveRegion politeness="polite" role="status">
  Loading transactions...
</LiveRegion>
```

#### 4. FocusTrap

Traps keyboard focus within a container (for modals).

```tsx
import { FocusTrap } from '@/components/a11y';

<FocusTrap isActive={isModalOpen} autoFocus restoreFocus>
  <div>Modal content</div>
</FocusTrap>
```

---

## Utilities & Hooks

### Custom Hooks

#### useFocusTrap

Manages focus trapping for modals and dialogs.

```tsx
const modalRef = useFocusTrap({
  isActive: isOpen,
  autoFocus: true,
  restoreFocus: true,
  onActivate: () => console.log('Trap activated'),
  onDeactivate: () => console.log('Trap deactivated'),
});
```

#### useAnnouncer

Makes announcements to screen readers.

```tsx
const { announce, announceSuccess, announceError } = useAnnouncer();

announce('Loading data', { politeness: 'polite' });
announceSuccess('Saved successfully');
announceError('An error occurred');
```

#### useKeyboardShortcut

Registers keyboard shortcuts.

```tsx
useKeyboardShortcut({
  key: 's',
  modifiers: ['ctrl', 'meta'],
  callback: handleSave,
  description: 'Save changes',
});
```

### Utility Functions

Located in `/frontend/src/utils/accessibility.ts`:

- `generateId()` - Generate unique IDs for accessibility
- `getFocusableElements()` - Get all focusable elements in container
- `trapFocus()` - Trap focus within element
- `announceToScreenReader()` - Make screen reader announcement
- `getContrastRatio()` - Calculate color contrast ratio
- `meetsWCAGAA()` - Check if contrast meets WCAG AA
- `formatCurrencyForScreenReader()` - Format currency for SR
- `formatDateForScreenReader()` - Format date for SR

---

## Testing

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Escape closes modals
- [ ] Enter/Space activates buttons

#### Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS)
- [ ] All images have alt text
- [ ] Form errors are announced
- [ ] Dynamic content changes are announced

#### Focus Management
- [ ] Focus trapped in modals
- [ ] Focus returns after modal close
- [ ] Skip links work correctly
- [ ] No focus traps on regular pages

#### Color Contrast
- [ ] Text meets 4.5:1 ratio (normal text)
- [ ] Large text meets 3:1 ratio
- [ ] Interactive elements have sufficient contrast
- [ ] Works in both light and dark modes

#### Forms
- [ ] All fields have labels
- [ ] Required fields clearly marked
- [ ] Error messages visible and announced
- [ ] Help text associated with fields

### Automated Testing Tools

1. **axe DevTools** - Browser extension for accessibility testing
2. **WAVE** - Web accessibility evaluation tool
3. **Lighthouse** - Chrome DevTools audit
4. **Pa11y** - Automated accessibility testing

### Testing Commands

```bash
# Run accessibility audit with Lighthouse
npm run lighthouse

# Check for common issues
npm run a11y-check
```

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable

- [x] 1.1.1 Non-text Content (Level A)
- [x] 1.3.1 Info and Relationships (Level A)
- [x] 1.3.2 Meaningful Sequence (Level A)
- [x] 1.3.3 Sensory Characteristics (Level A)
- [x] 1.4.1 Use of Color (Level A)
- [x] 1.4.3 Contrast (Minimum) (Level AA)
- [x] 1.4.10 Reflow (Level AA)
- [x] 1.4.11 Non-text Contrast (Level AA)
- [x] 1.4.12 Text Spacing (Level AA)
- [x] 1.4.13 Content on Hover or Focus (Level AA)

### Operable

- [x] 2.1.1 Keyboard (Level A)
- [x] 2.1.2 No Keyboard Trap (Level A)
- [x] 2.1.4 Character Key Shortcuts (Level A)
- [x] 2.4.1 Bypass Blocks (Level A)
- [x] 2.4.2 Page Titled (Level A)
- [x] 2.4.3 Focus Order (Level A)
- [x] 2.4.4 Link Purpose (In Context) (Level A)
- [x] 2.4.5 Multiple Ways (Level AA)
- [x] 2.4.6 Headings and Labels (Level AA)
- [x] 2.4.7 Focus Visible (Level AA)
- [x] 2.5.1 Pointer Gestures (Level A)
- [x] 2.5.2 Pointer Cancellation (Level A)
- [x] 2.5.3 Label in Name (Level A)
- [x] 2.5.4 Motion Actuation (Level A)

### Understandable

- [x] 3.1.1 Language of Page (Level A)
- [x] 3.1.2 Language of Parts (Level AA)
- [x] 3.2.1 On Focus (Level A)
- [x] 3.2.2 On Input (Level A)
- [x] 3.2.3 Consistent Navigation (Level AA)
- [x] 3.2.4 Consistent Identification (Level AA)
- [x] 3.3.1 Error Identification (Level A)
- [x] 3.3.2 Labels or Instructions (Level A)
- [x] 3.3.3 Error Suggestion (Level AA)
- [x] 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA)

### Robust

- [x] 4.1.1 Parsing (Level A)
- [x] 4.1.2 Name, Role, Value (Level A)
- [x] 4.1.3 Status Messages (Level AA)

---

## Resources

### WCAG 2.1 Guidelines
- [WCAG 2.1 Official Documentation](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) - Free screen reader for Windows
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Commercial screen reader
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built-in macOS/iOS screen reader

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## Maintenance

### Adding New Features

When adding new features, ensure:

1. All interactive elements are keyboard accessible
2. Proper ARIA attributes are added
3. Screen reader announcements are implemented
4. Color contrast meets WCAG AA standards
5. Focus management is handled correctly
6. Semantic HTML is used
7. Forms have proper labels and validation

### Code Review Checklist

- [ ] Keyboard navigation tested
- [ ] ARIA attributes added where needed
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Semantic HTML used
- [ ] No accessibility regressions

---

## Support

For accessibility-related questions or issues, please:

1. Check this documentation
2. Review the WCAG 2.1 guidelines
3. Test with accessibility tools
4. Consult the development team

**Remember**: Accessibility is not a feature, it's a fundamental requirement!
