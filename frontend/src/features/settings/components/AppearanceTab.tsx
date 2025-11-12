import ThemeToggle from '@/components/theme/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function AppearanceTab() {
  const { theme, actualTheme } = useTheme();

  const themeDescriptions = {
    light: 'Always use light theme regardless of system settings',
    dark: 'Always use dark theme regardless of system settings',
    system: 'Automatically switch between light and dark based on your system preferences',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Theme Preference</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how the application looks to you. Select a single theme, or sync with your system and automatically switch between day and night themes.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-3 block text-sm font-medium text-foreground">
            Select Theme
          </label>
          <ThemeToggle />
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            {theme === 'light' && <Sun className="h-5 w-5 text-primary mt-0.5" />}
            {theme === 'dark' && <Moon className="h-5 w-5 text-primary mt-0.5" />}
            {theme === 'system' && <Monitor className="h-5 w-5 text-primary mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Current: {theme.charAt(0).toUpperCase() + theme.slice(1)} theme
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {themeDescriptions[theme]}
              </p>
              {theme === 'system' && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Currently displaying: <span className="font-medium text-foreground">{actualTheme}</span> mode
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Preview</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary"></div>
            <div className="flex-1">
              <div className="h-3 w-24 rounded bg-foreground"></div>
              <div className="mt-2 h-2 w-32 rounded bg-muted-foreground"></div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="h-2 w-full rounded bg-muted-foreground"></div>
            <div className="mt-2 h-2 w-3/4 rounded bg-muted-foreground"></div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Your theme preference is saved locally and will persist across sessions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>System theme automatically adjusts based on your operating system's dark mode setting</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>You can also toggle the theme quickly using the button in the top navigation bar</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
