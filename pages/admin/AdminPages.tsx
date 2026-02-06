
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Save, User, Globe, Info } from 'lucide-react';

const AdminPages: React.FC = () => {
  const profiles = useQuery(api.profile.getProfiles);
  const updateProfile = useMutation(api.profile.updateProfile);
  const sessionToken = localStorage.getItem('admin_session_token') || '';

  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    extendedBio: '',
    email: '',
    university: '',
    location: '',
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'contact'>('profile');

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      const p = profiles[selectedProfileIndex];
      if (p) {
        setProfile({
          name: p.name,
          title: p.title,
          bio: p.bio,
          extendedBio: p.extendedBio,
          email: p.email,
          university: p.university,
          location: p.location,
        });
      }
    }
  }, [profiles, selectedProfileIndex]);

  const handleSave = async () => {
    if (!profiles || profiles.length === 0) return;
    const currentProfile = profiles[selectedProfileIndex];
    if (!currentProfile) return;

    await updateProfile({
      sessionToken,
      id: currentProfile._id,
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      extendedBio: profile.extendedBio,
      email: profile.email,
      university: profile.university,
      location: profile.location,
    });
    alert('Данные профиля обновлены.');
  };

  if (profiles === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Selector */}
      {profiles && profiles.length > 1 && (
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
          {profiles.map((p, idx) => (
            <button
              key={p._id}
              onClick={() => setSelectedProfileIndex(idx)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                selectedProfileIndex === idx ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p.name.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={14} /> Профиль
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'about' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Info size={14} /> Биография
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'contact' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe size={14} /> Контакты
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8">
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Полное имя</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Учёное звание</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.title}
                  onChange={e => setProfile({...profile, title: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Краткая биография</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none resize-none"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 italic">Отображается на главной странице. Старайтесь быть краткими.</p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Расширенная биография</label>
              <textarea
                rows={10}
                className="w-full px-4 py-4 border border-slate-200 rounded-md focus:border-blue-600 outline-none font-serif text-lg leading-relaxed"
                value={profile.extendedBio}
                onChange={e => setProfile({...profile, extendedBio: e.target.value})}
              />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Электронная почта</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Университет</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.university}
                  onChange={e => setProfile({...profile, university: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Местоположение</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.location}
                  onChange={e => setProfile({...profile, location: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-sm rounded-md hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10"
          >
            <Save size={18} /> Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
