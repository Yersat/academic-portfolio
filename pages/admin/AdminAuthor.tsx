
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Save, FileText, Plus, X } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

const AdminAuthor: React.FC = () => {
  const profileData = useQuery(api.profile.getProfile);
  const updateProfile = useMutation(api.profile.updateProfile);

  const getSessionToken = () => {
    const token = localStorage.getItem('admin_session_token');
    if (!token) {
      throw new Error('Сессия не найдена. Пожалуйста, войдите заново.');
    }
    return token;
  };

  const [extendedBio, setExtendedBio] = useState('');
  const [publications, setPublications] = useState('');
  const [researchDirections, setResearchDirections] = useState('');
  const [indexingProfiles, setIndexingProfiles] = useState<{ name: string; url: string }[]>([]);
  const [awards, setAwards] = useState('');

  useEffect(() => {
    if (profileData) {
      setExtendedBio(profileData.extendedBio || '');
      setPublications(profileData.publications || '');
      setResearchDirections(profileData.researchDirections || '');
      setIndexingProfiles(profileData.indexingProfiles || []);
      setAwards(profileData.awards || '');
    }
  }, [profileData]);

  const handleSave = async () => {
    await updateProfile({
      sessionToken: getSessionToken(),
      extendedBio,
      publications: publications || undefined,
      researchDirections: researchDirections || undefined,
      indexingProfiles: indexingProfiles.length > 0 ? indexingProfiles : undefined,
      awards: awards || undefined,
    });
    alert('Данные об авторе успешно обновлены.');
  };

  const addIndexingProfile = () => {
    setIndexingProfiles([...indexingProfiles, { name: '', url: '' }]);
  };

  const removeIndexingProfile = (index: number) => {
    setIndexingProfiles(indexingProfiles.filter((_, i) => i !== index));
  };

  const updateIndexingProfile = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...indexingProfiles];
    updated[index] = { ...updated[index], [field]: value };
    setIndexingProfiles(updated);
  };

  if (profileData === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Полное описание научной деятельности</label>
            <RichTextEditor value={extendedBio} onChange={setExtendedBio} minHeight="300px" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Список публикаций</label>
            <RichTextEditor value={publications} onChange={setPublications} placeholder="Введите список публикаций..." minHeight="250px" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Научные направления</label>
            <RichTextEditor value={researchDirections} onChange={setResearchDirections} placeholder="Введите научные направления..." minHeight="150px" />
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
            {indexingProfiles.length === 0 && (
              <p className="text-[10px] text-slate-400 italic">Нет добавленных профилей. Нажмите "Добавить профиль" чтобы начать.</p>
            )}
            {indexingProfiles.map((entry, index) => (
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
            <RichTextEditor value={awards} onChange={setAwards} placeholder="Введите информацию о наградах..." minHeight="200px" />
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

export default AdminAuthor;
