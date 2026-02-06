
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static mock auth
    if (password === 'academic2024') {
      onLogin();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid academic credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-sm shadow-2xl">
        <div className="text-center">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Lock size={28} />
           </div>
           <h1 className="text-2xl font-serif font-bold text-slate-900">CMS Authentication</h1>
           <p className="text-slate-500 mt-2 text-sm font-medium">Please enter the administrative access key to manage the research portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-widest text-slate-400">Access Key</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-slate-200 border-2 rounded-md outline-none focus:border-blue-600 transition-all text-center tracking-[0.5em]"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-md text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-md hover:bg-black transition-all shadow-xl"
          >
            Access Dashboard
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest transition-all"
          >
            <ArrowLeft size={14} className="mr-1" /> Return to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
