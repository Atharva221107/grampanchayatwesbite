import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Pin, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Announcement, Insert, AnnouncementPriority } from '@/types';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField, TextInput, TextArea, Select, Toggle } from '@/components/admin/FormField';
import FileUpload from '@/components/admin/FileUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPES } from '@/lib/storage';

const priorityVariants: Record<AnnouncementPriority, 'saffron' | 'green' | 'red'> = {
  low: 'green',
  medium: 'saffron',
  high: 'red',
};

interface FormData {
  title: string;
  title_mr: string;
  description: string;
  description_mr: string;
  image_url: string | null;
  attachment_url: string | null;
  priority: AnnouncementPriority;
  is_pinned: boolean;
  start_date: string;
  expiry_date: string;
}

const emptyForm: FormData = {
  title: '', title_mr: '', description: '', description_mr: '',
  image_url: null, attachment_url: null, priority: 'medium',
  is_pinned: false, start_date: '', expiry_date: '',
};

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Insert<Announcement> = {
        title: form.title,
        title_mr: form.title_mr || null,
        description: form.description || null,
        description_mr: form.description_mr || null,
        image_url: form.image_url,
        attachment_url: form.attachment_url,
        priority: form.priority,
        is_pinned: form.is_pinned,
        start_date: form.start_date || null,
        expiry_date: form.expiry_date || null,
        published_at: new Date().toISOString(),
      };
      if (editingId) {
        const { error } = await supabase.from('announcements').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast(editingId ? 'Announcement updated successfully' : 'Announcement created successfully');
      setModalOpen(false);
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const handleEdit = (item: Announcement) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      title_mr: item.title_mr || '',
      description: item.description || '',
      description_mr: item.description_mr || '',
      image_url: item.image_url,
      attachment_url: item.attachment_url,
      priority: item.priority,
      is_pinned: item.is_pinned,
      start_date: item.start_date || '',
      expiry_date: item.expiry_date || '',
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
    const { error } = await supabase.from('announcements').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    toast('Announcement deleted');
    setDeleteTarget(null);
  };

  if (isLoading) return <LoadingSpinner size={32} className="py-20" />;

  return (
    <div>
      <AdminPageHeader
        title="Manage Announcements"
        description="Create and manage village announcements"
        action={<Button onClick={handleAdd}><Plus size={18} /> Add Announcement</Button>}
      />

      {items.length === 0 ? (
        <EmptyState message="No announcements yet. Click 'Add Announcement' to create one.">
          <Button onClick={handleAdd}><Plus size={18} /> Add Announcement</Button>
        </EmptyState>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-primary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50 border-b border-primary-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Pinned</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Expiry</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-primary-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-primary-900">{item.title}</p>
                    {item.title_mr && <p className="text-xs text-primary-400">{item.title_mr}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityVariants[item.priority]}>{item.priority}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {item.is_pinned ? <Pin size={16} className="text-accent-saffron" /> : <span className="text-primary-300 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {item.expiry_date ? (
                      <span className="text-sm text-primary-600 flex items-center gap-1">
                        <Calendar size={14} className="text-primary-400" />
                        {item.expiry_date}
                      </span>
                    ) : <span className="text-primary-300 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 rounded-lg text-primary-500 hover:bg-primary-100 hover:text-primary-900 transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg text-primary-500 hover:bg-error-50 hover:text-error-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Announcement' : 'Add Announcement'} size="lg">
        <div className="space-y-4">
          <FormField label="Title (English)" required error={errors.title}>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={!!errors.title} placeholder="Enter title" />
          </FormField>
          <FormField label="शीर्षक (मराठी) — Optional">
            <TextInput value={form.title_mr} onChange={(e) => setForm({ ...form, title_mr: e.target.value })} placeholder="मराठी शीर्षक प्रविष्ट करा" />
          </FormField>
          <FormField label="Description (English)">
            <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter description" />
          </FormField>
          <FormField label="विवरण (मराठी) — Optional">
            <TextArea value={form.description_mr} onChange={(e) => setForm({ ...form, description_mr: e.target.value })} placeholder="मराठी विवरण प्रविष्ट करा" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormField>
            <div className="flex items-end pb-2">
              <Toggle label="Pin to top" checked={form.is_pinned} onChange={(v) => setForm({ ...form, is_pinned: v })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date">
              <TextInput type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </FormField>
            <FormField label="Expiry Date">
              <TextInput type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            </FormField>
          </div>
          <FileUpload label="Image" folder="announcements" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} accept="image/*" allowedTypes={ALLOWED_IMAGE_TYPES} preview="image" />
          <FileUpload label="PDF Attachment" folder="announcements" value={form.attachment_url} onChange={(url) => setForm({ ...form, attachment_url: url })} accept=".pdf" allowedTypes={ALLOWED_PDF_TYPES} preview="file" />
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
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
