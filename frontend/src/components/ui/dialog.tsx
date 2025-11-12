import React from 'react';

export const Dialog = ({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return <div>{open && children}</div>;
};

export const DialogTrigger = ({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  return <>{children}</>;
};

export const DialogContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}>{children}</div>;
};

export const DialogFooter = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`}>
      {children}
    </div>
  );
};

export const DialogTitle = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
};

export const DialogDescription = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
};
