
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, Video, FileEdit, Settings, LogOut, User } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const navItems = [
    { name: 'Панель', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Книги', path: '/admin/books', icon: Book },
    { name: 'Медиа', path: '/admin/media', icon: Video },
    { name: 'Контент сайта', path: '/admin/pages', icon: FileEdit },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings size={20} className="text-blue-400" /> Bilig CMS
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all ${
                isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
           <div className="flex items-center gap-3 px-4">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
               <User size={16} />
             </div>
             <div className="text-xs">
               <p className="font-bold">Администратор</p>
               <p className="text-slate-500">Bilig</p>
             </div>
           </div>
           <button
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-md transition-all"
           >
             <LogOut size={18} />
             <span className="font-medium">Выход</span>
           </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
           <h2 className="font-bold text-slate-700">
             {navItems.find(n => isActive(n.path))?.name || 'Админ'}
           </h2>
           <div className="flex items-center gap-4">
             <Link to="/" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-sm transition-all">
               Перейти на сайт
             </Link>
           </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
