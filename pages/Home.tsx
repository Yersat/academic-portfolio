
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const profiles = useQuery(api.profile.getProfiles);
  const books = useQuery(api.books.listPublished);

  if (profiles === undefined || books === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  const featuredBooks = (books || []).slice(0, 4);

  return (
    <div className="space-y-24 animate-fade-in max-w-2xl mx-auto">
      {/* Intro Section */}
      <section className="space-y-10">
        <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 space-y-8 text-lg md:text-xl">
          <p className="first-letter:text-7xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-black first-letter:mt-1">
            Академический портал «Bilig» объединяет научные труды и монографии,
            посвящённые цивилизациям Великой Степи, философии музыки, Ботайской культуре
            и культурному наследию Центральной Азии.
          </p>
        </div>
      </section>

      {/* Professors Section */}
      {profiles && profiles.length > 0 && (
        <section className="space-y-12 pt-12 border-t border-gray-200">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Авторы</h3>
          <div className="grid sm:grid-cols-2 gap-12">
            {profiles.map((profile) => (
              <div key={profile._id} className="space-y-4">
                <h4 className="text-xl font-serif font-bold text-black leading-tight">
                  {profile.name}
                </h4>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">
                  {profile.title}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {profile.bio}
                </p>
                <div className="pt-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    {profile.researchInterests.slice(0, 3).map((interest: string) => (
                      <span key={interest} className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <Link to="/about" className="text-[10px] uppercase tracking-[0.2em] font-bold text-black border-b border-black pb-1 hover:text-gray-600 hover:border-gray-400 transition-all">
              Подробнее об авторах
            </Link>
          </div>
        </section>
      )}

      {/* Featured Books Preview */}
      <section className="space-y-12 pt-12 border-t border-gray-200">
        <div className="flex justify-between items-end">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500">Избранные публикации</h3>
          <Link to="/books" className="text-[10px] uppercase tracking-[0.2em] font-bold text-black border-b border-black pb-1 hover:text-gray-600 hover:border-gray-400 transition-all">
            Все книги
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-12">
          {featuredBooks.map((book) => (
            <Link key={book._id} to={`/books/${book._id}`} className="group space-y-6">
              <div className="aspect-[3/4] bg-white shadow-lg overflow-hidden relative">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{book.year} — {book.publisher}</p>
                <h4 className="text-xl font-serif font-bold text-black leading-tight group-hover:underline underline-offset-4 decoration-1">
                  {book.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2 italic font-normal">
                  {book.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="pt-12 border-t border-gray-200 grid grid-cols-2 gap-8">
        <Link to="/media" className="group p-6 bg-white border border-gray-100 hover:border-black transition-all">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 group-hover:text-black mb-2 transition-colors">Лекции</h4>
          <p className="text-sm font-serif italic text-black">Записи конференций и публичных выступлений.</p>
        </Link>
        <Link to="/research" className="group p-6 bg-white border border-gray-100 hover:border-black transition-all">
          <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 group-hover:text-black mb-2 transition-colors">Публикации</h4>
          <p className="text-sm font-serif italic text-black">Научные статьи и рецензируемые работы.</p>
        </Link>
      </section>
    </div>
  );
};

export default Home;
