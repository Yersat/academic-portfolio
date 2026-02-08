
import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { ExternalLink } from 'lucide-react';

const Videos: React.FC = () => {
  const media = useQuery(api.profile.listMedia);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = useMemo(() => {
    if (!media) return [];
    const yearSet = new Set<number>();
    media.forEach(item => {
      const year = new Date(item.date).getFullYear();
      if (!isNaN(year)) yearSet.add(year);
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [media]);

  const filteredMedia = useMemo(() => {
    if (!media) return [];
    if (selectedYear === null) return media;
    return media.filter(item => new Date(item.date).getFullYear() === selectedYear);
  }, [media, selectedYear]);

  if (media === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-20 animate-fade-in max-w-4xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Видео</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
          Видеолекции, выступления на конференциях, доклады и интервью.
        </p>
      </header>

      {/* Year Filter */}
      {years.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={() => setSelectedYear(null)}
            className={`text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 border transition-colors ${
              selectedYear === null
                ? 'bg-black text-white border-black'
                : 'bg-transparent text-gray-600 border-gray-300 hover:border-gray-600 hover:text-black'
            }`}
          >
            Все
          </button>
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 border transition-colors ${
                selectedYear === year
                  ? 'bg-black text-white border-black'
                  : 'bg-transparent text-gray-600 border-gray-300 hover:border-gray-600 hover:text-black'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-24">
        {filteredMedia.map(item => {
          const itemYear = new Date(item.date).getFullYear();
          return (
            <div key={item._id} className="space-y-8 pb-16 border-b border-gray-200 last:border-0">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">{item.type}</span>
                  <span className="w-8 h-px bg-gray-300"></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">{itemYear}</span>
                </div>
                <h3 className="text-3xl font-serif font-bold text-black leading-tight">
                  {item.title}
                </h3>
                <p className="text-base text-gray-700 font-normal leading-relaxed max-w-2xl italic">
                  &laquo;{item.description}&raquo;
                </p>
              </div>

              {/* YouTube Embed */}
              {item.videoUrl && (
                <div className="relative aspect-video w-full bg-black shadow-lg">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${item.videoUrl}`}
                    title={item.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <div className="flex items-center gap-6">
                {item.videoUrl && (
                  <a
                    href={`https://youtube.com/watch?v=${item.videoUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
                  >
                    Смотреть на YouTube <ExternalLink size={12} className="ml-2" />
                  </a>
                )}
              </div>
            </div>
          );
        })}

        {filteredMedia.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            Нет видео за выбранный период.
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
