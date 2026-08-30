import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sarpanch, PanchayatMember, Insert } from '@/types';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField, TextInput, TextArea, Toggle } from '@/components/admin/FormField';
import FileUpload from '@/components/admin/FileUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { ALLOWED_IMAGE_TYPES } from '@/lib/storage';

type Tab = 'sarpanch' | 'members';

interface SarpanchForm {
  photo_url: string | null;
  name: string;
  contact: string;
  email: string;
  address: string;
  message: string;
  message_mr: string;
  term_start: string;
  term_end: string;
}

interface MemberForm {
  photo_url: string | null;
  name: string;
  ward_number: string;
  designation: string;
  phone: string;
  email: string;
  responsibilities: string;
  responsibilities_mr: string;
  is_committee: boolean;
  is_former: boolean;
}

const emptySarpanch: SarpanchForm = {
  photo_url: null, name: '', contact: '', email: '', address: '',
  message: '', message_mr: '', term_start: '', term_end: '',
};

const emptyMember: MemberForm = {
  photo_url: null, name: '', ward_number: '', designation: '', phone: '',
  email: '', responsibilities: '', responsibilities_mr: '',
  is_committee: false, is_former: false,
};

export default function AdminMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('sarpanch');

  // Sarpanch state
  const [sarpanchForm, setSarpanchForm] = useState<SarpanchForm>(emptySarpanch);
  const [sarpanchLoaded, setSarpanchLoaded] = useState(false);
  const [sarpanchId, setSarpanchId] = useState<string | null>(null);

  // Members state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMember);
  const [deleteMember, setDeleteMember] = useState<PanchayatMember | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);
  const [showFormer, setShowFormer] = useState(false);

  // Sarpanch query
  const { data: sarpanch, isLoading: sarpanchLoading } = useQuery({
    queryKey: ['admin-sarpanch'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sarpanch')
        .select('*')
        .eq('is_current', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Sarpanch | null;
    },
  });

  if (sarpanch && !sarpanchLoaded) {
    setSarpanchForm({
      photo_url: sarpanch.photo_url,
      name: sarpanch.name,
      contact: sarpanch.contact || '',
      email: sarpanch.email || '',
      address: sarpanch.address || '',
      message: sarpanch.message || '',
      message_mr: sarpanch.message_mr || '',
      term_start: sarpanch.term_start || '',
      term_end: sarpanch.term_end || '',
    });
    setSarpanchId(sarpanch.id);
    setSarpanchLoaded(true);
  }

  // Members query
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['admin-members', showFormer],
    queryFn: async () => {
      let query = supabase.from('panchayat_members').select('*').order('created_at', { ascending: false });
      query = query.eq('is_former', showFormer);
      const { data, error } = await query;
      if (error) throw error;
      return data as PanchayatMember[];
    },
  });

  const saveSarpanchMutation = useMutation({
    mutationFn: async () => {
      const payload: Insert<Sarpanch> = {
        photo_url: sarpanchForm.photo_url,
        name: sarpanchForm.name,
        contact: sarpanchForm.contact || null,
        email: sarpanchForm.email || null,
        address: sarpanchForm.address || null,
        message: sarpanchForm.message || null,
        message_mr: sarpanchForm.message_mr || null,
        term_start: sarpanchForm.term_start || null,
        term_end: sarpanchForm.term_end || null,
        is_current: true,
      };
      if (sarpanchId) {
        const { error } = await supabase.from('sarpanch').update(payload).eq('id', sarpanchId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sarpanch').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sarpanch'] });
      queryClient.invalidateQueries({ queryKey: ['sarpanch'] });
      toast('Sarpanch information saved successfully');
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const saveMemberMutation = useMutation({
    mutationFn: async () => {
      const payload: Insert<PanchayatMember> = {
        photo_url: memberForm.photo_url,
        name: memberForm.name,
        ward_number: memberForm.ward_number || null,
        designation: memberForm.designation || null,
        phone: memberForm.phone || null,
        email: memberForm.email || null,
        responsibilities: memberForm.responsibilities || null,
        responsibilities_mr: memberForm.responsibilities_mr || null,
        is_committee: memberForm.is_committee,
        is_former: memberForm.is_former,
      };
      if (editingMemberId) {
        const { error } = await supabase.from('panchayat_members').update(payload).eq('id', editingMemberId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('panchayat_members').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast(editingMemberId ? 'Member updated' : 'Member added');
      setMemberModalOpen(false);
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const handleEditMember = (m: PanchayatMember) => {
    setEditingMemberId(m.id);
    setMemberForm({
      photo_url: m.photo_url,
      name: m.name,
      ward_number: m.ward_number || '',
      designation: m.designation || '',
      phone: m.phone || '',
      email: m.email || '',
      responsibilities: m.responsibilities || '',
      responsibilities_mr: m.responsibilities_mr || '',
      is_committee: m.is_committee,
      is_former: m.is_former,
    });
    setMemberModalOpen(true);
  };

  const handleAddMember = () => {
    setEditingMemberId(null);
    setMemberForm({ ...emptyMember, is_former: showFormer });
    setMemberModalOpen(true);
  };

  const handleDeleteMember = async () => {
    if (!deleteMember) return;
    setDeletingMember(true);
    const { error } = await supabase.from('panchayat_members').delete().eq('id', deleteMember.id);
    setDeletingMember(false);
    if (error) { toast(error.message, 'error'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    queryClient.invalidateQueries({ queryKey: ['members'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    toast('Member deleted');
    setDeleteMember(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Manage Members"
        description="Sarpanch and panchayat members"
        action={tab === 'members' ? <Button onClick={handleAddMember}><Plus size={18} /> Add Member</Button> : undefined}
      />

      <div className="flex gap-1 mb-6 bg-primary-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('sarpanch')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'sarpanch' ? 'bg-white text-primary-900 shadow-soft' : 'text-primary-500 hover:text-primary-900'}`}
        >
          Sarpanch
        </button>
        <button
          onClick={() => setTab('members')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'members' ? 'bg-white text-primary-900 shadow-soft' : 'text-primary-500 hover:text-primary-900'}`}
        >
          Members
        </button>
      </div>

      {tab === 'sarpanch' ? (
        sarpanchLoading ? (
          <LoadingSpinner size={32} className="py-20" />
        ) : (
          <div className="bg-white rounded-xl shadow-card border border-primary-100 p-6 space-y-4 max-w-2xl">
            <FileUpload label="Photo" folder="members" value={sarpanchForm.photo_url} onChange={(url) => setSarpanchForm({ ...sarpanchForm, photo_url: url })} accept="image/*" allowedTypes={ALLOWED_IMAGE_TYPES} preview="image" />
            <FormField label="Name" required>
              <TextInput value={sarpanchForm.name} onChange={(e) => setSarpanchForm({ ...sarpanchForm, name: e.target.value })} placeholder="Sarpanch name" />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact">
                <TextInput value={sarpanchForm.contact} onChange={(e) => setSarpanchForm({ ...sarpanchForm, contact: e.target.value })} placeholder="Phone number" />
              </FormField>
              <FormField label="Email">
                <TextInput type="email" value={sarpanchForm.email} onChange={(e) => setSarpanchForm({ ...sarpanchForm, email: e.target.value })} placeholder="email@example.com" />
              </FormField>
            </div>
            <FormField label="Address">
              <TextArea value={sarpanchForm.address} onChange={(e) => setSarpanchForm({ ...sarpanchForm, address: e.target.value })} rows={2} placeholder="Home address" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Term Start">
                <TextInput type="date" value={sarpanchForm.term_start} onChange={(e) => setSarpanchForm({ ...sarpanchForm, term_start: e.target.value })} />
              </FormField>
              <FormField label="Term End">
                <TextInput type="date" value={sarpanchForm.term_end} onChange={(e) => setSarpanchForm({ ...sarpanchForm, term_end: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Message (English)">
              <TextArea value={sarpanchForm.message} onChange={(e) => setSarpanchForm({ ...sarpanchForm, message: e.target.value })} placeholder="Message from the Sarpanch" />
            </FormField>
            <FormField label="संदेश (मराठी) — Optional">
              <TextArea value={sarpanchForm.message_mr} onChange={(e) => setSarpanchForm({ ...sarpanchForm, message_mr: e.target.value })} placeholder="मराठी संदेश" />
            </FormField>
            <div className="flex justify-end pt-2">
              <Button onClick={() => saveSarpanchMutation.mutate()} disabled={saveSarpanchMutation.isPending || !sarpanchForm.name.trim()}>
                {saveSarpanchMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Sarpanch
              </Button>
            </div>
          </div>
        )
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Toggle label="Show former members" checked={showFormer} onChange={setShowFormer} />
          </div>
          {membersLoading ? (
            <LoadingSpinner size={32} className="py-20" />
          ) : members.length === 0 ? (
            <EmptyState message="No members yet.">
              <Button onClick={handleAddMember}><Plus size={18} /> Add Member</Button>
            </EmptyState>
          ) : (
            <div className="bg-white rounded-xl shadow-card border border-primary-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-primary-50 border-b border-primary-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Ward</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Designation</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Tags</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-primary-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {m.photo_url && <img src={m.photo_url} alt={m.name} className="h-8 w-8 rounded-full object-cover" />}
                          <span className="text-sm font-medium text-primary-900">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-primary-600">{m.ward_number || '—'}</span></td>
                      <td className="px-4 py-3"><span className="text-sm text-primary-600">{m.designation || '—'}</span></td>
                      <td className="px-4 py-3"><span className="text-sm text-primary-600">{m.phone || '—'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {m.is_committee && <Badge variant="blue">Committee</Badge>}
                          {m.is_former && <Badge variant="gray">Former</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEditMember(m)} className="p-2 rounded-lg text-primary-500 hover:bg-primary-100 hover:text-primary-900 transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => setDeleteMember(m)} className="p-2 rounded-lg text-primary-500 hover:bg-error-50 hover:text-error-600 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal open={memberModalOpen} onClose={() => setMemberModalOpen(false)} title={editingMemberId ? 'Edit Member' : 'Add Member'} size="lg">
        <div className="space-y-4">
          <FileUpload label="Photo" folder="members" value={memberForm.photo_url} onChange={(url) => setMemberForm({ ...memberForm, photo_url: url })} accept="image/*" allowedTypes={ALLOWED_IMAGE_TYPES} preview="image" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" required>
              <TextInput value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="Member name" />
            </FormField>
            <FormField label="Ward Number">
              <TextInput value={memberForm.ward_number} onChange={(e) => setMemberForm({ ...memberForm, ward_number: e.target.value })} placeholder="e.g. Ward 1" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Designation">
              <TextInput value={memberForm.designation} onChange={(e) => setMemberForm({ ...memberForm, designation: e.target.value })} placeholder="e.g. Ward Member" />
            </FormField>
            <FormField label="Phone">
              <TextInput value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} placeholder="Phone number" />
            </FormField>
          </div>
          <FormField label="Email">
            <TextInput type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="email@example.com" />
          </FormField>
          <FormField label="Responsibilities (English)">
            <TextArea value={memberForm.responsibilities} onChange={(e) => setMemberForm({ ...memberForm, responsibilities: e.target.value })} />
          </FormField>
          <FormField label="जबाबदाऱ्या (मराठी) — Optional">
            <TextArea value={memberForm.responsibilities_mr} onChange={(e) => setMemberForm({ ...memberForm, responsibilities_mr: e.target.value })} />
          </FormField>
          <div className="flex items-center gap-6">
            <Toggle label="Committee member" checked={memberForm.is_committee} onChange={(v) => setMemberForm({ ...memberForm, is_committee: v })} />
            <Toggle label="Former member" checked={memberForm.is_former} onChange={(v) => setMemberForm({ ...memberForm, is_former: v })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setMemberModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMemberMutation.mutate()} disabled={saveMemberMutation.isPending || !memberForm.name.trim()}>
              {saveMemberMutation.isPending ? 'Saving...' : editingMemberId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteMember}
        title="Delete Member"
        message={`Are you sure you want to delete "${deleteMember?.name}"?`}
        onConfirm={handleDeleteMember}
        onCancel={() => setDeleteMember(null)}
        loading={deletingMember}
      />
    </div>
  );
}
