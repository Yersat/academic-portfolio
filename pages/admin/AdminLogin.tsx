
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useMutation(api.auth.adminLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { token } = await login({ password });
      onLogin(token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверные учётные данные');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-sm shadow-2xl">
        <div className="text-center">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Lock size={28} />
           </div>
           <h1 className="text-2xl font-serif font-bold text-slate-900">Авторизация</h1>
           <p className="text-slate-500 mt-2 text-sm font-medium">Введите пароль администратора для доступа к панели управления.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Пароль доступа</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-slate-200 border-2 rounded-md outline-none focus:border-blue-600 transition-all text-center tracking-[0.5em]"
              placeholder="••••••••"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-md text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-md hover:bg-black transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? 'Авторизация...' : 'Войти в панель'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={14} className="mr-1" /> Вернуться на сайт
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
