
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

        {/* Payment method logos */}
        <div className="mt-6 flex justify-center items-center space-x-4">
          {/* Visa */}
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
            <svg viewBox="0 0 780 500" className="w-full h-full">
              <path d="M293.2 348.73l33.36-195.76h53.35l-33.38 195.76H293.2zm246.11-191.54c-10.57-3.97-27.16-8.21-47.89-8.21-52.83 0-90.07 26.58-90.33 64.65-.27 28.14 26.52 43.84 46.76 53.2 20.78 9.58 27.76 15.71 27.67 24.27-.14 13.11-16.58 19.1-31.93 19.1-21.37 0-32.69-2.97-50.23-10.28l-6.88-3.11-7.49 43.87c12.46 5.46 35.52 10.2 59.47 10.44 56.16 0 92.63-26.27 93.01-66.94.19-22.31-14.04-39.29-44.84-53.3-18.67-9.08-30.12-15.14-30.01-24.35 0-8.16 9.68-16.87 30.62-16.87 17.47-.27 30.13 3.53 39.98 7.5l4.79 2.26 7.25-42.23h-.01zm137.31-4.22h-41.32c-12.81 0-22.39 3.49-28.02 16.25l-79.49 179.51h56.17s9.16-24.13 11.25-29.43l68.48.07c1.6 6.86 6.5 29.36 6.5 29.36h49.64l-43.29-195.76h.08zM627.51 299c4.42-11.29 21.29-54.78 21.29-54.78-.31.52 4.39-11.33 7.08-18.67l3.61 16.87s10.24 46.75 12.38 56.58h-44.36zM247.71 152.97L195.2 290.4l-5.62-27.22c-9.77-31.38-40.2-65.39-74.27-82.38l47.89 171.84 56.56-.07 84.13-199.59h-56.18z" fill="#1a1f71"/>
              <path d="M146.92 152.96H60.88l-.68 4.07c67.09 16.23 111.47 55.41 129.87 102.49l-18.73-89.96c-3.23-12.37-12.59-16.17-24.42-16.6z" fill="#f9a533"/>
            </svg>
          </div>
          {/* Mastercard */}
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1">
            <svg viewBox="0 0 780 500" className="w-full h-full">
              <circle cx="312" cy="250" r="180" fill="#eb001b"/>
              <circle cx="468" cy="250" r="180" fill="#f79e1b"/>
              <path d="M390 100.22c48.37 38.49 79.33 97.76 79.33 164.03 0 66.28-30.96 125.55-79.33 164.04C341.63 389.8 310.67 330.53 310.67 264.25c0-66.27 30.96-125.54 79.33-164.03z" fill="#ff5f00"/>
            </svg>
          </div>
          {/* Apple Pay */}
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1.5">
            <svg viewBox="0 0 165.521 105.965" className="w-full h-full">
              <path d="M150.698 0H14.823c-.566 0-1.133 0-1.698.003-.477.004-.953.009-1.43.022-1.039.028-2.085.09-3.113.274a10.19 10.19 0 0 0-2.958.975 9.89 9.89 0 0 0-2.53 1.89 9.86 9.86 0 0 0-1.886 2.535 10.18 10.18 0 0 0-.975 2.953c-.186 1.028-.249 2.075-.277 3.118-.013.477-.016.953-.021 1.43C0 13.767 0 14.333 0 14.9v76.164c0 .567 0 1.132.003 1.699.005.476.008.953.021 1.43.028 1.042.091 2.089.277 3.117a10.2 10.2 0 0 0 .975 2.954 9.78 9.78 0 0 0 1.886 2.534 9.95 9.95 0 0 0 2.53 1.89 10.18 10.18 0 0 0 2.958.975c1.028.184 2.074.246 3.113.274.477.013.953.017 1.43.021.565.003 1.132.003 1.698.003h135.875c.565 0 1.132 0 1.697-.003.477-.004.953-.008 1.431-.021 1.038-.028 2.085-.09 3.113-.274a10.28 10.28 0 0 0 2.958-.975 9.95 9.95 0 0 0 2.535-1.89 9.93 9.93 0 0 0 1.886-2.534 10.12 10.12 0 0 0 .98-2.954c.185-1.028.249-2.075.277-3.117.011-.477.016-.954.019-1.43.004-.567.004-1.132.004-1.699V14.9c0-.567 0-1.133-.004-1.699a63.067 63.067 0 0 0-.019-1.43c-.028-1.043-.092-2.09-.277-3.118a10.17 10.17 0 0 0-.98-2.953 9.93 9.93 0 0 0-1.886-2.535 9.96 9.96 0 0 0-2.535-1.89 10.3 10.3 0 0 0-2.958-.975c-1.028-.184-2.075-.246-3.113-.274a60.09 60.09 0 0 0-1.431-.022C151.83 0 151.263 0 150.698 0z" fill="#000"/>
              <path d="M150.698 3.532l1.672.003c.452.003.905.008 1.36.02.793.022 1.719.065 2.583.22.75.136 1.38.352 1.984.642a6.47 6.47 0 0 1 1.645 1.228 6.44 6.44 0 0 1 1.226 1.645c.289.6.506 1.236.641 1.985.157.878.2 1.801.222 2.583.012.454.016.909.02 1.386.003.541.003 1.083.003 1.626v76.164c0 .544 0 1.084-.003 1.63-.004.463-.008.916-.02 1.386-.022.782-.065 1.705-.222 2.578a6.58 6.58 0 0 1-.641 1.99 6.47 6.47 0 0 1-1.226 1.644 6.42 6.42 0 0 1-1.645 1.228 6.59 6.59 0 0 1-1.984.641c-.864.157-1.79.198-2.583.221-.455.012-.908.016-1.381.02-.541.003-1.083.003-1.651.003H14.801c-.014 0-.028 0-.041 0-.554 0-1.097 0-1.651-.003-.46-.004-.912-.008-1.382-.02-.793-.023-1.72-.064-2.571-.221a6.59 6.59 0 0 1-1.99-.641 6.42 6.42 0 0 1-1.645-1.228 6.42 6.42 0 0 1-1.228-1.644 6.57 6.57 0 0 1-.642-1.99c-.156-.86-.2-1.796-.221-2.578-.013-.467-.016-.924-.02-1.399-.004-.541-.004-1.083-.004-1.625V14.87c0-.543 0-1.085.004-1.639.004-.462.007-.917.02-1.373.021-.782.065-1.718.221-2.583.136-.75.353-1.385.642-1.985a6.44 6.44 0 0 1 1.228-1.645 6.47 6.47 0 0 1 1.645-1.228 6.6 6.6 0 0 1 1.99-.642c.852-.155 1.778-.198 2.571-.22.467-.012.922-.017 1.382-.02L14.823 3.532h135.875" fill="#fff"/>
              <g fill="#000">
                <path d="M43.508 35.77c1.404-1.755 2.356-4.112 2.105-6.52-2.054.102-4.56 1.355-6.012 3.112-1.303 1.504-2.456 3.959-2.156 6.266 2.306.2 4.61-1.152 6.063-2.858"/>
                <path d="M45.587 39.079c-3.35-.2-6.196 1.9-7.795 1.9-1.6 0-4.049-1.8-6.698-1.751-3.449.05-6.648 2-8.398 5.1-3.6 6.2-1 15.375 2.549 20.425 1.7 2.5 3.749 5.25 6.448 5.15 2.55-.1 3.549-1.65 6.648-1.65 3.1 0 3.999 1.65 6.698 1.6 2.8-.05 4.549-2.5 6.249-5 1.95-2.85 2.749-5.6 2.799-5.75-.05-.05-5.399-2.1-5.449-8.25-.05-5.15 4.199-7.6 4.399-7.75-2.4-3.55-6.149-3.95-7.45-4.025"/>
                <path d="M78.511 32.11c7.95 0 13.475 5.475 13.475 13.45s-5.625 13.5-13.625 13.5h-8.8v13.975h-6.55V32.11h15.5zm-8.95 21.75h7.3c5.525 0 8.675-2.975 8.675-8.3 0-5.325-3.15-8.275-8.65-8.275h-7.325v16.575z"/>
                <path d="M94.186 62.36c0-5.45 4.175-8.8 11.575-9.2l8.525-.5v-2.4c0-3.475-2.35-5.575-6.275-5.575-3.725 0-6.075 1.85-6.65 4.675h-5.95c.375-5.675 5.2-9.875 12.775-9.875 7.5 0 12.3 3.95 12.3 10.15v21.225h-6.075v-5.075h-.15c-1.8 3.45-5.7 5.575-9.75 5.575-6.05 0-10.325-3.725-10.325-9zm20.1-2.75v-2.45l-7.675.475c-3.825.25-5.975 1.85-5.975 4.5 0 2.7 2.225 4.475 5.625 4.475 4.425 0 8.025-3.05 8.025-7z"/>
                <path d="M124.261 79.81v-5.15c.45.1 1.475.15 1.925.15 2.75 0 4.275-1.15 5.2-4.125l.55-1.8-11.85-32.775h6.85l8.475 27.225h.125l8.475-27.225h6.7l-12.25 34.075c-2.8 7.85-6.025 10.375-12.8 10.375-.45 0-1.475-.05-1.925-.1l-.475-.65z"/>
              </g>
            </svg>
          </div>
          {/* Google Pay */}
          <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center p-1.5">
            <svg viewBox="0 0 435.97 173.13" className="w-full h-full">
              <path d="M206.2 84.58v50.75h-16.1V3h42.7a38.61 38.61 0 0 1 27.65 10.85A34.88 34.88 0 0 1 272 41.47a35.15 35.15 0 0 1-11.55 27.26 38.18 38.18 0 0 1-27.65 11.19h-26.6zm0-65.28v49h27.12a21.69 21.69 0 0 0 16.48-7 23 23 0 0 0 .35-32.55 22.36 22.36 0 0 0-16.83-9.45H206.2z" fill="#5f6368"/>
              <path d="M309.1 46.78c11.9 0 21.26 3.15 28.18 9.45s10.36 14.87 10.36 25.72v52h-15.4v-11.72h-.7c-6.65 10.15-15.57 15.22-26.6 15.22a36.3 36.3 0 0 1-25-9.1 28.82 28.82 0 0 1-10.36-22.57c0-9.54 3.59-17.12 10.71-22.75s16.83-8.45 29.05-8.45c10.43 0 19 1.93 25.72 5.6v-3.85a19.87 19.87 0 0 0-7.35-15.75 25.42 25.42 0 0 0-17.15-6.47c-9.89 0-17.76 4.2-23.63 12.6l-14.18-8.93c8.57-12.42 21.26-18.62 38.15-18.62zm-22.57 63.7a14.48 14.48 0 0 0 5.95 11.9 21.19 21.19 0 0 0 13.65 4.9 27.63 27.63 0 0 0 19.6-8.4c5.78-5.6 8.58-12.08 8.58-19.43-5.42-4.2-13-6.3-22.57-6.3-6.92 0-12.78 1.75-17.5 5.25-4.9 3.32-7.71 7.52-7.71 12.08z" fill="#5f6368"/>
              <path d="M436 49.78L392.18 173.13H375.56l16.27-35.35-28.88-88h17.5l19.08 61.25h.35L419.7 49.78H436z" fill="#5f6368"/>
              <path d="M141.14 73.64A85.79 85.79 0 0 0 139.9 59H72v27.73h38.89a33.33 33.33 0 0 1-14.38 21.88v17.96h23.21c13.59-12.53 21.42-31.06 21.42-52.93z" fill="#4285f4"/>
              <path d="M72 144.48c19.43 0 35.79-6.38 47.72-17.38l-23.21-17.96c-6.47 4.38-14.78 6.88-24.51 6.88-18.78 0-34.72-12.66-40.42-29.72H7.67v18.55A72 72 0 0 0 72 144.48z" fill="#34a853"/>
              <path d="M31.58 86.3a43.06 43.06 0 0 1 0-27.6V40.15H7.67a72.02 72.02 0 0 0 0 64.7L31.58 86.3z" fill="#fbbc04"/>
              <path d="M72 28.98a39.09 39.09 0 0 1 27.62 10.78l20.55-20.55A69.18 69.18 0 0 0 72 0 72 72 0 0 0 7.67 40.15L31.58 58.7C37.28 41.64 53.22 28.98 72 28.98z" fill="#ea4335"/>
            </svg>
          </div>
        </div>

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
