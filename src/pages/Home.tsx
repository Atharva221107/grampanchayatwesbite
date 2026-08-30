import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Megaphone, FileText, Users, Image, MapPin, Phone, Pin, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabaseClient';
import { SiteSettings, Announcement, Scheme } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/Loading';

const priorityVariants: Record<string, 'saffron' | 'green' | 'red'> = {
  low: 'green', medium: 'saffron', high: 'red',
};

export default function Home() {
  const { t } = useTranslation();
  const lang = useLanguage();

  const { data: settings } = useQuery<SiteSettings | null>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: announcements = [], isLoading: annLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements', 'home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: schemes = [] } = useQuery<Scheme[]>({
    queryKey: ['schemes', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schemes')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
  });

  const stats = [
    { label: t('stats.population'), value: settings?.stat_population || '—' },
    { label: t('stats.wards'), value: settings?.stat_wards || '—' },
    { label: t('stats.schools'), value: settings?.stat_schools || '—' },
    { label: t('stats.area'), value: settings?.stat_area || '—' },
  ];

  const quickAccess = [
    { icon: Megaphone, label: t('nav.announcements'), desc: t('home.quickAccessDesc'), path: '/announcements' },
    { icon: FileText, label: t('nav.notices'), desc: t('home.noticesDesc'), path: '/notices' },
    { icon: Users, label: t('nav.panchayat'), desc: t('home.panchayatDesc'), path: '/panchayat' },
    { icon: Image, label: t('nav.gallery'), desc: t('home.galleryDesc'), path: '/gallery' },
    { icon: MapPin, label: t('nav.about'), desc: t('home.aboutDesc'), path: '/about' },
    { icon: Phone, label: t('nav.contact'), desc: t('home.contactDesc'), path: '/contact' },
  ];

  const banner = settings?.homepage_banner_url;

  return (
    <>
      <Helmet>
        <title>{t('nav.panchayat')} — {t('nav.home') === 'मुख्यपृष्ठ' ? 'माहिती पोर्टल' : 'Information Portal'}</title>
        <meta name="description" content={t('home.subtitle')} />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-primary-900 text-white overflow-hidden">
        {banner && (
          <div className="absolute inset-0">
            <img src={banner} alt="" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/90 via-primary-900/95 to-primary-950" />
        <div className="relative container-page py-20 md:py-28">
          <div className="max-w-3xl animate-slide-up">
            <Badge variant="saffron" className="mb-4">{t('home.badge')}</Badge>
            <h1 className="text-white mb-4">{t('home.title')}</h1>
            <p className="text-lg md:text-xl text-primary-200 leading-relaxed mb-8 max-w-2xl">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/about" className="inline-flex items-center gap-2 bg-accent-saffron text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-saffron/90 transition-colors">
                {t('home.explore')} <ArrowRight size={18} />
              </Link>
              <Link to="/schemes" className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20">
                {t('home.viewSchemes')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container-page -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5 text-center">
              <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
              <p className="text-sm text-primary-500 mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="container-page py-12">
        <h2 className="mb-6">{t('home.quickAccess')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAccess.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card hover className="p-5 h-full">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 shrink-0">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-primary-900 font-medium">{item.label}</h4>
                    <p className="text-sm text-primary-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="container-page pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2>{t('home.latestAnnouncements')}</h2>
          <Link to="/announcements" className="text-sm text-accent-saffron hover:underline flex items-center gap-1">
            {t('home.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        {annLoading ? (
          <LoadingSpinner size={24} className="py-8" />
        ) : announcements.length === 0 ? (
          <EmptyState message={t('home.noAnnouncements')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <Card key={ann.id} hover className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={priorityVariants[ann.priority]}>{t(`announcements.priority.${ann.priority}`)}</Badge>
                  {ann.is_pinned && <Badge variant="saffron"><Pin size={10} /> {t('announcements.pinned')}</Badge>}
                </div>
                <h4 className="font-medium text-primary-900 mb-2">{pickField(ann.title, ann.title_mr, lang)}</h4>
                <p className="text-sm text-primary-500 line-clamp-2">
                  {pickField(ann.description, ann.description_mr, lang) || ''}
                </p>
                {ann.expiry_date && (
                  <p className="text-xs text-primary-400 mt-3 flex items-center gap-1">
                    <Calendar size={12} /> {t('announcements.expiresOn')}: {ann.expiry_date}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Featured Schemes */}
      {schemes.length > 0 && (
        <section className="container-page pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2>{t('home.featuredSchemes')}</h2>
            <Link to="/schemes" className="text-sm text-accent-saffron hover:underline flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schemes.map((scheme) => (
              <Link key={scheme.id} to="/schemes">
                <Card hover className="p-5 h-full">
                  <Badge variant="saffron" className="mb-3">{t('schemes.featured')}</Badge>
                  <h4 className="font-medium text-primary-900 mb-2">{pickField(scheme.name, scheme.name_mr, lang)}</h4>
                  <p className="text-sm text-primary-500 line-clamp-3">
                    {pickField(scheme.description, scheme.description_mr, lang) || ''}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
