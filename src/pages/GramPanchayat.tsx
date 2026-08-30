import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Sarpanch, PanchayatMember } from '@/types';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/ui/Loading';

export default function GramPanchayat() {
  const { t } = useTranslation();
  const lang = useLanguage();

  const { data: sarpanch, isLoading: sarpanchLoading } = useQuery<Sarpanch | null>({
    queryKey: ['sarpanch'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sarpanch')
        .select('*')
        .eq('is_current', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<PanchayatMember[]>({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('panchayat_members')
        .select('*')
        .eq('is_former', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = sarpanchLoading || membersLoading;

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;

  const committeeMembers = members.filter((m) => m.is_committee);
  const wardMembers = members.filter((m) => !m.is_committee);

  return (
    <>
      <Helmet>
        <title>{t('panchayat.title')} — {t('nav.panchayat')}</title>
        <meta name="description" content={t('panchayat.subtitle')} />
      </Helmet>

      <div className="container-page py-12">
        <h1 className="mb-3">{t('panchayat.title')}</h1>
        <p className="text-primary-500 text-lg mb-10">{t('panchayat.subtitle')}</p>

        {/* Sarpanch */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-primary-900 mb-6">{t('panchayat.sarpanch')}</h2>
          {!sarpanch ? (
            <EmptyState message={t('panchayat.noSarpanch')} />
          ) : (
            <Card className="overflow-hidden max-w-3xl">
              <div className="flex flex-col sm:flex-row">
                {sarpanch.photo_url && (
                  <div className="sm:w-48 shrink-0">
                    <img src={sarpanch.photo_url} alt={sarpanch.name} className="w-full h-full object-cover min-h-[200px]" />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <h3 className="text-lg font-semibold text-primary-900">{sarpanch.name}</h3>
                  <div className="space-y-2 mt-4">
                    {sarpanch.contact && <p className="flex items-center gap-2 text-sm text-primary-600"><Phone size={14} className="text-primary-400" /> {sarpanch.contact}</p>}
                    {sarpanch.email && <p className="flex items-center gap-2 text-sm text-primary-600"><Mail size={14} className="text-primary-400" /> {sarpanch.email}</p>}
                    {sarpanch.address && <p className="flex items-start gap-2 text-sm text-primary-600"><MapPin size={14} className="text-primary-400 mt-0.5" /> {sarpanch.address}</p>}
                    {(sarpanch.term_start || sarpanch.term_end) && (
                      <p className="flex items-center gap-2 text-sm text-primary-600">
                        <Calendar size={14} className="text-primary-400" />
                        {t('panchayat.term')}: {sarpanch.term_start || '—'} to {sarpanch.term_end || '—'}
                      </p>
                    )}
                  </div>
                  {pickField(sarpanch.message, sarpanch.message_mr, lang) && (
                    <div className="mt-4 pt-4 border-t border-primary-100">
                      <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-2">{t('panchayat.message')}</p>
                      <p className="text-sm text-primary-600 italic leading-relaxed whitespace-pre-wrap">
                        "{pickField(sarpanch.message, sarpanch.message_mr, lang)}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </section>

        {/* Ward Members */}
        {wardMembers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-primary-900 mb-6">{t('panchayat.members')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wardMembers.map((m) => (
                <Card key={m.id} className="p-5">
                  <div className="flex items-start gap-4">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-xl font-semibold text-primary-400">{m.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-medium text-primary-900">{m.name}</h4>
                      {m.designation && <p className="text-sm text-primary-500">{m.designation}</p>}
                      {m.ward_number && <p className="text-xs text-primary-400 mt-1">{t('panchayat.ward')}: {m.ward_number}</p>}
                    </div>
                  </div>
                  {(m.phone || m.email) && (
                    <div className="mt-3 pt-3 border-t border-primary-50 space-y-1">
                      {m.phone && <p className="flex items-center gap-2 text-xs text-primary-500"><Phone size={12} /> {m.phone}</p>}
                      {m.email && <p className="flex items-center gap-2 text-xs text-primary-500"><Mail size={12} /> {m.email}</p>}
                    </div>
                  )}
                  {pickField(m.responsibilities, m.responsibilities_mr, lang) && (
                    <p className="mt-3 text-sm text-primary-600 leading-relaxed">
                      {pickField(m.responsibilities, m.responsibilities_mr, lang)}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Committee Members */}
        {committeeMembers.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-primary-900 mb-6">{t('panchayat.committeeMembers')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {committeeMembers.map((m) => (
                <Card key={m.id} className="p-5">
                  <div className="flex items-start gap-4">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-xl font-semibold text-primary-400">{m.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-medium text-primary-900">{m.name}</h4>
                      {m.designation && <p className="text-sm text-primary-500">{m.designation}</p>}
                      <Badge variant="blue" className="mt-1">{t('panchayat.committeeMembers')}</Badge>
                    </div>
                  </div>
                  {(m.phone || m.email) && (
                    <div className="mt-3 pt-3 border-t border-primary-50 space-y-1">
                      {m.phone && <p className="flex items-center gap-2 text-xs text-primary-500"><Phone size={12} /> {m.phone}</p>}
                      {m.email && <p className="flex items-center gap-2 text-xs text-primary-500"><Mail size={12} /> {m.email}</p>}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {wardMembers.length === 0 && committeeMembers.length === 0 && !sarpanch && (
          <EmptyState message={t('panchayat.noMembers')} />
        )}
      </div>
    </>
  );
}
