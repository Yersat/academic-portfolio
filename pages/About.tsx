
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Download, ArrowRight, ExternalLink } from 'lucide-react';
import RichTextDisplay from '../components/RichTextDisplay';

const About: React.FC = () => {
  const profile = useQuery(api.profile.getProfile);

  if (profile === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }
  if (!profile) {
    return <div className="text-center py-20 text-gray-400">Профиль не найден</div>;
  }

  return (
    <div className="space-y-24 animate-fade-in max-w-2xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Автор</h1>
      </header>

      <div className="space-y-20">
        {/* 1. Биография */}
        <section className="space-y-8">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Биография</h4>
          <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
            <RichTextDisplay content={profile.extendedBio} />
          </div>
          {profile.cvUrl && (
            <div className="pt-4">
              <a
                href={profile.cvUrl}
                className="inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b-2 border-black pb-2 hover:text-gray-600 hover:border-gray-400 transition-all"
              >
                <Download size={14} /> Скачать CV (PDF)
              </a>
            </div>
          )}
        </section>

        {/* 2. Список публикаций */}
        {profile.publications && (
          <section className="space-y-8 pt-16 border-t border-gray-200">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Список публикаций</h4>
            <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
              <RichTextDisplay content={profile.publications} />
            </div>
          </section>
        )}

        {/* 3. Научные направления */}
        {profile.researchDirections && (
          <section className="space-y-8 pt-16 border-t border-gray-200">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Научные направления</h4>
            <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
              <RichTextDisplay content={profile.researchDirections} />
            </div>
          </section>
        )}

        {/* 4. Индексация и профили */}
        {profile.indexingProfiles && profile.indexingProfiles.length > 0 && (
          <section className="space-y-8 pt-16 border-t border-gray-200">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Индексация и профили</h4>
            <div className="space-y-4">
              {profile.indexingProfiles.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-black transition-colors shrink-0" />
                  <span className="text-sm font-bold text-black group-hover:text-gray-600 transition-colors border-b border-transparent group-hover:border-gray-400">
                    {item.name}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 5. Награды и признание */}
        {profile.awards && (
          <section className="space-y-8 pt-16 border-t border-gray-200">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Награды и признание</h4>
            <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
              <RichTextDisplay content={profile.awards} />
            </div>
          </section>
        )}

        {/* Link to Co-authors page */}
        <div className="pt-16 border-t border-gray-200">
          <Link
            to="/co-authors"
            className="group flex items-center justify-between p-6 bg-white border border-gray-100 hover:border-black transition-all"
          >
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 group-hover:text-black mb-2 transition-colors">Со-авторы</h4>
              <p className="text-sm font-serif italic text-black">Информация о со-авторах научных работ и публикаций.</p>
            </div>
            <ArrowRight size={16} className="text-gray-400 group-hover:text-black transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
