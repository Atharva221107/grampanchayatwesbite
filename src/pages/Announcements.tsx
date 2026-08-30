import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Pin, Calendar, Paperclip } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Announcement, AnnouncementPriority } from '@/types';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import { Select } from '@/components/admin/FormField';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/Loading';

const priorityVariants: Record<AnnouncementPriority, 'saffron' | 'green' | 'red'> = {
  low: 'green', medium: 'saffron', high: 'red',
};

export default function Announcements() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');

  const { data: items = [], isLoading, isError } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = items.filter((a) => {
    const title = pickField(a.title, a.title_mr, lang) || '';
    const desc = pickField(a.description, a.description_mr, lang) || '';
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !priority || a.priority === priority;
    return matchSearch && matchPriority;
  });

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (isError) return <ErrorState message={t('common.error')} />;

  return (
    <>
      <Helmet>
        <title>{t('announcements.title')} — {t('nav.panchayat')}</title>
        <meta name="description" content={t('announcements.subtitle')} />
      </Helmet>

      <div className="container-page py-12">
        <h1 className="mb-3">{t('announcements.title')}</h1>
        <p className="text-primary-500 text-lg mb-8">{t('announcements.subtitle')}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <SearchBar value={search} onChange={setSearch} placeholder={t('announcements.search')} className="flex-1" />
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="sm:w-48">
            <option value="">{t('announcements.allPriorities')}</option>
            <option value="high">{t('announcements.priority.high')}</option>
            <option value="medium">{t('announcements.priority.medium')}</option>
            <option value="low">{t('announcements.priority.low')}</option>
          </Select>
        </div>

        {items.length === 0 ? (
          <EmptyState message={t('announcements.noAnnouncements')} />
        ) : filtered.length === 0 ? (
          <EmptyState message={t('announcements.noResults')} />
        ) : (
          <div className="space-y-4">
            {filtered.map((ann) => {
              const title = pickField(ann.title, ann.title_mr, lang);
              const desc = pickField(ann.description, ann.description_mr, lang);
              return (
                <Card key={ann.id} hover className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={priorityVariants[ann.priority]}>
                          {t(`announcements.priority.${ann.priority}`)}
                        </Badge>
                        {ann.is_pinned && (
                          <Badge variant="saffron">
                            <Pin size={10} /> {t('announcements.pinned')}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-2">{title}</h3>
                      {desc && <p className="text-sm text-primary-600 leading-relaxed whitespace-pre-wrap">{desc}</p>}

                      {ann.image_url && (
                        <img src={ann.image_url} alt={title || ''} className="mt-4 rounded-lg max-h-80 w-full object-cover" />
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        {ann.expiry_date && (
                          <span className="text-xs text-primary-400 flex items-center gap-1">
                            <Calendar size={12} /> {t('announcements.expiresOn')}: {ann.expiry_date}
                          </span>
                        )}
                        {ann.attachment_url && (
                          <a href={ann.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-saffron hover:underline flex items-center gap-1">
                            <Paperclip size={12} /> {t('announcements.downloadAttachment')}
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
