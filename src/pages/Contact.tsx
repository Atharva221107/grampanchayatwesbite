import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Calendar, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { SiteSettings } from '@/types';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FormField, TextInput, TextArea } from '@/components/admin/FormField';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, ErrorState } from '@/components/ui/Loading';

export default function Contact() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: settings, isLoading, isError } = useQuery<SiteSettings | null>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t('contact.name') + ' is required';
    if (!form.email.trim()) e.email = t('contact.emailLabel') + ' is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.message.trim()) e.message = t('contact.message') + ' is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.from('contact_submissions').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message,
    });
    setSubmitting(false);
    if (error) {
      toast(t('contact.error'), 'error');
      return;
    }
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    toast(t('contact.success'), 'success');
  };

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (isError) return <ErrorState message={t('common.error')} />;

  const contactItems = [
    { icon: MapPin, label: t('contact.officeAddress'), value: pickField(settings?.office_address, settings?.office_address_mr, lang) },
    { icon: Phone, label: t('contact.phone'), value: settings?.phone },
    { icon: Mail, label: t('contact.email'), value: settings?.email },
    { icon: Clock, label: t('contact.workingDays'), value: pickField(settings?.working_days, settings?.working_days_mr, lang) },
    { icon: Clock, label: t('contact.lunchBreak'), value: pickField(settings?.lunch_break, settings?.lunch_break_mr, lang) },
    { icon: Calendar, label: t('contact.publicHolidays'), value: pickField(settings?.public_holidays, settings?.public_holidays_mr, lang) },
  ].filter((item) => item.value);

  return (
    <>
      <Helmet>
        <title>{t('contact.title')} — {t('nav.panchayat')}</title>
        <meta name="description" content={t('contact.subtitle')} />
      </Helmet>

      <div className="container-page py-12">
        <h1 className="mb-3">{t('contact.title')}</h1>
        <p className="text-primary-500 text-lg mb-10">{t('contact.subtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {contactItems.map((item, idx) => (
              <Card key={idx} className="p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm text-primary-700 mt-1 whitespace-pre-wrap">{item.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Inquiry Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">{t('contact.inquiryForm')}</h3>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 size={48} className="text-success-600 mb-4" />
                <p className="text-primary-600">{t('contact.success')}</p>
                <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                  {t('contact.submit')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label={t('contact.name')} required error={errors.name}>
                  <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} placeholder={t('contact.namePlaceholder')} />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label={t('contact.emailLabel')} required error={errors.email}>
                    <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={!!errors.email} placeholder={t('contact.emailPlaceholder')} />
                  </FormField>
                  <FormField label={t('contact.phoneLabel')}>
                    <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t('contact.phonePlaceholder')} />
                  </FormField>
                </div>
                <FormField label={t('contact.message')} required error={errors.message}>
                  <TextArea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={!!errors.message} placeholder={t('contact.messagePlaceholder')} rows={5} />
                </FormField>
                <Button type="submit" disabled={submitting} fullWidth>
                  {submitting ? <><Send size={16} className="animate-pulse" /> {t('contact.submitting')}</> : <><Send size={16} /> {t('contact.submit')}</>}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
