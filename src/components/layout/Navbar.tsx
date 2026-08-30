import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MobileMenu from './MobileMenu';
import LanguageToggle from '@/components/ui/LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.panchayat'), path: '/panchayat' },
    { label: t('nav.schemes'), path: '/schemes' },
    { label: t('nav.announcements'), path: '/announcements' },
    { label: t('nav.notices'), path: '/notices' },
    { label: t('nav.gallery'), path: '/gallery' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft border-b border-primary-100'
            : 'bg-white border-b border-primary-100'
        }`}
      >
        <div className="container-page">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-900 text-white">
                <Building2 size={20} />
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-semibold leading-tight text-primary-900">
                  {t('nav.panchayat')}
                </span>
                <span className="block text-xs text-primary-500 leading-tight">
                  {t('nav.home') === 'मुख्यपृष्ठ' ? 'माहिती पोर्टल' : 'Information Portal'}
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-accent-saffron bg-accent-saffron/5'
                        : 'text-primary-600 hover:text-primary-900 hover:bg-primary-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <LanguageToggle />
              <Link
                to="/search"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-500 hover:bg-primary-100 hover:text-primary-900 transition-colors"
                aria-label={t('nav.search')}
              >
                <Search size={20} />
              </Link>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-primary-700 hover:bg-primary-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </>
  );
}
