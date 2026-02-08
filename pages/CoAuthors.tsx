
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { ExternalLink } from 'lucide-react';

const CoAuthors: React.FC = () => {
  const coAuthors = useQuery(api.coAuthors.listPublished);

  if (coAuthors === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  if (!coAuthors || coAuthors.length === 0) {
    return (
      <div className="space-y-20 animate-fade-in max-w-3xl mx-auto">
        <header className="space-y-6 text-center">
          <h1 className="text-4xl font-serif font-bold italic text-black">Со-авторы</h1>
          <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
            Коллеги и соавторы научных работ.
          </p>
        </header>
        <div className="text-center py-16 text-gray-400">
          Информация о соавторах пока не добавлена.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20 animate-fade-in max-w-3xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Со-авторы</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
          Коллеги и соавторы научных работ и исследований.
        </p>
      </header>

      <div className="space-y-24">
        {coAuthors.map(coAuthor => (
          <div key={coAuthor._id} className="space-y-12 pb-16 border-b border-gray-200 last:border-0">
            {/* Photo + Name */}
            <div className="flex flex-col md:flex-row items-start gap-8">
              {coAuthor.photoUrl ? (
                <img
                  src={coAuthor.photoUrl}
                  alt={coAuthor.name}
                  className="w-28 h-28 rounded-full object-cover shrink-0 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 shrink-0 flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold text-gray-400">
                    {coAuthor.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold text-black leading-tight">
                  {coAuthor.name}
                </h2>
                {coAuthor.title && (
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">
                    {coAuthor.title}
                  </p>
                )}
              </div>
            </div>

            {/* 1. Биография */}
            {coAuthor.bio && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Биография</h4>
                <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
                  <p>{coAuthor.bio}</p>
                </div>
              </section>
            )}

            {/* 2. Список публикаций */}
            {coAuthor.publications && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Список публикаций</h4>
                <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
                  <p className="whitespace-pre-wrap">{coAuthor.publications}</p>
                </div>
              </section>
            )}

            {/* 3. Научные направления */}
            {coAuthor.researchDirections && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Научные направления</h4>
                <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
                  <p className="whitespace-pre-wrap">{coAuthor.researchDirections}</p>
                </div>
              </section>
            )}

            {/* 4. Индексация и профили */}
            {coAuthor.indexingProfiles && coAuthor.indexingProfiles.length > 0 && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Индексация и профили</h4>
                <div className="space-y-3">
                  {coAuthor.indexingProfiles.map((item, i) => (
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
            {coAuthor.awards && (
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Награды и признание</h4>
                <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
                  <p className="whitespace-pre-wrap">{coAuthor.awards}</p>
                </div>
              </section>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoAuthors;
