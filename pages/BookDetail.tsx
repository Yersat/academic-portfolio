
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { ArrowLeft, ShoppingCart, Share2, Info, FileText, ExternalLink } from 'lucide-react';
import PdfCheckoutModal from '../components/PdfCheckoutModal';
import BookPreview from '../components/BookPreview';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const book = useQuery(api.books.getById, id ? { id: id as Id<"books"> } : "skip");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (book === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }
  if (!book) return <Navigate to="/books" />;

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KZT') {
      return `${price.toLocaleString('ru-RU')} ₸`;
    }
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  const hasPdfOption = book.pdfPrice && book.pdfPrice > 0;
  const hasLitresOption = book.litresUrl && book.litresUrl.trim() !== '';

  return (
    <div className="space-y-12">
      <Link to="/books" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Назад к каталогу
      </Link>

      <div className="grid lg:grid-cols-5 gap-16">
        {/* Visual Column */}
        <div className="lg:col-span-2 space-y-8">
          <img src={book.coverImage} alt={book.title} className="w-full shadow-2xl rounded-sm" />

          <div className="bg-white p-6 border border-gray-100 rounded-sm space-y-4">
            <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
              <Info size={14} className="mr-2" /> Информация о издании
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-400 font-medium mb-1">Год</span>
                <span className="font-bold text-gray-700">{book.year}</span>
              </div>
              <div>
                <span className="block text-gray-400 font-medium mb-1">Издательство</span>
                <span className="font-bold text-gray-700">{book.publisher}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-gray-400 font-medium mb-1">ISBN-13</span>
                <span className="font-mono text-gray-600">{book.isbn}</span>
              </div>
            </div>
          </div>

          {/* Purchase Options Card */}
          {(hasPdfOption || hasLitresOption) && (
            <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm space-y-4">
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                <ShoppingCart size={14} className="mr-2" /> Варианты покупки
              </div>

              <div className="space-y-3">
                {/* Litres button */}
                {hasLitresOption && (
                  <a
                    href={book.litresUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-sm hover:border-gray-400 hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink size={18} className="text-gray-400 group-hover:text-gray-700" />
                      <div>
                        <span className="font-bold text-gray-900 text-sm">Купить на Литрес</span>
                        <span className="block text-xs text-gray-500">Электронная и аудиокнига</span>
                      </div>
                    </div>
                    <ArrowLeft size={16} className="rotate-180 text-gray-400 group-hover:text-gray-700" />
                  </a>
                )}

                {/* PDF button */}
                {hasPdfOption && (
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-gray-900 text-white rounded-sm hover:bg-black transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} />
                      <div className="text-left">
                        <span className="font-bold text-sm block">Купить PDF вариант</span>
                        <span className="text-xs text-gray-300">Мгновенная доставка на email</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg">
                      {formatPrice(book.pdfPrice!, book.pdfCurrency || 'KZT')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Book Preview */}
          <BookPreview bookId={book._id} />
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3 space-y-8">
          <header className="space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold leading-tight text-gray-900">{book.title}</h1>
            <p className="text-lg md:text-xl text-gray-500 font-serif italic">"{book.description}"</p>
          </header>

          <div className="prose prose-slate prose-lg max-w-none">
            <h3 className="text-xl font-serif font-bold mb-4">Аннотация</h3>
            <p className="text-gray-700 leading-relaxed font-light">
              {book.abstract}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="p-4 border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-all">
              <Share2 size={20} />
            </button>
          </div>

          {/* Table of Contents */}
          {book.toc && book.toc.length > 0 && (
            <section className="pt-8 border-t border-gray-100 space-y-4">
              <h3 className="text-lg font-serif font-bold">Содержание</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm italic pl-4 font-light">
                {book.toc.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <PdfCheckoutModal
        bookId={book._id}
        bookTitle={book.title}
        pdfPrice={book.pdfPrice}
        pdfCurrency={book.pdfCurrency}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
};

export default BookDetail;
