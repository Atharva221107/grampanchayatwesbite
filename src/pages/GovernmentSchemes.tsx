import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Phone, FileText, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Scheme } from '@/types';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import { Select } from '@/components/admin/FormField';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/Loading';

export default function GovernmentSchemes() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const { data: schemes = [], isLoading, isError } = useQuery<Scheme[]>({
    queryKey: ['schemes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schemes').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const categories = [...new Set(schemes.map((s) => s.category).filter(Boolean))] as string[];

  const filtered = schemes.filter((s) => {
    const name = pickField(s.name, s.name_mr, lang) || '';
    const desc = pickField(s.description, s.description_mr, lang) || '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || s.category === category;
    const matchStatus = !status || s.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (isError) return <ErrorState message={t('common.error')} />;

  return (
    <>
      <Helmet>
        <title>{t('schemes.title')} — {t('nav.panchayat')}</title>
        <meta name="description" content={t('schemes.subtitle')} />
      </Helmet>

      <div className="container-page py-12">
        <h1 className="mb-3">{t('schemes.title')}</h1>
        <p className="text-primary-500 text-lg mb-8">{t('schemes.subtitle')}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <SearchBar value={search} onChange={setSearch} placeholder={t('schemes.search')} className="flex-1" />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
            <option value="">{t('schemes.allCategories')}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40">
            <option value="">{t('schemes.allStatuses')}</option>
            <option value="active">{t('schemes.active')}</option>
            <option value="closed">{t('schemes.closed')}</option>
          </Select>
        </div>

        {schemes.length === 0 ? (
          <EmptyState message={t('schemes.noSchemesAtAll')} />
        ) : filtered.length === 0 ? (
          <EmptyState message={t('schemes.noSchemes')} />
        ) : (
          <div className="space-y-4">
            {filtered.map((scheme) => {
              const name = pickField(scheme.name, scheme.name_mr, lang);
              const desc = pickField(scheme.description, scheme.description_mr, lang);
              const benefits = pickField(scheme.benefits, scheme.benefits_mr, lang);
              const eligibility = pickField(scheme.eligibility, scheme.eligibility_mr, lang);

              return (
                <Card key={scheme.id} hover className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900">{name}</h3>
                      {scheme.category && <Badge variant="gray" className="mt-1">{scheme.category}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {scheme.featured && <Star size={16} className="text-accent-saffron fill-accent-saffron" />}
                      <Badge variant={scheme.status === 'active' ? 'green' : 'gray'}>
                        {scheme.status === 'active' ? t('schemes.active') : t('schemes.closed')}
                      </Badge>
                    </div>
                  </div>

                  {desc && <p className="text-sm text-primary-600 leading-relaxed mb-4">{desc}</p>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits && (
                      <div>
                        <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-1">{t('schemes.benefits')}</p>
                        <p className="text-sm text-primary-600 whitespace-pre-wrap">{benefits}</p>
                      </div>
                    )}
                    {eligibility && (
                      <div>
                        <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-1">{t('schemes.eligibility')}</p>
                        <p className="text-sm text-primary-600 whitespace-pre-wrap">{eligibility}</p>
                      </div>
                    )}
                  </div>

                  {(scheme.documents_required || scheme.application_process || scheme.important_dates) && (
                    <div className="mt-4 pt-4 border-t border-primary-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scheme.documents_required && (
                        <div>
                          <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-1">{t('schemes.documentsRequired')}</p>
                          <p className="text-sm text-primary-600 whitespace-pre-wrap">{scheme.documents_required}</p>
                        </div>
                      )}
                      {scheme.application_process && (
                        <div>
                          <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-1">{t('schemes.applicationProcess')}</p>
                          <p className="text-sm text-primary-600 whitespace-pre-wrap">{scheme.application_process}</p>
                        </div>
                      )}
                      {scheme.important_dates && (
                        <div>
                          <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-1">{t('schemes.importantDates')}</p>
                          <p className="text-sm text-primary-600 whitespace-pre-wrap">{scheme.important_dates}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-primary-50 flex flex-wrap items-center gap-4">
                    {scheme.official_link && (
                      <a href={scheme.official_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent-saffron hover:underline">
                        <ExternalLink size={14} /> {t('schemes.officialLink')}
                      </a>
                    )}
                    {scheme.helpline && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-primary-500">
                        <Phone size={14} /> {t('schemes.helpline')}: {scheme.helpline}
                      </span>
                    )}
                    {scheme.pdf_url && (
                      <a href={scheme.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-error-500 hover:underline">
                        <FileText size={14} /> {t('schemes.downloadPdf')}
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
