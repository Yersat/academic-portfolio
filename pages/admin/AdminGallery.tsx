import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Edit3, Trash2, X, FileX, Upload, Image } from 'lucide-react';

interface GalleryUploadFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  status: 'published' | 'draft';
}

interface GalleryEditFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  sortOrder: string;
  status: 'published' | 'draft';
}

const emptyUploadFormData: GalleryUploadFormData = {
  title: '',
  description: '',
  category: '',
  date: '',
  status: 'draft',
};

const emptyEditFormData: GalleryEditFormData = {
  title: '',
  description: '',
  category: '',
  date: '',
  sortOrder: '0',
  status: 'draft',
};

const AdminGallery: React.FC = () => {
  const photos = useQuery(api.gallery.listAll);
  const createGalleryPhoto = useMutation(api.admin.createGalleryPhoto);
  const updateGalleryPhoto = useMutation(api.admin.updateGalleryPhoto);
  const deleteGalleryPhoto = useMutation(api.admin.deleteGalleryPhoto);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const checkSession = useMutation(api.auth.checkSession);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"galleryPhotos"> | null>(null);
  const [uploadFormData, setUploadFormData] = useState<GalleryUploadFormData>(emptyUploadFormData);
  const [editFormData, setEditFormData] = useState<GalleryEditFormData>(emptyEditFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getSessionToken = () => {
    const token = localStorage.getItem('admin_session_token');
    if (!token) {
      throw new Error('Сессия не найдена. Пожалуйста, войдите заново.');
    }
    return token;
  };

  const handleDelete = async (id: Id<"galleryPhotos">) => {
    if (window.confirm('Вы уверены, что хотите удалить это фото? Это действие необратимо.')) {
      await deleteGalleryPhoto({ sessionToken: getSessionToken(), id });
    }
  };

  const handleEdit = (photo: any) => {
    setEditingId(photo._id);
    setEditFormData({
      title: photo.title || '',
      description: photo.description || '',
      category: photo.category || '',
      date: photo.date || '',
      sortOrder: photo.sortOrder?.toString() || '0',
      status: photo.status,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenUpload = () => {
    setUploadFormData(emptyUploadFormData);
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
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
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();

      await createGalleryPhoto({
        sessionToken: token,
        imageStorageId: storageId,
        title: uploadFormData.title || undefined,
        description: uploadFormData.description || undefined,
        category: uploadFormData.category || undefined,
        date: uploadFormData.date || undefined,
        sortOrder: 0,
        status: uploadFormData.status,
      });

      setIsUploadModalOpen(false);
      setUploadFormData(emptyUploadFormData);
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload failed:', err);
      if (err.message?.includes('Server Error') || err.message?.includes('Сессия не найдена')) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        localStorage.removeItem('admin_session_token');
        window.location.hash = '#/admin/login';
      } else {
        alert(`Ошибка загрузки: ${err.message || 'Попробуйте ещё раз.'}`);
      }
    }
    setIsUploading(false);
  };

  const handleEditSave = async () => {
    if (!editingId) return;

    await updateGalleryPhoto({
      sessionToken: getSessionToken(),
      id: editingId,
      title: editFormData.title || undefined,
      description: editFormData.description || undefined,
      category: editFormData.category || undefined,
      date: editFormData.date || undefined,
      sortOrder: parseFloat(editFormData.sortOrder) || 0,
      status: editFormData.status,
    });

    setIsEditModalOpen(false);
    setEditingId(null);
    setEditFormData(emptyEditFormData);
  };

  if (photos === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900">Галерея</h2>
        <button
          onClick={handleOpenUpload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
        >
          <Plus size={18} /> Добавить фото
        </button>
      </div>

      {/* Grid View */}
      {photos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-20 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto">
            <FileX size={32} />
          </div>
          <div>
            <p className="text-slate-900 font-bold">Фотографии не найдены</p>
            <p className="text-slate-400 text-sm">Добавьте первое фото, нажав кнопку выше.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-square relative overflow-hidden">
                {photo.imageUrl ? (
                  <img
                    src={photo.imageUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={photo.title || ''}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Image size={32} className="text-gray-300" />
                  </div>
                )}
                {/* Overlay buttons on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(photo)}
                    className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 shadow-lg"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(photo._id)}
                    className="p-2 bg-white rounded-full text-slate-700 hover:text-red-600 shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-bold text-sm text-slate-900 truncate">
                  {photo.title || 'Без названия'}
                </p>
                <div className="flex items-center justify-between mt-1">
                  {photo.category ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-blue-50 text-blue-600">
                      {photo.category}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      photo.status === 'published'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {photo.status === 'published' ? 'Опубл.' : 'Черновик'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Добавить фото</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Изображение *</label>
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={24} className="mx-auto text-gray-400" />
                        <p className="text-sm text-slate-500">Нажмите для выбора файла</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input
                  type="text"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                  <input
                    type="text"
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="Конференция, Лекция..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                  <input
                    type="date"
                    value={uploadFormData.date}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                <select
                  value={uploadFormData.status}
                  onChange={(e) =>
                    setUploadFormData({
                      ...uploadFormData,
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

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleUploadSave}
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Загрузка...' : 'Загрузить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Редактировать фото</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="Конференция, Лекция..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
                  <input
                    type="number"
                    value={editFormData.sortOrder}
                    onChange={(e) => setEditFormData({ ...editFormData, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
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
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
