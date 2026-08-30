import { useTranslation } from 'react-i18next';

type Lang = 'en' | 'mr';

export function useLanguage(): Lang {
  const { i18n } = useTranslation();
  return (i18n.language || 'en').startsWith('mr') ? 'mr' : 'en';
}

export function pickField(en: string | null | undefined, mr: string | null | undefined, lang: Lang): string | null {
  if (lang === 'mr' && mr && mr.trim()) return mr;
  return en ?? null;
}
