
import React from 'react';
import { MediaItem } from '../types';
import { ExternalLink } from 'lucide-react';

interface MediaProps {
  media: MediaItem[];
}

const Media: React.FC<MediaProps> = ({ media }) => {
  const publishedMedia = media.filter(m => m.status === 'published');

  return (
    <div className="space-y-20 animate-fade-in max-w-4xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Lectures & Media</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
          Recordings of conference talks, keynote presentations, and interviews.
        </p>
      </header>

      <div className="space-y-24">
        {publishedMedia.map(item => (
          <div key={item.id} className="space-y-8 pb-16 border-b border-gray-200 last:border-0">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">{item.type}</span>
                <span className="w-8 h-px bg-gray-300"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">{new Date(item.date).getFullYear()}</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-black leading-tight">
                {item.title}
              </h3>
              <p className="text-base text-gray-700 font-normal leading-relaxed max-w-2xl italic">
                "{item.description}"
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
               <button className="flex items-center text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1">
                 Full Transcript
               </button>
               <a 
                href={`https://youtube.com/watch?v=${item.videoUrl}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
               >
                 View on YouTube <ExternalLink size={12} className="ml-2" />
               </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Media;
