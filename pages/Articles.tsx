
import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Articles: React.FC = () => {
  const research = useQuery(api.profile.listResearch);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const years = useMemo(() => {
    if (!research) return [];
    const yearSet = new Set<string>();
    research.forEach(paper => {
      if (paper.year) yearSet.add(paper.year);
    });
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [research]);

  const filteredResearch = useMemo(() => {
    if (!research) return [];
    if (selectedYear === null) return research;
    return research.filter(paper => paper.year === selectedYear);
  }, [research, selectedYear]);

  if (research === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  const YearFilterButtons = ({ className }: { className?: string }) => (
    <div className={className}>
      <button
        onClick={() => setSelectedYear(null)}
        className={`block w-full text-left text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-2 transition-colors ${
          selectedYear === null
            ? 'text-black border-l-2 border-black'
            : 'text-gray-400 hover:text-black border-l-2 border-transparent'
        }`}
      >
        Все
      </button>
      {years.map(year => (
        <button
          key={year}
          onClick={() => setSelectedYear(year)}
          className={`block w-full text-left text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-2 transition-colors ${
            selectedYear === year
              ? 'text-black border-l-2 border-black'
              : 'text-gray-400 hover:text-black border-l-2 border-transparent'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );

  const MobileYearFilter = () => (
    <div className="flex overflow-x-auto gap-3 pb-2 md:hidden">
      <button
        onClick={() => setSelectedYear(null)}
        className={`text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 border whitespace-nowrap transition-colors ${
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
          className={`text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 border whitespace-nowrap transition-colors ${
            selectedYear === year
              ? 'bg-black text-white border-black'
              : 'bg-transparent text-gray-600 border-gray-300 hover:border-gray-600 hover:text-black'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-20 animate-fade-in max-w-5xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Статьи</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
          Рецензируемые научные статьи и исследовательские работы в области культурологии и философии.
        </p>
      </header>

      {/* Mobile Year Filter */}
      <MobileYearFilter />

      {/* Desktop: sidebar + content */}
      <div className="flex gap-16">
        {/* Desktop Year Sidebar */}
        <YearFilterButtons className="hidden md:block w-48 shrink-0 space-y-1" />

        {/* Articles List */}
        <div className="flex-1 space-y-16">
          {filteredResearch.map(paper => (
            <Link
              key={paper._id}
              to={'/articles/' + paper._id}
              className="block group"
            >
              <article className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                    {paper.year}{paper.journal ? ` \u2022 ${paper.journal}` : ''}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-black leading-tight group-hover:underline underline-offset-4 decoration-1">
                    {paper.title}
                  </h2>
                  <p className="text-xs text-gray-600 font-bold italic">
                    {paper.authors}
                  </p>
                </div>

                <div className="prose prose-sm text-gray-700 font-normal leading-relaxed max-w-2xl">
                  <p className="line-clamp-3">{paper.abstract}</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <FileText size={14} className="text-gray-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                    Читать далее
                  </span>
                </div>

                <div className="pt-8 border-b border-gray-200 w-24"></div>
              </article>
            </Link>
          ))}

          {filteredResearch.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              Нет статей за выбранный период.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Articles;
