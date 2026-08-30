import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.panchayat'), path: '/panchayat' },
    { label: t('nav.schemes'), path: '/schemes' },
    { label: t('nav.announcements'), path: '/announcements' },
    { label: t('nav.notices'), path: '/notices' },
    { label: t('nav.gallery'), path: '/gallery' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  return (
    <footer className="bg-primary-900 text-primary-300 mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                <Building2 size={20} />
              </div>
              <div>
                <span className="block text-sm font-semibold leading-tight text-white">
                  {t('nav.panchayat')}
                </span>
                <span className="block text-xs text-primary-400 leading-tight">
                  {t('language.marathi') === 'मराठी' ? 'Information Portal' : 'Information Portal'}
                </span>
              </div>
            </div>
            <p className="text-sm text-primary-400 leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.quickLinks')}</h4>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-400 hover:text-accent-saffron transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer.officeContact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary-500" />
                <span className="text-primary-400">Gram Panchayat Office, Village, District, State</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-primary-500" />
                <span className="text-primary-400">+91 00000 00000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-primary-500" />
                <span className="text-primary-400">grampanchayat@example.gov.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-primary-500" />
                <span className="text-primary-400">Mon–Sat, 9:00 AM – 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-500">
            &copy; {new Date().getFullYear()} Gram Panchayat. {t('footer.copyright')}
          </p>
          <Link
            to="/admin/login"
            className="text-xs text-primary-500 hover:text-accent-saffron transition-colors"
          >
            {t('footer.adminLogin')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
