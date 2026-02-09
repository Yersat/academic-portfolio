import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Edit3, Trash2, X, FileX, Users, Upload } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

interface CoAuthorFormData {
  name: string;
  title: string;
  bio: string;
  sortOrder: string;
  status: 'published' | 'draft';
  publications: string;
  researchDirections: string;
  awards: string;
}

const emptyFormData: CoAuthorFormData = {
  name: '',
  title: '',
  bio: '',
  sortOrder: '0',
  status: 'draft',
  publications: '',
  researchDirections: '',
  awards: '',
};

const AdminCoAuthors: React.FC = () => {
  const coAuthors = useQuery(api.coAuthors.listAll);
  const createCoAuthor = useMutation(api.admin.createCoAuthor);
  const updateCoAuthor = useMutation(api.admin.updateCoAuthor);
  const deleteCoAuthor = useMutation(api.admin.deleteCoAuthor);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const checkSession = useMutation(api.auth.checkSession);

  const [editingId, setEditingId] = useState<Id<"coAuthors"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CoAuthorFormData>(emptyFormData);
  const [indexingProfiles, setIndexingProfiles] = useState<{ name: string; url: string }[]>([]);
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const getSessionToken = () => {
    const token = localStorage.getItem('admin_session_token');
    if (!token) {
      throw new Error('Сессия не найдена. Пожалуйста, войдите заново.');
    }
    return token;
  };

  const handleDelete = async (id: Id<"coAuthors">) => {
    if (window.confirm('Вы уверены, что хотите удалить этого соавтора? Это действие необратимо.')) {
      await deleteCoAuthor({ sessionToken: getSessionToken(), id });
    }
  };

  const handleEdit = (author: any) => {
    setEditingId(author._id);
    setFormData({
      name: author.name,
      title: author.title || '',
      bio: author.bio || '',
      sortOrder: author.sortOrder?.toString() || '0',
      status: author.status,
      publications: author.publications || '',
      researchDirections: author.researchDirections || '',
      awards: author.awards || '',
    });
    setIndexingProfiles(author.indexingProfiles || []);
    setPhotoStorageId(author.photoStorageId || null);
    setPhotoPreviewUrl(author.photoUrl || null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setIndexingProfiles([]);
    setPhotoStorageId(null);
    setPhotoPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setIsPhotoUploading(true);
    try {
      const token = getSessionToken();
      const { valid } = await checkSession({ sessionToken: token });
      if (!valid) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        localStorage.removeItem('admin_session_token');
        window.location.hash = '#/admin/login';
        return;
      }
      const uploadUrl = await generateUploadUrl({ sessionToken: token });
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setPhotoStorageId(storageId as Id<"_storage">);
      setPhotoPreviewUrl(URL.createObjectURL(file));
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      if (err.message?.includes('Server Error') || err.message?.includes('Сессия не найдена')) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        localStorage.removeItem('admin_session_token');
        window.location.hash = '#/admin/login';
      } else {
        alert(`Ошибка загрузки фото: ${err.message || 'Попробуйте ещё раз.'}`);
      }
    }
    setIsPhotoUploading(false);
  };

  const handleSave = async () => {
    if (editingId) {
      await updateCoAuthor({
        sessionToken: getSessionToken(),
        id: editingId,
        name: formData.name,
        title: formData.title || undefined,
        bio: formData.bio || undefined,
        photoStorageId: photoStorageId || undefined,
        cvEntries: [],
        publications: formData.publications || undefined,
        researchDirections: formData.researchDirections || undefined,
        indexingProfiles: indexingProfiles.length > 0 ? indexingProfiles : undefined,
        awards: formData.awards || undefined,
        sortOrder: parseFloat(formData.sortOrder) || 0,
        status: formData.status,
      });
    } else {
      await createCoAuthor({
        sessionToken: getSessionToken(),
        name: formData.name,
        title: formData.title || undefined,
        bio: formData.bio || undefined,
        photoStorageId: photoStorageId || undefined,
        cvEntries: [],
        publications: formData.publications || undefined,
        researchDirections: formData.researchDirections || undefined,
        indexingProfiles: indexingProfiles.length > 0 ? indexingProfiles : undefined,
        awards: formData.awards || undefined,
        sortOrder: parseFloat(formData.sortOrder) || 0,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyFormData);
    setIndexingProfiles([]);
    setPhotoStorageId(null);
    setPhotoPreviewUrl(null);
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

  if (coAuthors === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900">Соавторы</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
        >
          <Plus size={18} /> Добавить соавтора
        </button>
      </div>

      {/* Card/List View */}
      {coAuthors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto">
            <FileX size={32} />
          </div>
          <div>
            <p className="text-slate-900 font-bold">Соавторы не найдены</p>
            <p className="text-slate-400 text-sm">Добавьте первого соавтора, нажав кнопку выше.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coAuthors.map((author) => (
            <div
              key={author._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {author.photoUrl ? (
                    <img
                      src={author.photoUrl}
                      className="w-12 h-16 rounded-md object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-16 bg-blue-50 rounded-md flex items-center justify-center">
                      <Users size={20} className="text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{author.name}</p>
                    {author.title && (
                      <p className="text-xs text-slate-500">{author.title}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    author.status === 'published'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {author.status === 'published' ? 'Опубликовано' : 'Черновик'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-400">
                  Записей в CV: <span className="font-bold text-slate-600">{author.cvEntries?.length || 0}</span>
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-50 pt-3">
                <button
                  onClick={() => handleEdit(author)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(author._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Редактировать соавтора' : 'Добавить соавтора'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Должность / Звание</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="Профессор, доктор наук"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Биография</label>
                  <RichTextEditor value={formData.bio} onChange={val => setFormData({...formData, bio: val})} minHeight="100px" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Фото</label>
                  <div className="flex items-center gap-4">
                    {photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt="Фото соавтора"
                        className="w-20 h-24 rounded-md object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-24 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                        <Users size={24} className="text-gray-300" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(file);
                          }}
                          disabled={isPhotoUploading}
                        />
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 cursor-pointer font-medium">
                          <Upload size={14} /> {isPhotoUploading ? 'Загрузка...' : 'Загрузить фото'}
                        </span>
                      </label>
                      <p className="text-[10px] text-gray-400">JPG, PNG. Рекомендуемый размер: 300x400 px</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'published' | 'draft',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  >
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликовано</option>
                  </select>
                </div>
              </div>

              {/* Список публикаций */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Список публикаций</label>
                <RichTextEditor value={formData.publications} onChange={val => setFormData({...formData, publications: val})} placeholder="Введите список публикаций..." minHeight="200px" />
              </div>

              {/* Научные направления */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Научные направления</label>
                <RichTextEditor value={formData.researchDirections} onChange={val => setFormData({...formData, researchDirections: val})} placeholder="Введите научные направления..." minHeight="130px" />
              </div>

              {/* Индексация и профили */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Индексация и профили</h3>

                <div className="space-y-3 mb-4">
                  {indexingProfiles.map((profile, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => updateIndexingProfile(index, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-sm"
                          placeholder="Название, напр. Scopus"
                        />
                        <input
                          type="text"
                          value={profile.url}
                          onChange={(e) => updateIndexingProfile(index, 'url', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-sm"
                          placeholder="URL"
                        />
                      </div>
                      <button
                        onClick={() => removeIndexingProfile(index)}
                        className="p-2 text-slate-400 hover:text-red-600 flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addIndexingProfile}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                >
                  <Plus size={16} /> Добавить профиль
                </button>
              </div>

              {/* Награды и признание */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Награды и признание</label>
                <RichTextEditor value={formData.awards} onChange={val => setFormData({...formData, awards: val})} placeholder="Введите информацию о наградах..." minHeight="130px" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoAuthors;
