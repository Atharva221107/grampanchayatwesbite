import { ReactNode } from 'react';

type BadgeVariant = 'saffron' | 'green' | 'blue' | 'gray' | 'red';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  saffron: 'bg-accent-saffron/10 text-accent-saffron border-accent-saffron/20',
  green: 'bg-success-50 text-success-600 border-success-100',
  blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  gray: 'bg-primary-100 text-primary-600 border-primary-200',
  red: 'bg-error-50 text-error-600 border-error-100',
};

export default function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
