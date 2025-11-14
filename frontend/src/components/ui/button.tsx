import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group';

    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow-sm active:scale-95',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-glow-sm active:scale-95',
      outline: 'border-2 border-primary/30 text-primary hover:border-primary hover:bg-primary/10 hover:shadow-sm active:scale-95',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm active:scale-95',
      ghost: 'hover:bg-accent/20 hover:text-accent active:scale-95',
      link: 'underline-offset-4 hover:underline text-primary hover:text-primary/80',
      gradient: 'bg-gradient-primary text-primary-foreground hover:shadow-glow-md active:scale-95 before:absolute before:inset-0 before:bg-white/20 before:translate-y-full before:transition-transform before:duration-300 before:pointer-events-none hover:before:translate-y-0',
    };

    const sizeStyles = {
      default: 'h-10 py-2 px-5',
      sm: 'h-9 px-3 text-sm rounded-md',
      lg: 'h-12 px-8 text-base rounded-lg font-semibold',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
