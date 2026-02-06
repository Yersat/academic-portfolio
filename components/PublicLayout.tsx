
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const PublicLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Главная', path: '/' },
    { name: 'Об авторах', path: '/about' },
    { name: 'Книги', path: '/books' },
    { name: 'Лекции', path: '/media' },
    { name: 'Публикации', path: '/research' },
    { name: 'Контакты', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#000000] selection:bg-gray-300">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fbfaf8]/95 backdrop-blur-md border-b border-gray-300 py-4">
        <div className="max-w-4xl mx-auto px-6 md:px-0 flex justify-center items-center">
          <div className="hidden md:flex space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all hover:text-black ${
                  isActive(item.path) ? 'text-black border-b-2 border-black' : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex w-full justify-between items-center">
             <Link to="/" className="text-sm font-serif font-bold italic text-black">Bilig</Link>
             <button
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="flex items-center space-x-2 text-[11px] uppercase tracking-[0.2em] font-bold text-black"
             >
               {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#fbfaf8] border-b border-gray-300 py-6 px-6 space-y-4 text-center animate-fade-in shadow-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block text-[11px] uppercase tracking-[0.2em] font-bold py-2 ${
                  isActive(item.path) ? 'text-black' : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Header Section */}
      <header className="relative w-full">
        <div className="w-full h-56 md:h-72 overflow-hidden relative bg-gray-900">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbfaf8]"></div>
        </div>

        {/* Brand Identity */}
        <div className="max-w-4xl mx-auto px-6 md:px-0 -mt-24 md:-mt-28 relative z-10 flex flex-col items-center">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-black tracking-tight mb-4">
              Bilig
            </h1>
            <p className="text-sm text-black font-bold uppercase tracking-[0.3em]">
              Аязбеков Скандарбек &middot; Аязбекова Сабина
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-300 text-center text-[11px] text-black uppercase tracking-[0.15em] font-bold">
        <p>&copy; {new Date().getFullYear()} Bilig &mdash; Аязбеков С.А. &amp; Аязбекова С.Ш.</p>
        <div className="mt-6 opacity-60 hover:opacity-100 transition-opacity flex justify-center space-x-8">
          <Link to="/admin" className="hover:underline">Управление сайтом</Link>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
