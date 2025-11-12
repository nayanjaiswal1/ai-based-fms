/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      // Screen reader only utility
      screens: {
        'sr-only': {
          raw: '(prefers-reduced-motion: reduce)',
        },
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // RTL support plugin
    function ({ addUtilities }) {
      const rtlUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
      };

      // Logical properties for RTL support
      const logicalUtilities = {
        // Margin
        '.ms-auto': {
          'margin-inline-start': 'auto',
        },
        '.me-auto': {
          'margin-inline-end': 'auto',
        },
        '.ms-0': {
          'margin-inline-start': '0',
        },
        '.me-0': {
          'margin-inline-end': '0',
        },
        '.ms-1': {
          'margin-inline-start': '0.25rem',
        },
        '.me-1': {
          'margin-inline-end': '0.25rem',
        },
        '.ms-2': {
          'margin-inline-start': '0.5rem',
        },
        '.me-2': {
          'margin-inline-end': '0.5rem',
        },
        '.ms-3': {
          'margin-inline-start': '0.75rem',
        },
        '.me-3': {
          'margin-inline-end': '0.75rem',
        },
        '.ms-4': {
          'margin-inline-start': '1rem',
        },
        '.me-4': {
          'margin-inline-end': '1rem',
        },
        '.ms-6': {
          'margin-inline-start': '1.5rem',
        },
        '.me-6': {
          'margin-inline-end': '1.5rem',
        },
        '.ms-8': {
          'margin-inline-start': '2rem',
        },
        '.me-8': {
          'margin-inline-end': '2rem',
        },
        // Padding
        '.ps-0': {
          'padding-inline-start': '0',
        },
        '.pe-0': {
          'padding-inline-end': '0',
        },
        '.ps-1': {
          'padding-inline-start': '0.25rem',
        },
        '.pe-1': {
          'padding-inline-end': '0.25rem',
        },
        '.ps-2': {
          'padding-inline-start': '0.5rem',
        },
        '.pe-2': {
          'padding-inline-end': '0.5rem',
        },
        '.ps-3': {
          'padding-inline-start': '0.75rem',
        },
        '.pe-3': {
          'padding-inline-end': '0.75rem',
        },
        '.ps-4': {
          'padding-inline-start': '1rem',
        },
        '.pe-4': {
          'padding-inline-end': '1rem',
        },
        '.ps-6': {
          'padding-inline-start': '1.5rem',
        },
        '.pe-6': {
          'padding-inline-end': '1.5rem',
        },
        '.ps-8': {
          'padding-inline-start': '2rem',
        },
        '.pe-8': {
          'padding-inline-end': '2rem',
        },
        // Border
        '.border-s': {
          'border-inline-start-width': '1px',
        },
        '.border-e': {
          'border-inline-end-width': '1px',
        },
        '.border-s-0': {
          'border-inline-start-width': '0',
        },
        '.border-e-0': {
          'border-inline-end-width': '0',
        },
        // Rounded
        '.rounded-s': {
          'border-start-start-radius': '0.25rem',
          'border-end-start-radius': '0.25rem',
        },
        '.rounded-e': {
          'border-start-end-radius': '0.25rem',
          'border-end-end-radius': '0.25rem',
        },
        '.rounded-s-none': {
          'border-start-start-radius': '0',
          'border-end-start-radius': '0',
        },
        '.rounded-e-none': {
          'border-start-end-radius': '0',
          'border-end-end-radius': '0',
        },
        // Text align
        '.text-start': {
          'text-align': 'start',
        },
        '.text-end': {
          'text-align': 'end',
        },
        // Inset
        '.inset-inline-start-0': {
          'inset-inline-start': '0',
        },
        '.inset-inline-end-0': {
          'inset-inline-end': '0',
        },
        '.start-0': {
          'inset-inline-start': '0',
        },
        '.end-0': {
          'inset-inline-end': '0',
        },
      };

      addUtilities({ ...rtlUtilities, ...logicalUtilities });
    },
    // Accessibility utilities plugin
    function ({ addUtilities, addComponents }) {
      // Screen reader only utilities
      const srOnlyUtilities = {
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
        '.not-sr-only': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: '0',
          margin: '0',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
      };

      // Focus visible utilities (better than default focus)
      const focusUtilities = {
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--ring))',
            outlineOffset: '2px',
          },
        },
        '.focus-visible-ring-inset': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--ring))',
            outlineOffset: '-2px',
          },
        },
      };

      // Skip link utilities
      const skipLinkUtilities = {
        '.skip-link': {
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: '9999',
            width: 'auto',
            height: 'auto',
            padding: '0.5rem 1rem',
            overflow: 'visible',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          },
        },
      };

      // High contrast mode support
      const highContrastUtilities = {
        '@media (prefers-contrast: high)': {
          '.high-contrast\\:border-current': {
            borderColor: 'currentColor',
          },
          '.high-contrast\\:outline': {
            outline: '2px solid currentColor',
          },
        },
      };

      // Reduced motion support
      const reducedMotionUtilities = {
        '@media (prefers-reduced-motion: reduce)': {
          '.motion-safe\\:animate-none': {
            animation: 'none !important',
          },
          '.motion-safe\\:transition-none': {
            transition: 'none !important',
          },
        },
      };

      addUtilities({
        ...srOnlyUtilities,
        ...focusUtilities,
        ...skipLinkUtilities,
        ...highContrastUtilities,
        ...reducedMotionUtilities,
      });

      // Accessible button component
      const accessibleComponents = {
        '.btn-accessible': {
          minWidth: '44px',
          minHeight: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '500',
          transition: 'all 0.2s',
          '&:focus-visible': {
            outline: '2px solid hsl(var(--ring))',
            outlineOffset: '2px',
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
      };

      addComponents(accessibleComponents);
    },
  ],
};
