import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Search, Edit3, Trash2, X, FileX, Video } from 'lucide-react';

interface VideoFormData {
  title: string;
  date: string;
  type: 'Lecture' | 'Interview' | 'Conference' | 'Talk';
  description: string;
  videoUrl: string;
  tags: string;
  status: 'published' | 'draft';
}

const emptyFormData: VideoFormData = {
  title: '',
  date: '',
  type: 'Lecture',
  description: '',
  videoUrl: '',
  tags: '',
  status: 'draft',
};

const typeLabels: Record<string, string> = {
  Lecture: 'Лекция',
  Interview: 'Интервью',
  Conference: 'Конференция',
  Talk: 'Доклад',
};

const AdminVideos: React.FC = () => {
  const mediaItems = useQuery(api.profile.listAllMedia);
  const createMedia = useMutation(api.profile.createMedia);
  const updateMedia = useMutation(api.profile.updateMedia);
  const deleteMedia = useMutation(api.profile.deleteMedia);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<Id<"mediaItems"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<VideoFormData>(emptyFormData);

  const sessionToken = localStorage.getItem('admin_session_token') || '';

  const handleDelete = async (id: Id<"mediaItems">) => {
    if (window.confirm('Вы уверены, что хотите удалить это видео? Это действие необратимо.')) {
      await deleteMedia({ sessionToken, id });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setFormData({
      title: item.title,
      date: item.date,
      type: item.type,
      description: item.description,
      videoUrl: item.videoUrl || '',
      tags: (item.tags || []).join(', '),
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingId) {
      await updateMedia({
        sessionToken,
        id: editingId,
        title: formData.title,
        date: formData.date,
        type: formData.type,
        description: formData.description,
        videoUrl: formData.videoUrl || undefined,
        tags: tagsArray,
        status: formData.status,
      });
    } else {
      await createMedia({
        sessionToken,
        title: formData.title,
        date: formData.date,
        type: formData.type,
        description: formData.description,
        videoUrl: formData.videoUrl || undefined,
        tags: tagsArray,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyFormData);
  };

  const filteredItems = (mediaItems || []).filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (mediaItems === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Поиск видео по названию..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
          >
            <Plus size={18} /> Добавить видео
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Превью</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Название</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Дата</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Тип</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Статус</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  {item.videoUrl ? (
                    <img
                      src={`https://img.youtube.com/vi/${item.videoUrl}/hqdefault.jpg`}
                      className="w-24 h-16 object-cover rounded shadow-sm"
                      alt=""
                    />
                  ) : (
                    <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <Video size={20} className="text-gray-300" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 line-clamp-2">{item.title}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600">{item.date}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-blue-50 text-blue-600">
                    {typeLabels[item.type] || item.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      item.status === 'published'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.status === 'published' ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto">
              <FileX size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Видео не найдены</p>
              <p className="text-slate-400 text-sm">Попробуйте изменить параметры поиска.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Редактировать видео' : 'Добавить видео'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as VideoFormData['type'],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  >
                    <option value="Lecture">Лекция</option>
                    <option value="Interview">Интервью</option>
                    <option value="Conference">Конференция</option>
                    <option value="Talk">Доклад</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none resize-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="например: dQw4w9WgXcQ"
                  />
                  {formData.videoUrl && (
                    <div className="mt-2">
                      <img
                        src={`https://img.youtube.com/vi/${formData.videoUrl}/hqdefault.jpg`}
                        className="w-40 h-auto rounded shadow-sm"
                        alt="Превью"
                      />
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Теги (через запятую)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="философия, культура, наука"
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
                disabled={!formData.title || !formData.date}
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

export default AdminVideos;
