# Dropdown Menu Component

An enhanced dropdown menu component built on **Radix UI** with full accessibility support, keyboard navigation, and smooth animations.

## Features

✅ **Full Accessibility** - ARIA compliant, keyboard navigation, screen reader support
✅ **Smart Positioning** - Auto-flips when near viewport edges
✅ **Nested Menus** - Support for submenus
✅ **Checkboxes & Radio** - Built-in checkbox and radio group support
✅ **Keyboard Shortcuts** - Display shortcuts in menu items
✅ **Animations** - Smooth enter/exit animations
✅ **Portal Rendering** - Renders in document body to avoid z-index issues

## Installation

The component is already installed and ready to use! It uses:
- `@radix-ui/react-dropdown-menu` (already installed)
- `lucide-react` for icons (already installed)

## Basic Usage

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

function MyComponent() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log('Edit')}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Delete')}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Components

### DropdownMenu
Root component that manages the dropdown state.

### DropdownMenuTrigger
The button that opens the dropdown. Use `asChild` to pass a custom button.

```tsx
<DropdownMenuTrigger asChild>
  <Button>Open Menu</Button>
</DropdownMenuTrigger>
```

### DropdownMenuContent
The container for menu items.

**Props:**
- `align`: `"start" | "center" | "end"` (default: `"center"`)
- `sideOffset`: Number of pixels from trigger (default: `4`)

```tsx
<DropdownMenuContent align="end" sideOffset={8}>
  {/* Menu items */}
</DropdownMenuContent>
```

### DropdownMenuItem
A menu item. Can have onClick handler.

```tsx
<DropdownMenuItem onClick={() => doSomething()}>
  <Icon className="mr-2 h-4 w-4" />
  <span>Label</span>
  <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
</DropdownMenuItem>
```

**Props:**
- `disabled`: Boolean to disable the item
- `inset`: Add left padding for alignment with checkboxes

### DropdownMenuCheckboxItem
Menu item with a checkbox.

```tsx
<DropdownMenuCheckboxItem
  checked={isChecked}
  onCheckedChange={setIsChecked}
>
  Show sidebar
</DropdownMenuCheckboxItem>
```

### DropdownMenuRadioGroup & DropdownMenuRadioItem
Radio button group for mutually exclusive options.

```tsx
<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
  <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
</DropdownMenuRadioGroup>
```

### DropdownMenuSub
For nested submenus.

```tsx
<DropdownMenuSub>
  <DropdownMenuSubTrigger>
    <Plus className="mr-2 h-4 w-4" />
    <span>More options</span>
  </DropdownMenuSubTrigger>
  <DropdownMenuSubContent>
    <DropdownMenuItem>Submenu item 1</DropdownMenuItem>
    <DropdownMenuItem>Submenu item 2</DropdownMenuItem>
  </DropdownMenuSubContent>
</DropdownMenuSub>
```

### DropdownMenuLabel
Non-interactive label for grouping.

```tsx
<DropdownMenuLabel>My Account</DropdownMenuLabel>
```

### DropdownMenuSeparator
Visual separator line.

```tsx
<DropdownMenuSeparator />
```

### DropdownMenuShortcut
Display keyboard shortcut hint.

```tsx
<DropdownMenuItem>
  <span>Copy</span>
  <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
</DropdownMenuItem>
```

### DropdownMenuGroup
Group related items (optional, for semantic HTML).

```tsx
<DropdownMenuGroup>
  <DropdownMenuItem>Profile</DropdownMenuItem>
  <DropdownMenuItem>Settings</DropdownMenuItem>
</DropdownMenuGroup>
```

## Complete Examples

### 1. Actions Menu (Three Dots)

```tsx
import { MoreVertical, Edit, Copy, Trash } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Copy className="mr-2 h-4 w-4" />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-red-600">
      <Trash className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 2. User Account Menu

```tsx
import { User, Settings, LogOut } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      My Account
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      Profile
      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      Settings
      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 3. Filter Menu with Checkboxes

```tsx
const [showCompleted, setShowCompleted] = useState(true);
const [showArchived, setShowArchived] = useState(false);

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      Filter
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>Display</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuCheckboxItem
      checked={showCompleted}
      onCheckedChange={setShowCompleted}
    >
      Show completed
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem
      checked={showArchived}
      onCheckedChange={setShowArchived}
    >
      Show archived
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 4. Sort Menu with Radio

```tsx
const [sortBy, setSortBy] = useState('date');

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      Sort by
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
      <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

### 5. Nested Menu

```tsx
import { Plus, Mail, MessageSquare } from 'lucide-react';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Plus className="mr-2 h-4 w-4" />
        Invite users
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>
          <Mail className="mr-2 h-4 w-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>
```

## Keyboard Navigation

- **Space/Enter** - Open dropdown when focused on trigger
- **Arrow Down/Up** - Navigate menu items
- **Escape** - Close dropdown
- **Right Arrow** - Open submenu (when available)
- **Left Arrow** - Close submenu
- **Home/End** - Jump to first/last item

## Accessibility

The component is fully accessible:
- ✅ ARIA roles and attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader announcements
- ✅ WCAG 2.1 AA compliant

## Styling

The component uses Tailwind CSS classes and respects your theme colors:
- `bg-popover` - Background color
- `text-popover-foreground` - Text color
- `border` - Border color
- `accent` - Hover/focus background

You can customize by passing `className` prop:

```tsx
<DropdownMenuContent className="w-64 bg-slate-900 text-white">
  {/* Custom styled content */}
</DropdownMenuContent>
```

## Tips

1. **Always use `asChild` with trigger**: This prevents nested button issues
   ```tsx
   <DropdownMenuTrigger asChild>
     <Button>...</Button>
   </DropdownMenuTrigger>
   ```

2. **Set width for better alignment**: Use `className="w-56"` or similar
   ```tsx
   <DropdownMenuContent className="w-56">
   ```

3. **Use align for positioning**:
   ```tsx
   <DropdownMenuContent align="end"> {/* Aligns to right */}
   ```

4. **Combine with icons**: Icons make menus more scannable
   ```tsx
   <DropdownMenuItem>
     <Icon className="mr-2 h-4 w-4" />
     Label
   </DropdownMenuItem>
   ```

## Migration from Old Component

If you were using the old dropdown menu, update your code:

**Old:**
```tsx
// Old implementation was basic and custom
```

**New:**
```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

// Same API but with more features!
```

The API is similar, but now you get:
- Better accessibility
- Keyboard navigation
- Checkboxes & radio buttons
- Nested menus
- Keyboard shortcuts
- Better positioning

## See Also

- [Radix UI Dropdown Menu Docs](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
- `dropdown-menu-example.tsx` - Working examples in your codebase
