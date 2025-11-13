import React from 'react';

export const Card = ({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'gradient';
}) => {
  const variantStyles = {
    default: 'rounded-lg border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-border',
    elevated: 'surface-elevated rounded-lg transition-all duration-200 hover:shadow-lg',
    gradient: 'card-gradient transition-all duration-200 hover:shadow-lg',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`flex flex-col space-y-2 p-6 ${className}`}>{children}</div>;
};

export const CardTitle = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={`font-serif text-2xl font-bold leading-tight tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <p className={`text-sm text-muted-foreground leading-relaxed ${className}`}>{children}</p>;
};

export const CardContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
};

export const CardFooter = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
};
