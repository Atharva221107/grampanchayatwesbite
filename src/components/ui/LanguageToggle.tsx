import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language || 'en';

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    setOpen(false);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-primary-600 hover:bg-primary-100 hover:text-primary-900 transition-colors text-sm font-medium"
        aria-label="Change language"
      >
        <Globe size={18} />
        <span className="hidden sm:inline">{currentLang === 'mr' ? 'मराठी' : 'EN'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-elevated border border-primary-100 py-1 animate-fade-in z-50">
          <button
            onClick={() => changeLanguage('en')}
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <span>English</span>
            {currentLang === 'en' && <Check size={16} className="text-accent-saffron" />}
          </button>
          <button
            onClick={() => changeLanguage('mr')}
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
          >
            <span>मराठी</span>
            {currentLang === 'mr' && <Check size={16} className="text-accent-saffron" />}
          </button>
        </div>
      )}
    </div>
  );
}
