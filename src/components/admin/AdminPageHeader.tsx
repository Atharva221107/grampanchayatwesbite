import { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <>
      <Helmet>
        <title>{title} — Admin</title>
      </Helmet>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary-900">{title}</h1>
          {description && <p className="text-sm text-primary-500 mt-1">{description}</p>}
        </div>
        {action}
      </div>
    </>
  );
}
