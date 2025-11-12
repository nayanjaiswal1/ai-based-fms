import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themeOrder = ['light', 'system', 'dark'] as const;
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = theme === 'light' ? 'Light mode' : theme === 'dark' ? 'Dark mode' : 'System theme';

  return (
    <button
      onClick={cycleTheme}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      aria-label={`Current theme: ${label}. Click to switch`}
      aria-live="polite"
      title={label}
      type="button"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
