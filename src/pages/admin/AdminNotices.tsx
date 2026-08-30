import { useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notice, Insert, NoticeFileType } from '@/types';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField, TextInput, TextArea, Select } from '@/components/admin/FormField';
import FileUpload from '@/components/admin/FileUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SearchBar from '@/components/ui/SearchBar';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { ALLOWED_NOTICE_TYPES } from '@/lib/storage';

interface FormData {
  title: string;
  title_mr: string;
  description: string;
  description_mr: string;
  file_url: string | null;
  file_type: NoticeFileType | null;
  category: string;
}

const emptyForm: FormData = {
  title: '', title_mr: '', description: '', description_mr: '',
  file_url: null, file_type: null, category: '',
};

function detectFileType(url: string): NoticeFileType | null {
  const lower = url.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpeg';
  if (lower.endsWith('.png')) return 'png';
  return null;
}

export default function AdminNotices() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-notices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Notice[];
    },
  });

  const categories = [...new Set(items.map((n) => n.category).filter(Boolean))] as string[];

  const filtered = items.filter((n) => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || n.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fileType = form.file_url ? detectFileType(form.file_url) : null;
      const payload: Insert<Notice> = {
        title: form.title,
        title_mr: form.title_mr || null,
        description: form.description || null,
        description_mr: form.description_mr || null,
        file_url: form.file_url,
        file_type: fileType,
        category: form.category || null,
      };
      if (editingId) {
        const { error } = await supabase.from('notices').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('notices').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast(editingId ? 'Notice updated successfully' : 'Notice created successfully');
      setModalOpen(false);
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const handleEdit = (item: Notice) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      title_mr: item.title_mr || '',
      description: item.description || '',
      description_mr: item.description_mr || '',
      file_url: item.file_url,
      file_type: item.file_type,
      category: item.category || '',
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
    if (!form.title.trim()) e.title = 'Title is required';
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
    const { error } = await supabase.from('notices').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) { toast(error.message, 'error'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
    queryClient.invalidateQueries({ queryKey: ['notices'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    toast('Notice deleted');
    setDeleteTarget(null);
  };

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;

  return (
    <div>
      <AdminPageHeader
        title="Manage Notices"
        description="Create and manage official notices"
        action={<Button onClick={handleAdd}><Plus size={18} /> Add Notice</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notices..." className="flex-1" />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="sm:w-48">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={items.length === 0 ? "No notices yet." : "No notices match your search."}>
          {items.length === 0 && <Button onClick={handleAdd}><Plus size={18} /> Add Notice</Button>}
        </EmptyState>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-primary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50 border-b border-primary-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">File</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-primary-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-primary-900">{item.title}</p>
                    {item.title_mr && <p className="text-xs text-primary-400">{item.title_mr}</p>}
                  </td>
                  <td className="px-4 py-3"><span className="text-sm text-primary-600">{item.category || '—'}</span></td>
                  <td className="px-4 py-3">
                    {item.file_type === 'pdf' ? (
                      <Badge variant="red"><FileText size={12} /> PDF</Badge>
                    ) : item.file_type ? (
                      <Badge variant="blue"><ImageIcon size={12} /> {item.file_type.toUpperCase()}</Badge>
                    ) : <span className="text-primary-300 text-sm">—</span>}
                  </td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Notice' : 'Add Notice'} size="lg">
        <div className="space-y-4">
          <FormField label="Title (English)" required error={errors.title}>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={!!errors.title} placeholder="Notice title" />
          </FormField>
          <FormField label="शीर्षक (मराठी) — Optional">
            <TextInput value={form.title_mr} onChange={(e) => setForm({ ...form, title_mr: e.target.value })} placeholder="मराठी शीर्षक" />
          </FormField>
          <FormField label="Description (English)">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="विवरण (मराठी) — Optional">
            <TextArea value={form.description_mr} onChange={(e) => setForm({ ...form, description_mr: e.target.value })} />
          </FormField>
          <FormField label="Category">
            <TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. General, Election, Water" />
          </FormField>
          <FileUpload
            label="Notice File (PDF, JPEG, or PNG)"
            folder="notices"
            value={form.file_url}
            onChange={(url) => setForm({ ...form, file_url: url })}
            accept=".pdf,.jpg,.jpeg,.png"
            allowedTypes={ALLOWED_NOTICE_TYPES}
            preview="file"
          />
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
        title="Delete Notice"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
