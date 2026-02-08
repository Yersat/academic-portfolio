
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

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

            {/* Bio */}
            {coAuthor.bio && (
              <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
                <p>{coAuthor.bio}</p>
              </div>
            )}

            {/* CV Timeline */}
            {coAuthor.cvEntries && coAuthor.cvEntries.length > 0 && (
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                  Curriculum Vitae
                </h4>
                <div className="grid gap-12">
                  {coAuthor.cvEntries.map((entry, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-16">
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 w-32 shrink-0">
                        {entry.year}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-black uppercase tracking-wider">
                          {entry.role}
                        </p>
                        <p className="text-sm text-gray-700 font-normal italic">
                          {entry.context}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoAuthors;
