import { ReactNode, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { FullPageLoader } from '@/components/ui/Loading';

interface PageWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function PageWrapper({ title, description, children }: PageWrapperProps) {
  return (
    <>
      <Helmet>
        <title>{title} — Gram Panchayat</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      <Suspense fallback={<FullPageLoader />}>{children}</Suspense>
    </>
  );
}
