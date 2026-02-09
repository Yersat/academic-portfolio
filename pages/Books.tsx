
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { ShoppingCart, ArrowRight, FileText } from 'lucide-react';

const Books: React.FC = () => {
  const books = useQuery(api.books.listPublished);

  if (books === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KZT') {
      return `${price.toLocaleString('ru-RU')} ₸`;
    }
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <div className="space-y-24 animate-fade-in max-w-3xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Библиотека</h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto font-bold uppercase tracking-[0.2em]">
          Монографии и научные труды
        </p>
      </header>

      <div className="space-y-32">
        {(books || []).map(book => (
          <div key={book._id} className="group grid md:grid-cols-5 gap-16 items-start">
            <div className="md:col-span-2">
              <Link to={`/books/${book._id}`}>
                <div className="relative overflow-hidden bg-white shadow-md transition-all duration-700 group-hover:shadow-2xl">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-auto transition-all duration-700"
                  />
                </div>
              </Link>
            </div>

            <div className="md:col-span-3 space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
                  {book.publisher} — {book.year}
                </span>
                <Link to={`/books/${book._id}`}>
                  <h2 className="text-3xl font-serif font-bold leading-tight group-hover:text-gray-700 transition-colors text-black">
                    {book.title}
                  </h2>
                </Link>
              </div>

              <p className="text-base text-gray-700 leading-relaxed font-normal italic">
                {book.description}
              </p>

              {/* PDF Price Badge */}
              {book.pdfPrice && book.pdfPrice > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-bold shadow-sm">
                  <FileText size={14} />
                  PDF: {formatPrice(book.pdfPrice, book.pdfCurrency || 'KZT')}
                </div>
              )}

              <div className="flex flex-col space-y-4 pt-6">
                {/* Litres link */}
                {book.litresUrl && (
                  <a
                    href={book.litresUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-[10px] font-bold uppercase tracking-[0.25em] text-black hover:text-gray-600 transition-colors border-b border-gray-200 pb-2 w-fit"
                  >
                    <ShoppingCart size={12} className="mr-3" /> Купить на Литрес
                  </a>
                )}

                <Link
                  to={`/books/${book._id}`}
                  className="flex items-center text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 hover:text-black transition-colors pt-2"
                >
                  Подробнее <ArrowRight size={12} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;
