import { useState } from 'react';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scheme, Insert, SchemeStatus } from '@/types';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField, TextInput, TextArea, Select, Toggle } from '@/components/admin/FormField';
import FileUpload from '@/components/admin/FileUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { ALLOWED_PDF_TYPES } from '@/lib/storage';

interface FormData {
  name: string;
  name_mr: string;
  category: string;
  description: string;
  description_mr: string;
  benefits: string;
  benefits_mr: string;
  eligibility: string;
  eligibility_mr: string;
  documents_required: string;
  application_process: string;
  important_dates: string;
  official_link: string;
  helpline: string;
  pdf_url: string | null;
  status: SchemeStatus;
  featured: boolean;
}

const emptyForm: FormData = {
  name: '', name_mr: '', category: '', description: '', description_mr: '',
  benefits: '', benefits_mr: '', eligibility: '', eligibility_mr: '',
  documents_required: '', application_process: '', important_dates: '',
  official_link: '', helpline: '', pdf_url: null, status: 'active', featured: false,
};

export default function AdminSchemes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Scheme | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-schemes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schemes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Scheme[];
    },
  });

  const categories = [...new Set(items.map((s) => s.category).filter(Boolean))] as string[];

  const filtered = items.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Insert<Scheme> = {
        name: form.name,
        name_mr: form.name_mr || null,
        category: form.category || null,
        description: form.description || null,
        description_mr: form.description_mr || null,
        benefits: form.benefits || null,
        benefits_mr: form.benefits_mr || null,
        eligibility: form.eligibility || null,
        eligibility_mr: form.eligibility_mr || null,
        documents_required: form.documents_required || null,
        application_process: form.application_process || null,
        important_dates: form.important_dates || null,
        official_link: form.official_link || null,
        helpline: form.helpline || null,
        pdf_url: form.pdf_url,
        status: form.status,
        featured: form.featured,
      };
      if (editingId) {
        const { error } = await supabase.from('schemes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('schemes').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schemes'] });
      queryClient.invalidateQueries({ queryKey: ['schemes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast(editingId ? 'Scheme updated successfully' : 'Scheme created successfully');
      setModalOpen(false);
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const handleEdit = (item: Scheme) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      name_mr: item.name_mr || '',
      category: item.category || '',
      description: item.description || '',
      description_mr: item.description_mr || '',
      benefits: item.benefits || '',
      benefits_mr: item.benefits_mr || '',
      eligibility: item.eligibility || '',
      eligibility_mr: item.eligibility_mr || '',
      documents_required: item.documents_required || '',
      application_process: item.application_process || '',
      important_dates: item.important_dates || '',
      official_link: item.official_link || '',
      helpline: item.helpline || '',
      pdf_url: item.pdf_url,
      status: item.status,
      featured: item.featured,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.official_link && !/^https?:\/\/.+/.test(form.official_link)) e.official_link = 'Must be a valid URL';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveMutation.mutate();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('schemes').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) { toast(error.message, 'error'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-schemes'] });
    queryClient.invalidateQueries({ queryKey: ['schemes'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    toast('Scheme deleted');
    setDeleteTarget(null);
  };

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;

  return (
    <div>
      <AdminPageHeader
        title="Manage Schemes"
        description="Create and manage government schemes"
        action={<Button onClick={handleAdd}><Plus size={18} /> Add Scheme</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search schemes..." className="flex-1" />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="sm:w-48">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={items.length === 0 ? "No schemes yet." : "No schemes match your search."}>
          {items.length === 0 && <Button onClick={handleAdd}><Plus size={18} /> Add Scheme</Button>}
        </EmptyState>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-primary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50 border-b border-primary-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Featured</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-primary-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-primary-900">{item.name}</p>
                    {item.name_mr && <p className="text-xs text-primary-400">{item.name_mr}</p>}
                  </td>
                  <td className="px-4 py-3"><span className="text-sm text-primary-600">{item.category || '—'}</span></td>
                  <td className="px-4 py-3"><Badge variant={item.status === 'active' ? 'green' : 'gray'}>{item.status}</Badge></td>
                  <td className="px-4 py-3">{item.featured ? <Star size={16} className="text-accent-saffron fill-accent-saffron" /> : <span className="text-primary-300 text-sm">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-primary-500 hover:bg-primary-100 hover:text-primary-900 transition-colors"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg text-primary-500 hover:bg-error-50 hover:text-error-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Scheme' : 'Add Scheme'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name (English)" required error={errors.name}>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={!!errors.name} placeholder="Scheme name" />
            </FormField>
            <FormField label="नाव (मराठी) — Optional">
              <TextInput value={form.name_mr} onChange={(e) => setForm({ ...form, name_mr: e.target.value })} placeholder="मराठी नाव" />
            </FormField>
          </div>
          <FormField label="Category">
            <TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Agriculture, Health, Education" />
          </FormField>
          <FormField label="Description (English)">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="विवरण (मराठी) — Optional">
            <TextArea value={form.description_mr} onChange={(e) => setForm({ ...form, description_mr: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Benefits (English)">
              <TextArea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={3} />
            </FormField>
            <FormField label="फायदे (मराठी) — Optional">
              <TextArea value={form.benefits_mr} onChange={(e) => setForm({ ...form, benefits_mr: e.target.value })} rows={3} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Eligibility (English)">
              <TextArea value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} rows={3} />
            </FormField>
            <FormField label="पात्रता (मराठी) — Optional">
              <TextArea value={form.eligibility_mr} onChange={(e) => setForm({ ...form, eligibility_mr: e.target.value })} rows={3} />
            </FormField>
          </div>
          <FormField label="Documents Required">
            <TextArea value={form.documents_required} onChange={(e) => setForm({ ...form, documents_required: e.target.value })} />
          </FormField>
          <FormField label="Application Process">
            <TextArea value={form.application_process} onChange={(e) => setForm({ ...form, application_process: e.target.value })} />
          </FormField>
          <FormField label="Important Dates">
            <TextArea value={form.important_dates} onChange={(e) => setForm({ ...form, important_dates: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Official Link" error={errors.official_link}>
              <TextInput value={form.official_link} onChange={(e) => setForm({ ...form, official_link: e.target.value })} error={!!errors.official_link} placeholder="https://..." />
            </FormField>
            <FormField label="Helpline">
              <TextInput value={form.helpline} onChange={(e) => setForm({ ...form, helpline: e.target.value })} placeholder="Phone number" />
            </FormField>
          </div>
          <FileUpload label="Scheme PDF" folder="schemes" value={form.pdf_url} onChange={(url) => setForm({ ...form, pdf_url: url })} accept=".pdf" allowedTypes={ALLOWED_PDF_TYPES} preview="file" />
          <div className="flex items-center gap-6">
            <FormField label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SchemeStatus })}>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </Select>
            </FormField>
            <div className="flex items-end pb-2">
              <Toggle label="Featured" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Scheme"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
