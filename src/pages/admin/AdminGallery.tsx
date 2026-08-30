import { useState } from 'react';
import { Plus, Pencil, Trash2, Images, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GalleryAlbum, GalleryImage, Insert } from '@/types';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField, TextInput } from '@/components/admin/FormField';
import FileUpload from '@/components/admin/FileUpload';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import { uploadFile, deleteFileFromUrl, validateFileType, ALLOWED_IMAGE_TYPES } from '@/lib/storage';

type View = 'albums' | 'images';

interface AlbumFormData {
  title: string;
  category: string;
}

export default function AdminGallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('albums');
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albumForm, setAlbumForm] = useState<AlbumFormData>({ title: '', category: '' });
  const [deleteAlbum, setDeleteAlbum] = useState<GalleryAlbum | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageForm, setImageForm] = useState({ image_url: '', caption: '', caption_mr: '' });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deleteImage, setDeleteImage] = useState<GalleryImage | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ['admin-albums'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as GalleryAlbum[];
    },
  });

  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['admin-album-images', activeAlbum?.id],
    queryFn: async () => {
      if (!activeAlbum) return [];
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('album_id', activeAlbum.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GalleryImage[];
    },
    enabled: !!activeAlbum,
  });

  const imageCounts = useQuery({
    queryKey: ['admin-image-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery_images').select('album_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as Pick<GalleryImage, 'album_id'>[]).forEach((img) => {
        if (img.album_id) counts[img.album_id] = (counts[img.album_id] || 0) + 1;
      });
      return counts;
    },
  });

  const saveAlbumMutation = useMutation({
    mutationFn: async () => {
      const payload: Insert<GalleryAlbum> = { title: albumForm.title, category: albumForm.category || null };
      if (editingAlbumId) {
        const { error } = await supabase.from('gallery_albums').update(payload).eq('id', editingAlbumId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gallery_albums').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-albums'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] });
      toast(editingAlbumId ? 'Album updated' : 'Album created');
      setAlbumModalOpen(false);
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const addImageMutation = useMutation({
    mutationFn: async () => {
      if (!activeAlbum) return;
      const payload: Insert<GalleryImage> = {
        album_id: activeAlbum.id,
        image_url: imageForm.image_url,
        caption: imageForm.caption || null,
        caption_mr: imageForm.caption_mr || null,
      };
      const { error } = await supabase.from('gallery_images').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-album-images', activeAlbum?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-image-counts'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast('Image added to album');
      setImageModalOpen(false);
      setImageForm({ image_url: '', caption: '', caption_mr: '' });
    },
    onError: (err) => toast(err.message, 'error'),
  });

  const handleMultiUpload = async (files: FileList) => {
    if (!activeAlbum) return;
    setUploadingImages(true);
    let successCount = 0;
    for (const file of Array.from(files)) {
      if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) continue;
      const result = await uploadFile(file, 'gallery');
      if (!result) continue;
      const { error } = await supabase.from('gallery_images').insert({
        album_id: activeAlbum.id,
        image_url: result.url,
      });
      if (!error) successCount++;
    }
    setUploadingImages(false);
    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['admin-album-images', activeAlbum?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-image-counts'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast(`${successCount} image(s) uploaded`);
    } else {
      toast('No images were uploaded', 'error');
    }
  };

  const handleDeleteAlbum = async () => {
    if (!deleteAlbum) return;
    setDeletingAlbum(true);
    const albumImages = images.filter((img) => img.album_id === deleteAlbum.id);
    for (const img of albumImages) {
      if (img.image_url) await deleteFileFromUrl(img.image_url);
    }
    const { error } = await supabase.from('gallery_albums').delete().eq('id', deleteAlbum.id);
    setDeletingAlbum(false);
    if (error) { toast(error.message, 'error'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-albums'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-albums'] });
    queryClient.invalidateQueries({ queryKey: ['admin-image-counts'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    toast('Album and its images deleted');
    setDeleteAlbum(null);
  };

  const handleDeleteImage = async () => {
    if (!deleteImage) return;
    setDeletingImage(true);
    if (deleteImage.image_url) await deleteFileFromUrl(deleteImage.image_url);
    const { error } = await supabase.from('gallery_images').delete().eq('id', deleteImage.id);
    setDeletingImage(false);
    if (error) { toast(error.message, 'error'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-album-images', activeAlbum?.id] });
    queryClient.invalidateQueries({ queryKey: ['admin-image-counts'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    toast('Image deleted');
    setDeleteImage(null);
  };

  const openAddAlbum = () => {
    setEditingAlbumId(null);
    setAlbumForm({ title: '', category: '' });
    setAlbumModalOpen(true);
  };

  const openEditAlbum = (album: GalleryAlbum) => {
    setEditingAlbumId(album.id);
    setAlbumForm({ title: album.title, category: album.category || '' });
    setAlbumModalOpen(true);
  };

  const openAlbum = (album: GalleryAlbum) => {
    setActiveAlbum(album);
    setView('images');
  };

  if (albumsLoading) return <LoadingSpinner size={32} className="py-20" />;

  return (
    <div>
      <AdminPageHeader
        title={view === 'albums' ? 'Manage Gallery' : `Album: ${activeAlbum?.title}`}
        description={view === 'albums' ? 'Manage photo albums and their images' : 'Add, caption, and remove images'}
        action={
          view === 'albums' ? (
            <Button onClick={openAddAlbum}><Plus size={18} /> Add Album</Button>
          ) : (
            <Button onClick={() => setImageModalOpen(true)}><Plus size={18} /> Add Image</Button>
          )
        }
      />

      {view === 'albums' ? (
        albums.length === 0 ? (
          <EmptyState message="No albums yet.">
            <Button onClick={openAddAlbum}><Plus size={18} /> Add Album</Button>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <div key={album.id} className="bg-white rounded-xl shadow-card border border-primary-100 p-4 hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <Images size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-900">{album.title}</p>
                      {album.category && <Badge variant="gray" className="mt-1">{album.category}</Badge>}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-primary-500 mb-3">{imageCounts.data?.[album.id] || 0} photos</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openAlbum(album)}>
                    Manage <ChevronRight size={14} />
                  </Button>
                  <button onClick={() => openEditAlbum(album)} className="p-2 rounded-lg text-primary-500 hover:bg-primary-100 transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteAlbum(album)} className="p-2 rounded-lg text-primary-500 hover:bg-error-50 hover:text-error-600 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          <button onClick={() => { setView('albums'); setActiveAlbum(null); }} className="text-sm text-primary-500 hover:text-primary-900 mb-4 flex items-center gap-1 transition-colors">
            <X size={16} /> Back to albums
          </button>

          {imagesLoading ? (
            <LoadingSpinner size={32} className="py-20" />
          ) : images.length === 0 ? (
            <EmptyState message="No images in this album yet.">
              <div className="flex gap-3">
                <Button onClick={() => setImageModalOpen(true)}><Plus size={18} /> Add Image</Button>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-primary-300 text-primary-700 hover:bg-primary-50 cursor-pointer transition-colors">
                  <ImageIcon size={18} /> Bulk Upload
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleMultiUpload(e.target.files)} disabled={uploadingImages} />
                </label>
              </div>
            </EmptyState>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-primary-300 text-primary-700 hover:bg-primary-50 cursor-pointer transition-colors">
                  <ImageIcon size={18} /> Bulk Upload
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleMultiUpload(e.target.files)} disabled={uploadingImages} />
                </label>
                {uploadingImages && <span className="text-sm text-primary-500">Uploading...</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="group relative bg-white rounded-xl shadow-card border border-primary-100 overflow-hidden">
                    <img src={img.image_url} alt={img.caption || ''} className="w-full h-32 object-cover" />
                    {img.caption && <p className="text-xs text-primary-600 p-2 truncate">{img.caption}</p>}
                    <button
                      onClick={() => setDeleteImage(img)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-primary-500 hover:bg-error-50 hover:text-error-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-soft"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Modal open={albumModalOpen} onClose={() => setAlbumModalOpen(false)} title={editingAlbumId ? 'Edit Album' : 'Add Album'} size="sm">
        <div className="space-y-4">
          <FormField label="Album Title" required>
            <TextInput value={albumForm.title} onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })} placeholder="e.g. Independence Day 2024" />
          </FormField>
          <FormField label="Category">
            <TextInput value={albumForm.category} onChange={(e) => setAlbumForm({ ...albumForm, category: e.target.value })} placeholder="e.g. Events, Functions" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAlbumModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveAlbumMutation.mutate()} disabled={saveAlbumMutation.isPending || !albumForm.title.trim()}>
              {saveAlbumMutation.isPending ? 'Saving...' : editingAlbumId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={imageModalOpen} onClose={() => setImageModalOpen(false)} title="Add Image" size="md">
        <div className="space-y-4">
          <FileUpload label="Image" folder="gallery" value={imageForm.image_url || null} onChange={(url) => setImageForm({ ...imageForm, image_url: url || '' })} accept="image/*" allowedTypes={ALLOWED_IMAGE_TYPES} preview="image" required />
          <FormField label="Caption (English)">
            <TextInput value={imageForm.caption} onChange={(e) => setImageForm({ ...imageForm, caption: e.target.value })} placeholder="Image caption" />
          </FormField>
          <FormField label="कॅप्शन (मराठी) — Optional">
            <TextInput value={imageForm.caption_mr} onChange={(e) => setImageForm({ ...imageForm, caption_mr: e.target.value })} placeholder="मराठी कॅप्शन" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setImageModalOpen(false)}>Cancel</Button>
            <Button onClick={() => addImageMutation.mutate()} disabled={addImageMutation.isPending || !imageForm.image_url}>
              {addImageMutation.isPending ? 'Adding...' : 'Add Image'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteAlbum}
        title="Delete Album"
        message={`Are you sure you want to delete "${deleteAlbum?.title}" and all its images? This cannot be undone.`}
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeleteAlbum(null)}
        loading={deletingAlbum}
      />

      <ConfirmDialog
        open={!!deleteImage}
        title="Delete Image"
        message="Are you sure you want to delete this image?"
        onConfirm={handleDeleteImage}
        onCancel={() => setDeleteImage(null)}
        loading={deletingImage}
      />
    </div>
  );
}
