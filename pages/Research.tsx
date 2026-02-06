
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { FileText } from 'lucide-react';

const Research: React.FC = () => {
  const research = useQuery(api.profile.listResearch);

  if (research === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-20 animate-fade-in max-w-3xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Research & Articles</h1>
        <p className="text-lg text-gray-700 max-w-xl mx-auto font-normal leading-relaxed">
          A selection of peer-reviewed articles and working papers focusing on structural linguistics.
        </p>
      </header>

      <div className="space-y-16">
        {(research || []).map(paper => (
          <article key={paper._id} className="group space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  {paper.year} • {paper.journal}
                </span>
                <h2 className="text-2xl font-serif font-bold text-black leading-tight group-hover:underline underline-offset-4 decoration-1">
                  {paper.title}
                </h2>
                <p className="text-xs text-gray-600 font-bold italic">with {paper.authors}</p>
              </div>
            </div>

            <div className="prose prose-sm text-gray-700 font-normal leading-relaxed max-w-2xl">
               <p>{paper.abstract}</p>
            </div>

            <div className="flex items-center gap-8 pt-2">
              <button className="flex items-center text-xs font-bold uppercase tracking-widest text-black hover:text-gray-600 transition-colors">
                <FileText size={14} className="mr-2" /> Download PDF
              </button>
              <button className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black transition-colors">
                Journal Link
              </button>
            </div>

            <div className="pt-8 border-b border-gray-200 w-24"></div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Research;
