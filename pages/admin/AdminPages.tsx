
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Save, User, Globe, FileText, Info, Image, Upload, Plus, X } from 'lucide-react';

const AdminPages: React.FC = () => {
  const profileData = useQuery(api.profile.getProfile);
  const updateProfile = useMutation(api.profile.updateProfile);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const getSessionToken = () => {
    const token = localStorage.getItem('admin_session_token');
    if (!token) {
      throw new Error('Сессия не найдена. Пожалуйста, войдите заново.');
    }
    return token;
  };

  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    extendedBio: '',
    email: '',
    university: '',
    location: '',
    profilePhotoPosition: 'center',
    publications: '',
    researchDirections: '',
    indexingProfiles: [] as { name: string; url: string }[],
    awards: '',
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'contact' | 'photos'>('profile');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profileData) {
      setProfile({
        name: profileData.name,
        title: profileData.title,
        bio: profileData.bio,
        extendedBio: profileData.extendedBio,
        email: profileData.email,
        university: profileData.university,
        location: profileData.location,
        profilePhotoPosition: profileData.profilePhotoPosition || 'center',
        publications: profileData.publications || '',
        researchDirections: profileData.researchDirections || '',
        indexingProfiles: profileData.indexingProfiles || [],
        awards: profileData.awards || '',
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    await updateProfile({
      sessionToken: getSessionToken(),
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      extendedBio: profile.extendedBio,
      email: profile.email,
      university: profile.university,
      location: profile.location,
      profilePhotoPosition: profile.profilePhotoPosition,
      publications: profile.publications || undefined,
      researchDirections: profile.researchDirections || undefined,
      indexingProfiles: profile.indexingProfiles.length > 0 ? profile.indexingProfiles : undefined,
      awards: profile.awards || undefined,
    });
    alert('Содержание сайта успешно обновлено.');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({ sessionToken: getSessionToken() });
      const result = await fetch(uploadUrl, { method: 'POST', body: file });
      const { storageId } = await result.json();
      if (type === 'profile') {
        await updateProfile({ sessionToken: getSessionToken(), profilePhotoStorageId: storageId });
      } else {
        await updateProfile({ sessionToken: getSessionToken(), coverPhotoStorageId: storageId });
      }
      alert(type === 'profile' ? 'Фото профиля обновлено' : 'Обложка обновлена');
    } catch (err) {
      alert('Ошибка загрузки');
    }
    setUploading(false);
  };

  const addIndexingProfile = () => {
    setProfile({
      ...profile,
      indexingProfiles: [...profile.indexingProfiles, { name: '', url: '' }],
    });
  };

  const removeIndexingProfile = (index: number) => {
    setProfile({
      ...profile,
      indexingProfiles: profile.indexingProfiles.filter((_, i) => i !== index),
    });
  };

  const updateIndexingProfile = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...profile.indexingProfiles];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, indexingProfiles: updated });
  };

  if (profileData === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={14} /> Основные данные
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
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'photos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Image size={14} /> Фото и обложка
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8">
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">ФИО и звания</label>
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
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Краткая биография для главной</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none resize-none"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 italic">Отображается на главной странице. Будьте лаконичны.</p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Полное описание научной деятельности</label>
              <textarea
                rows={10}
                className="w-full px-4 py-4 border border-slate-200 rounded-md focus:border-blue-600 outline-none font-serif text-lg leading-relaxed"
                value={profile.extendedBio}
                onChange={e => setProfile({...profile, extendedBio: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Список публикаций</label>
              <textarea
                rows={8}
                className="w-full px-4 py-4 border border-slate-200 rounded-md focus:border-blue-600 outline-none font-serif text-lg leading-relaxed"
                value={profile.publications}
                placeholder="Введите список публикаций..."
                onChange={e => setProfile({...profile, publications: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Научные направления</label>
              <textarea
                rows={5}
                className="w-full px-4 py-4 border border-slate-200 rounded-md focus:border-blue-600 outline-none font-serif text-lg leading-relaxed"
                value={profile.researchDirections}
                placeholder="Введите научные направления..."
                onChange={e => setProfile({...profile, researchDirections: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Индексация и профили</label>
                <button
                  type="button"
                  onClick={addIndexingProfile}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-md hover:bg-blue-100 transition-all"
                >
                  <Plus size={14} /> Добавить профиль
                </button>
              </div>
              {profile.indexingProfiles.length === 0 && (
                <p className="text-[10px] text-slate-400 italic">Нет добавленных профилей. Нажмите "Добавить профиль" чтобы начать.</p>
              )}
              {profile.indexingProfiles.map((entry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                    placeholder="Название, напр. Scopus"
                    value={entry.name}
                    onChange={e => updateIndexingProfile(index, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                    placeholder="URL"
                    value={entry.url}
                    onChange={e => updateIndexingProfile(index, 'url', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeIndexingProfile(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Награды и признание</label>
              <textarea
                rows={6}
                className="w-full px-4 py-4 border border-slate-200 rounded-md focus:border-blue-600 outline-none font-serif text-lg leading-relaxed"
                value={profile.awards}
                placeholder="Введите информацию о наградах..."
                onChange={e => setProfile({...profile, awards: e.target.value})}
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-md flex gap-4">
               <div className="w-10 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400">
                 <FileText size={20} />
               </div>
               <div className="flex-1">
                 <h5 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Документ CV (PDF)</h5>
                 <p className="text-xs text-slate-500 mb-2">cv_professors_2024.pdf</p>
                 <button className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Загрузить новую версию</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Основная электронная почта</label>
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
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Кабинет / Корпус</label>
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

        {activeTab === 'photos' && (
          <div className="space-y-8 max-w-2xl">
            {/* Profile Photo */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Фото профиля</h4>
              <div className="flex items-center gap-6">
                <img
                  src={profileData?.profilePhotoUrl || '/profile-sabina.jpg'}
                  alt="Фото профиля"
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                  style={{ objectPosition: profile.profilePhotoPosition }}
                />
                <div className="space-y-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-md cursor-pointer hover:bg-blue-100 transition-all">
                    <Upload size={14} /> Загрузить новое фото
                    <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, 'profile')} disabled={uploading} />
                  </label>
                  <p className="text-[10px] text-slate-400">JPG, PNG. Рекомендуемый размер: 400x400 px</p>
                </div>
              </div>
            </div>

            {/* Photo Position */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Позиция фото в круге</label>
              <select
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                value={profile.profilePhotoPosition}
                onChange={e => setProfile({...profile, profilePhotoPosition: e.target.value})}
              >
                <option value="center">По центру</option>
                <option value="top">Сверху</option>
                <option value="bottom">Снизу</option>
                <option value="50% 20%">Немного выше центра</option>
                <option value="50% 30%">Чуть выше центра</option>
                <option value="50% 40%">Слегка выше центра</option>
              </select>
              <p className="text-[10px] text-slate-400 italic">Определяет, какая часть фотографии видна в круглой рамке</p>
            </div>

            {/* Cover Photo */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Обложка сайта</h4>
              <div className="space-y-3">
                <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={profileData?.coverPhotoUrl || '/cover-photo.jpg'}
                    alt="Обложка"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-md cursor-pointer hover:bg-blue-100 transition-all">
                  <Upload size={14} /> Загрузить новую обложку
                  <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e, 'cover')} disabled={uploading} />
                </label>
                <p className="text-[10px] text-slate-400">Рекомендуемый размер: 1600x400 px</p>
              </div>
            </div>

            {uploading && (
              <div className="text-sm text-blue-600 font-bold animate-pulse">Загрузка...</div>
            )}
          </div>
        )}

        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-sm rounded-md hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10"
          >
            <Save size={18} /> Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
