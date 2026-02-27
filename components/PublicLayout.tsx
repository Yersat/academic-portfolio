
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const PublicLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const profile = useQuery(api.profile.getProfile);

  const navItems = [
    { name: 'Главная', path: '/' },
    { name: 'Автор', path: '/about' },
    { name: 'Со-авторы', path: '/co-authors' },
    { name: 'Книги', path: '/books' },
    { name: 'Уч. издания', path: '/textbooks' },
    { name: 'Статьи', path: '/articles' },
    { name: 'Видео', path: '/videos' },
    { name: 'Фотогаллерея', path: '/gallery' },
    { name: 'Контакты', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const profileTitle = profile?.title || '';
  const profileUniversity = profile?.university || '';

  // Use uploaded photo from Convex storage, fallback to static file
  const profilePhotoSrc = profile?.profilePhotoUrl || '/profile-sabina.jpg';
  const coverPhotoSrc = profile?.coverPhotoUrl || '/cover-photo.jpg';
  const photoPosition = profile?.profilePhotoPosition || 'center';

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#000000] selection:bg-gray-300">
      {/* Absolute Top Navigation */}
      <nav className="sticky top-0 z-50 bg-[#fbfaf8]/95 backdrop-blur-md border-b border-gray-300 py-4">
        <div className="max-w-5xl mx-auto px-6 md:px-4 flex justify-center items-center">
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[10px] uppercase tracking-[0.15em] font-bold transition-all hover:text-black ${
                  isActive(item.path) ? 'text-black border-b-2 border-black' : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex w-full justify-between items-center">
             <Link to="/" className="text-sm font-serif font-bold italic text-black">Аязбекова Сабина</Link>
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
        {/* Cover Image */}
        <div className="w-full h-56 md:h-72 overflow-hidden relative bg-gray-900">
          <img
            src={coverPhotoSrc}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fbfaf8]"></div>
        </div>

        {/* Profile Identity */}
        <div className="max-w-4xl mx-auto px-6 md:px-0 -mt-24 md:-mt-32 relative z-10 flex flex-col items-center">
          <div className="mb-6 flex justify-center">
            <img
              src={profilePhotoSrc}
              alt="Аязбекова Сабина"
              className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover shadow-2xl border-[5px] border-[#fbfaf8] bg-white"
              style={{ objectPosition: photoPosition }}
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-black tracking-tight mb-3">
              Аязбекова Сабина
            </h1>
            <p className="text-sm text-black font-bold uppercase tracking-[0.3em]">
              {profileTitle}
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
        <p>&copy; {new Date().getFullYear()} Аязбекова Сабина — {profileUniversity}</p>
        <p className="mt-3 text-[10px] opacity-50">
          Made by <a href="https://www.fastdev.org/services/personal-sites" target="_blank" rel="noopener noreferrer" className="hover:underline">FastDev, LLC</a>
        </p>
        <div className="mt-6 opacity-60 hover:opacity-100 transition-opacity flex justify-center space-x-8">
          <Link to="/admin" className="hover:underline">Панель управления</Link>
          <Link to="/privacy" className="hover:underline">Политика конфиденциальности</Link>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
