import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabaseClient';
import { VillageInfo } from '@/types';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/ui/Loading';

const sections: { key: keyof VillageInfo; mrKey: keyof VillageInfo; tKey: string }[] = [
  { key: 'introduction', mrKey: 'introduction_mr', tKey: 'about.introduction' },
  { key: 'history', mrKey: 'history_mr', tKey: 'about.history' },
  { key: 'geography', mrKey: 'geography_mr', tKey: 'about.geography' },
  { key: 'location', mrKey: 'location_mr', tKey: 'about.location' },
  { key: 'climate', mrKey: 'climate_mr', tKey: 'about.climate' },
  { key: 'population', mrKey: 'population_mr', tKey: 'about.population' },
  { key: 'economy', mrKey: 'economy_mr', tKey: 'about.economy' },
  { key: 'agriculture', mrKey: 'agriculture_mr', tKey: 'about.agriculture' },
  { key: 'culture', mrKey: 'culture_mr', tKey: 'about.culture' },
  { key: 'education', mrKey: 'education_mr', tKey: 'about.education' },
  { key: 'healthcare', mrKey: 'healthcare_mr', tKey: 'about.healthcare' },
  { key: 'transportation', mrKey: 'transportation_mr', tKey: 'about.transportation' },
  { key: 'tourist_places', mrKey: 'tourist_places_mr', tKey: 'about.touristPlaces' },
  { key: 'institutions', mrKey: 'institutions_mr', tKey: 'about.institutions' },
  { key: 'future_plans', mrKey: 'future_plans_mr', tKey: 'about.futurePlans' },
];

export default function AboutVillage() {
  const { t } = useTranslation();
  const lang = useLanguage();

  const { data: info, isLoading, isError } = useQuery<VillageInfo | null>({
    queryKey: ['village-info'],
    queryFn: async () => {
      const { data, error } = await supabase.from('village_info').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (isError) return <ErrorState message={t('common.error')} />;

  const hasData = info && sections.some((s) => pickField(info[s.key] as string, info[s.mrKey] as string, lang));

  return (
    <>
      <Helmet>
        <title>{t('about.title')} — {t('nav.panchayat')}</title>
        <meta name="description" content={t('about.subtitle')} />
      </Helmet>

      <div className="container-page py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="mb-3">{t('about.title')}</h1>
          <p className="text-primary-500 text-lg mb-10">{t('about.subtitle')}</p>

          {!hasData ? (
            <EmptyState message={t('about.noData')} />
          ) : (
            <div className="space-y-8">
              {sections.map((s) => {
                const content = pickField(info![s.key] as string, info![s.mrKey] as string, lang);
                if (!content) return null;
                return (
                  <section key={s.key} className="animate-fade-in">
                    <h2 className="text-xl font-semibold text-primary-900 mb-3 border-l-4 border-accent-saffron pl-4">
                      {t(s.tKey)}
                    </h2>
                    <div className="prose-panchayat pl-4">
                      <p className="text-primary-600 leading-relaxed whitespace-pre-wrap">{content}</p>
                    </div>
                  </section>
                );
              })}

              {info?.map_embed_url && (
                <section className="animate-fade-in">
                  <h2 className="text-xl font-semibold text-primary-900 mb-3 border-l-4 border-accent-saffron pl-4">
                    {t('about.map')}
                  </h2>
                  <div className="pl-4">
                    <div className="rounded-xl overflow-hidden shadow-card border border-primary-100">
                      <iframe
                        src={info.map_embed_url}
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        loading="lazy"
                        title="Village Map"
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
