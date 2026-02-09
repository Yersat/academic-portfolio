
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { FileText } from 'lucide-react';

const Textbooks: React.FC = () => {
  const textbooks = useQuery(api.textbooks.listPublished);

  if (textbooks === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-20 animate-fade-in max-w-5xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">
          Учебные и методические издания
        </h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
          Учебные пособия, методические рекомендации и другие образовательные материалы.
        </p>
      </header>

      <div className="space-y-16">
        {(textbooks || []).map(textbook => (
          <article key={textbook._id} className="group space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                {textbook.year}{textbook.publisher ? ` \u2022 ${textbook.publisher}` : ''}
              </span>
              <h2 className="text-2xl font-serif font-bold text-black leading-tight group-hover:underline underline-offset-4 decoration-1">
                {textbook.title}
              </h2>
            </div>

            {textbook.description && (
              <div className="prose prose-sm text-gray-700 font-normal leading-relaxed max-w-2xl">
                <p className="line-clamp-2 text-sm text-gray-600 italic">{textbook.description}</p>
              </div>
            )}

            {textbook.pdfUrl && (
              <a
                href={textbook.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 pt-2"
              >
                <FileText size={14} className="text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                  Читать далее
                </span>
              </a>
            )}

            <div className="pt-8 border-b border-gray-200 w-24"></div>
          </article>
        ))}

        {textbooks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            Нет учебных изданий.
          </div>
        )}
      </div>
    </div>
  );
};

export default Textbooks;
