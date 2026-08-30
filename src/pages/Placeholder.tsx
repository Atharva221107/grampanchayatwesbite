import { Helmet } from 'react-helmet-async';

interface PlaceholderProps {
  title: string;
  description?: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <>
      <Helmet>
        <title>{title} — Gram Panchayat</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      <div className="container-page py-20">
        <div className="max-w-2xl mx-auto text-center animate-slide-up">
          <h1 className="mb-4">{title}</h1>
          <p className="text-primary-500 text-lg">
            This page is under construction. Content will be connected to the database soon.
          </p>
        </div>
      </div>
    </>
  );
}
