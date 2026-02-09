
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { ArrowLeft, FileText } from 'lucide-react';
import RichTextDisplay from '../components/RichTextDisplay';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const articleId = id as Id<"researchPapers">;
  const paper = useQuery(api.profile.getResearchById, id ? { id: articleId } : "skip");

  if (paper === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  if (!paper) {
    return (
      <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
        <Link to="/articles" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Назад к статьям
        </Link>
        <div className="text-center py-20 text-gray-400">Статья не найдена</div>
      </div>
    );
  }

  const renderContentBlocks = () => {
    if (!paper.contentBlocks || paper.contentBlocks.length === 0) {
      return (
        <div className="prose prose-lg prose-slate max-w-none">
          <RichTextDisplay content={paper.abstract} className="text-lg text-gray-800 leading-relaxed" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {paper.contentBlocks.map((block, index) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <div key={index} className="text-lg text-gray-800 leading-relaxed mb-6">
                  <RichTextDisplay content={block.text || ''} />
                </div>
              );
            case 'heading': {
              const level = block.level || 2;
              if (level === 3) {
                return (
                  <h3 key={index} className="text-xl font-serif font-bold text-black mt-12 mb-4">
                    {block.text}
                  </h3>
                );
              }
              return (
                <h2 key={index} className="text-2xl font-serif font-bold text-black mt-16 mb-6">
                  {block.text}
                </h2>
              );
            }
            case 'image': {
              const imageUrl = (block as any).imageUrl;
              if (!imageUrl) return null;
              return (
                <figure key={index} className="my-10">
                  <img
                    src={imageUrl}
                    alt={block.imageCaption || ''}
                    className="w-full rounded-sm shadow-md"
                  />
                  {block.imageCaption && (
                    <figcaption className="text-sm text-gray-500 italic mt-3 text-center">
                      {block.imageCaption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            case 'quote':
              return (
                <div key={index} className="border-l-4 border-gray-300 pl-6 italic text-gray-600 my-8">
                  <RichTextDisplay content={block.text || ''} />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      <Link to="/articles" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Назад к статьям
      </Link>

      <header className="space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
          {paper.year}{paper.journal ? ` \u2022 ${paper.journal}` : ''}
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-black">
          {paper.title}
        </h1>
        <p className="text-sm text-gray-600 font-bold italic">
          {paper.authors}
        </p>
      </header>

      {/* Abstract */}
      <section className="space-y-4 pb-10 border-b border-gray-200">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Аннотация</h4>
        <RichTextDisplay content={paper.abstract} className="text-lg text-gray-700 leading-relaxed italic" />
      </section>

      {/* Content Blocks */}
      {paper.contentBlocks && paper.contentBlocks.length > 0 && (
        <section className="pb-10">
          {renderContentBlocks()}
        </section>
      )}

      {/* File Download */}
      {((paper as any).fileUrl || paper.pdfUrl) && (
        <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-6">
          {(paper as any).fileUrl && (
            <a
              href={(paper as any).fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b-2 border-black pb-2 hover:text-gray-600 hover:border-gray-400 transition-all"
            >
              <FileText size={14} /> Скачать файл
            </a>
          )}
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b-2 border-black pb-2 hover:text-gray-600 hover:border-gray-400 transition-all"
            >
              <FileText size={14} /> Скачать PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
