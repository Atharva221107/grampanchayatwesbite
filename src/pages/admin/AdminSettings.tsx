import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiteSettings } from '@/types';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField, TextInput, TextArea } from '@/components/admin/FormField';
import FileUpload from '@/components/admin/FileUpload';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, ErrorState } from '@/components/ui/Loading';
import { ALLOWED_IMAGE_TYPES } from '@/lib/storage';

const statFields: { key: keyof SiteSettings; label: string }[] = [
  { key: 'stat_population', label: 'Population' },
  { key: 'stat_wards', label: 'Wards' },
  { key: 'stat_schools', label: 'Schools' },
  { key: 'stat_hospitals', label: 'Hospitals' },
  { key: 'stat_anganwadi_centers', label: 'Anganwadi Centers' },
  { key: 'stat_area', label: 'Area' },
  { key: 'stat_major_crops', label: 'Major Crops' },
];

const textFields: { key: keyof SiteSettings; label: string; mrKey: keyof SiteSettings; mrLabel: string }[] = [
  { key: 'office_address', label: 'Office Address', mrKey: 'office_address_mr', mrLabel: 'कार्यालयाचा पत्ता (मराठी)' },
  { key: 'working_days', label: 'Working Days', mrKey: 'working_days_mr', mrLabel: 'कामाचे दिवस (मराठी)' },
  { key: 'lunch_break', label: 'Lunch Break', mrKey: 'lunch_break_mr', mrLabel: 'दुपारचे जेवण (मराठी)' },
  { key: 'public_holidays', label: 'Public Holidays', mrKey: 'public_holidays_mr', mrLabel: 'सार्वजनिक सुट्टी (मराठी)' },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string | null>>({});
  const [loaded, setLoaded] = useState(false);

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SiteSettings | null;
    },
  });

  if (settings && !loaded) {
    const formObj: Record<string, string | null> = {};
    [...textFields, ...statFields].forEach((f) => {
      formObj[f.key] = (settings[f.key] as string) || '';
    });
    textFields.forEach((f) => {
      formObj[f.mrKey] = (settings[f.mrKey] as string) || '';
    });
    formObj['logo_url'] = settings.logo_url;
    formObj['favicon_url'] = settings.favicon_url;
    formObj['homepage_banner_url'] = settings.homepage_banner_url;
    formObj['phone'] = settings.phone || '';
    formObj['email'] = settings.email || '';
    setForm(formObj);
    setLoaded(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string | null> = {};
      [...textFields, ...statFields].forEach((f) => {
        payload[f.key] = form[f.key] || null;
      });
      textFields.forEach((f) => {
        payload[f.mrKey] = form[f.mrKey] || null;
      });
      payload['logo_url'] = form['logo_url'] || null;
      payload['favicon_url'] = form['favicon_url'] || null;
      payload['homepage_banner_url'] = form['homepage_banner_url'] || null;
      payload['phone'] = form['phone'] || null;
      payload['email'] = form['email'] || null;

      if (settings) {
        const { error } = await supabase.from('site_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast('Settings saved successfully');
    },
    onError: (err) => toast(err.message, 'error'),
  });

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (isError) return <ErrorState message="Failed to load settings." />;

  return (
    <div>
      <AdminPageHeader
        title="Site Settings"
        description="Branding, office info, and homepage statistics"
        action={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Branding */}
        <div className="bg-white rounded-xl shadow-card border border-primary-100 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Branding</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUpload label="Logo" folder="settings" value={form['logo_url'] || null} onChange={(url) => setForm({ ...form, logo_url: url })} accept="image/*" allowedTypes={ALLOWED_IMAGE_TYPES} preview="image" />
            <FileUpload label="Favicon" folder="settings" value={form['favicon_url'] || null} onChange={(url) => setForm({ ...form, favicon_url: url })} accept="image/*" allowedTypes={ALLOWED_IMAGE_TYPES} preview="image" />
          </div>
          <div className="mt-4">
            <FileUpload label="Homepage Banner" folder="settings" value={form['homepage_banner_url'] || null} onChange={(url) => setForm({ ...form, homepage_banner_url: url })} accept="image/*" allowedTypes={ALLOWED_IMAGE_TYPES} preview="image" />
          </div>
        </div>

        {/* Office Contact */}
        <div className="bg-white rounded-xl shadow-card border border-primary-100 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Office Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormField label="Phone">
              <TextInput value={form['phone'] || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 00000 00000" />
            </FormField>
            <FormField label="Email">
              <TextInput type="email" value={form['email'] || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="office@example.gov.in" />
            </FormField>
          </div>
          {textFields.map((f) => (
            <div key={f.key} className="space-y-3 pb-4 border-b border-primary-50 last:border-0 mb-4">
              <FormField label={f.label}>
                <TextArea value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} rows={2} />
              </FormField>
              <FormField label={f.mrLabel}>
                <TextInput value={form[f.mrKey] || ''} onChange={(e) => setForm({ ...form, [f.mrKey]: e.target.value })} placeholder="मराठी (optional)" />
              </FormField>
            </div>
          ))}
        </div>

        {/* Homepage Stats */}
        <div className="bg-white rounded-xl shadow-card border border-primary-100 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Homepage Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statFields.map((f) => (
              <FormField key={f.key} label={f.label}>
                <TextInput value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={`Enter ${f.label.toLowerCase()}`} />
              </FormField>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
