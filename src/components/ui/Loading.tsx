import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = 24, className = '', label }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary-400" />
      {label && <span className="text-sm text-primary-500">{label}</span>}
    </div>
  );
}

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-primary-500">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  children?: ReactNode;
}

export function ErrorState({ message = 'Something went wrong.', children }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
      <p className="text-primary-600">{message}</p>
      {children}
    </div>
  );
}

export function EmptyState({ message = 'No data available yet.', children }: { message?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 text-center">
      <p className="text-primary-400">{message}</p>
      {children}
    </div>
  );
}
