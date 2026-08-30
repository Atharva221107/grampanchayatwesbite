import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { GalleryAlbum, GalleryImage } from '@/types';
import { useLanguage, pickField } from '@/hooks/useLanguage';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/Loading';

export default function Gallery() {
  const { t } = useTranslation();
  const lang = useLanguage();
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const { data: albums = [], isLoading: albumsLoading, isError: albumsError } = useQuery<GalleryAlbum[]>({
    queryKey: ['gallery-albums'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: allImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const albumImages = activeAlbum
    ? allImages.filter((img) => img.album_id === activeAlbum.id)
    : allImages;

  const imageCountPerAlbum = (albumId: string) => allImages.filter((img) => img.album_id === albumId).length;

  if (albumsLoading) return <LoadingSpinner size={32} className="py-20" />;
  if (albumsError) return <ErrorState message={t('common.error')} />;

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const nextImage = () => setLightboxIdx((prev) => prev === null ? null : (prev + 1) % albumImages.length);
  const prevImage = () => setLightboxIdx((prev) => prev === null ? null : (prev - 1 + albumImages.length) % albumImages.length);

  const currentImage = lightboxIdx !== null ? albumImages[lightboxIdx] : null;

  return (
    <>
      <Helmet>
        <title>{t('gallery.title')} — {t('nav.panchayat')}</title>
        <meta name="description" content={t('gallery.subtitle')} />
      </Helmet>

      <div className="container-page py-12">
        <h1 className="mb-3">{t('gallery.title')}</h1>
        <p className="text-primary-500 text-lg mb-8">{t('gallery.subtitle')}</p>

        {/* Album navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveAlbum(null)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !activeAlbum ? 'bg-primary-900 text-white' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            {t('gallery.allPhotos')} ({allImages.length})
          </button>
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setActiveAlbum(album)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeAlbum?.id === album.id ? 'bg-primary-900 text-white' : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              {album.title} ({imageCountPerAlbum(album.id)})
            </button>
          ))}
        </div>

        {activeAlbum && (
          <button onClick={() => setActiveAlbum(null)} className="text-sm text-primary-500 hover:text-primary-900 mb-4 flex items-center gap-1 transition-colors">
            <ChevronLeft size={16} /> {t('gallery.allPhotos')}
          </button>
        )}

        {albumImages.length === 0 ? (
          <EmptyState message={activeAlbum ? t('gallery.noImages') : t('gallery.noAlbums')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {albumImages.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => openLightbox(idx)}
                className="group relative bg-white rounded-xl shadow-card border border-primary-100 overflow-hidden cursor-pointer hover:shadow-elevated transition-shadow"
              >
                <img src={img.image_url} alt={img.caption || ''} className="w-full h-40 object-cover" />
                {(pickField(img.caption, img.caption_mr, lang)) && (
                  <p className="text-xs text-primary-600 p-2 truncate">{pickField(img.caption, img.caption_mr, lang)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {currentImage && (
        <div className="fixed inset-0 z-[60] bg-primary-950/90 flex items-center justify-center p-4 animate-fade-in" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/70 hover:text-white p-2" aria-label="Close">
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white/70 hover:text-white p-2" aria-label="Previous">
            <ChevronLeft size={32} />
          </button>
          <img
            src={currentImage.image_url}
            alt={pickField(currentImage.caption, currentImage.caption_mr, lang) || ''}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white/70 hover:text-white p-2" aria-label="Next">
            <ChevronRight size={32} />
          </button>
          {pickField(currentImage.caption, currentImage.caption_mr, lang) && (
            <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/80 px-8">
              {pickField(currentImage.caption, currentImage.caption_mr, lang)}
            </p>
          )}
        </div>
      )}
    </>
  );
}
