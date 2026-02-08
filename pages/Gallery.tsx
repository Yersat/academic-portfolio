
import React, { useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery: React.FC = () => {
  const photos = useQuery(api.gallery.listPublished);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const goToPrevious = useCallback(() => {
    if (selectedPhotoIndex === null || !photos) return;
    setSelectedPhotoIndex(selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1);
  }, [selectedPhotoIndex, photos]);

  const goToNext = useCallback(() => {
    if (selectedPhotoIndex === null || !photos) return;
    setSelectedPhotoIndex(selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1);
  }, [selectedPhotoIndex, photos]);

  if (photos === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="space-y-20 animate-fade-in max-w-5xl mx-auto">
        <header className="space-y-6 text-center">
          <h1 className="text-4xl font-serif font-bold italic text-black">Фотогаллерея</h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
            Фотографии с конференций, мероприятий и научной деятельности.
          </p>
        </header>
        <div className="text-center py-16 text-gray-400">
          Фотографии пока не добавлены.
        </div>
      </div>
    );
  }

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <div className="space-y-20 animate-fade-in max-w-5xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Фотогаллерея</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
          Фотографии с конференций, мероприятий и научной деятельности.
        </p>
      </header>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo._id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-sm bg-gray-100"
          >
            {photo.imageUrl && (
              <img
                src={photo.imageUrl}
                alt={photo.title || ''}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            {photo.title && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <span className="text-white text-xs font-bold uppercase tracking-wider p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.title}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhotoIndex !== null && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
          >
            <X size={28} />
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronLeft size={36} />
          </button>

          {/* Image + Caption */}
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center px-16">
            {selectedPhoto.imageUrl && (
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || ''}
                className="max-w-full max-h-[75vh] object-contain"
              />
            )}
            {(selectedPhoto.title || selectedPhoto.description) && (
              <div className="mt-4 text-center">
                {selectedPhoto.title && (
                  <p className="text-white font-serif font-bold text-lg">
                    {selectedPhoto.title}
                  </p>
                )}
                {selectedPhoto.description && (
                  <p className="text-white/70 text-sm mt-1 italic">
                    {selectedPhoto.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
