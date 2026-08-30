import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FileText, Image as ImageIcon, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Notice } from '@/types';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import { Select } from '@/components/admin/FormField';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/Loading';

export default function ImportantNotices() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: items = [], isLoading, isError } = useQuery<Notice[]>({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const categories = [...new Set(items.map((n) => n.category).filter(Boolean))] as string[];

  const filtered = items.filter((n) => {
    const title = pickField(n.title, n.title_mr, lang) || '';
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || n.category === category;
    return matchSearch && matchCategory;
  });

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (isError) return <ErrorState message={t('common.error')} />;

  return (
    <>
      <Helmet>
        <title>{t('notices.title')} — {t('nav.panchayat')}</title>
        <meta name="description" content={t('notices.subtitle')} />
      </Helmet>

      <div className="container-page py-12">
        <h1 className="mb-3">{t('notices.title')}</h1>
        <p className="text-primary-500 text-lg mb-8">{t('notices.subtitle')}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <SearchBar value={search} onChange={setSearch} placeholder={t('notices.search')} className="flex-1" />
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
            <option value="">{t('notices.allCategories')}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        {items.length === 0 ? (
          <EmptyState message={t('notices.noNotices')} />
        ) : filtered.length === 0 ? (
          <EmptyState message={t('notices.noResults')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((notice) => {
              const title = pickField(notice.title, notice.title_mr, lang);
              const desc = pickField(notice.description, notice.description_mr, lang);
              return (
                <Card key={notice.id} hover className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg shrink-0 ${
                      notice.file_type === 'pdf' ? 'bg-error-50 text-error-600' : 'bg-accent-blue/10 text-accent-blue'
                    }`}>
                      {notice.file_type === 'pdf' ? <FileText size={24} /> : <ImageIcon size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-primary-900">{title}</h4>
                      {notice.category && <Badge variant="gray" className="mt-1">{notice.category}</Badge>}
                      {desc && <p className="text-sm text-primary-500 mt-2 line-clamp-2">{desc}</p>}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-primary-400">
                          {new Date(notice.created_at).toLocaleDateString()}
                        </span>
                        {notice.file_url && (
                          <a href={notice.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-saffron hover:underline flex items-center gap-1">
                            <Download size={12} /> {t('notices.download')}
                          </a>
                        )}
                      </div>
                    </div>
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
