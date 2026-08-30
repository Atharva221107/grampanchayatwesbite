import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export default function Card({ children, hover = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-card border border-primary-100 overflow-hidden ${hover ? 'transition-all duration-200 hover:shadow-elevated hover:border-primary-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
