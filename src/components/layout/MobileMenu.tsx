import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { label: string; path: string }[];
}

export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-elevated animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-primary-100 shrink-0">
          <span className="font-semibold text-primary-900">{t('language.label')}</span>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-500 hover:bg-primary-100"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-accent-saffron bg-accent-saffron/5'
                    : 'text-primary-700 hover:bg-primary-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-primary-100 px-5 py-4 shrink-0">
          <NavLink
            to="/admin/login"
            className="text-xs text-primary-400 hover:text-primary-600 transition-colors"
          >
            {t('footer.adminLogin')}
          </NavLink>
        </div>
      </div>
    </div>
  );
}
