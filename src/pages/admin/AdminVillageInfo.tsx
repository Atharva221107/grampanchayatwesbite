import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VillageInfo } from '@/types';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField, TextArea, TextInput } from '@/components/admin/FormField';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, ErrorState } from '@/components/ui/Loading';

const fields: { key: keyof VillageInfo; label: string; mrKey: keyof VillageInfo; mrLabel: string }[] = [
  { key: 'introduction', label: 'Introduction', mrKey: 'introduction_mr', mrLabel: 'परिचय (मराठी)' },
  { key: 'history', label: 'History', mrKey: 'history_mr', mrLabel: 'इतिहास (मराठी)' },
  { key: 'geography', label: 'Geography', mrKey: 'geography_mr', mrLabel: 'भूगोल (मराठी)' },
  { key: 'location', label: 'Location', mrKey: 'location_mr', mrLabel: 'स्थान (मराठी)' },
  { key: 'climate', label: 'Climate', mrKey: 'climate_mr', mrLabel: 'हवामान (मराठी)' },
  { key: 'population', label: 'Population', mrKey: 'population_mr', mrLabel: 'लोकसंख्या (मराठी)' },
  { key: 'economy', label: 'Economy', mrKey: 'economy_mr', mrLabel: 'अर्थव्यवस्था (मराठी)' },
  { key: 'agriculture', label: 'Agriculture', mrKey: 'agriculture_mr', mrLabel: 'शेती (मराठी)' },
  { key: 'culture', label: 'Culture & Festivals', mrKey: 'culture_mr', mrLabel: 'संस्कृती (मराठी)' },
  { key: 'education', label: 'Education', mrKey: 'education_mr', mrLabel: 'शिक्षण (मराठी)' },
  { key: 'healthcare', label: 'Healthcare', mrKey: 'healthcare_mr', mrLabel: 'आरोग्य (मराठी)' },
  { key: 'transportation', label: 'Transportation', mrKey: 'transportation_mr', mrLabel: 'वाहतूक (मराठी)' },
  { key: 'tourist_places', label: 'Tourist Places', mrKey: 'tourist_places_mr', mrLabel: 'पर्यटन (मराठी)' },
  { key: 'institutions', label: 'Institutions', mrKey: 'institutions_mr', mrLabel: 'संस्था (मराठी)' },
  { key: 'future_plans', label: 'Future Plans', mrKey: 'future_plans_mr', mrLabel: 'भविष्य योजना (मराठी)' },
];

export default function AdminVillageInfo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  const { data: info, isLoading, isError } = useQuery({
    queryKey: ['admin-village-info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('village_info')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as VillageInfo | null;
    },
  });

  if (info && !loaded) {
    const formObj: Record<string, string> = {};
    fields.forEach((f) => {
      formObj[f.key] = (info[f.key] as string) || '';
      formObj[f.mrKey] = (info[f.mrKey] as string) || '';
    });
    formObj['map_embed_url'] = info.map_embed_url || '';
    setForm(formObj);
    setLoaded(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string | null> = {};
      fields.forEach((f) => {
        payload[f.key] = form[f.key] || null;
        payload[f.mrKey] = form[f.mrKey] || null;
      });
      payload['map_embed_url'] = form['map_embed_url'] || null;

      if (info) {
        const { error } = await supabase.from('village_info').update(payload).eq('id', info.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('village_info').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-village-info'] });
      queryClient.invalidateQueries({ queryKey: ['village-info'] });
      toast('Village information saved successfully');
    },
    onError: (err) => toast(err.message, 'error'),
  });

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (isError) return <ErrorState message="Failed to load village information." />;

  return (
    <div>
      <AdminPageHeader
        title="Manage Village Info"
        description="Edit the single village information record"
        action={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-card border border-primary-100 p-6 space-y-6">
        {fields.map((f) => (
          <div key={f.key} className="space-y-3 pb-6 border-b border-primary-50 last:border-0">
            <FormField label={f.label}>
              <TextArea
                value={form[f.key] || ''}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                rows={4}
                placeholder={`Enter ${f.label.toLowerCase()}...`}
              />
            </FormField>
            <FormField label={f.mrLabel}>
              <TextArea
                value={form[f.mrKey] || ''}
                onChange={(e) => setForm({ ...form, [f.mrKey]: e.target.value })}
                rows={3}
                placeholder="मराठी मध्ये प्रविष्ट करा (optional)"
              />
            </FormField>
          </div>
        ))}

        <FormField label="Google Map Embed URL" hint="Paste the full iframe src URL from Google Maps embed">
          <TextInput
            value={form['map_embed_url'] || ''}
            onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })}
            placeholder="https://www.google.com/maps/embed?..."
          />
        </FormField>

        <div className="flex justify-end pt-2">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
