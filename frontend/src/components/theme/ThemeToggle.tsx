import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium
            transition-colors duration-200
            ${
              theme === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          `}
          aria-label={`Switch to ${label} theme`}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
