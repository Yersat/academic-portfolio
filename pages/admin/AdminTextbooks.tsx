import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Search, Edit3, Trash2, X, FileX, Upload } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

interface TextbookFormData {
  title: string;
  year: string;
  publisher: string;
  isbn: string;
  coverImage: string;
  description: string;
  abstract: string;
  pdfUrl: string;
  sortOrder: string;
  status: 'published' | 'draft';
}

const emptyFormData: TextbookFormData = {
  title: '',
  year: '',
  publisher: '',
  isbn: '',
  coverImage: '',
  description: '',
  abstract: '',
  pdfUrl: '',
  sortOrder: '0',
  status: 'draft',
};

const AdminTextbooks: React.FC = () => {
  const textbooks = useQuery(api.textbooks.listAll);
  const createTextbook = useMutation(api.admin.createTextbook);
  const updateTextbook = useMutation(api.admin.updateTextbook);
  const deleteTextbook = useMutation(api.admin.deleteTextbook);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const checkSession = useMutation(api.auth.checkSession);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingTextbookId, setEditingTextbookId] = useState<Id<"textbooks"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TextbookFormData>(emptyFormData);
  const [isUploading, setIsUploading] = useState(false);

  const getSessionToken = () => {
    const token = localStorage.getItem('admin_session_token');
    if (!token) {
      throw new Error('Сессия не найдена. Пожалуйста, войдите заново.');
    }
    return token;
  };

  const handleDelete = async (id: Id<"textbooks">) => {
    if (window.confirm('Вы уверены, что хотите удалить это издание? Это действие необратимо.')) {
      await deleteTextbook({ sessionToken: getSessionToken(), id });
    }
  };

  const handleEdit = (textbook: any) => {
    setEditingTextbookId(textbook._id);
    setFormData({
      title: textbook.title || '',
      year: textbook.year || '',
      publisher: textbook.publisher || '',
      isbn: textbook.isbn || '',
      coverImage: textbook.coverImage || '',
      description: textbook.description || '',
      abstract: textbook.abstract || '',
      pdfUrl: textbook.pdfUrl || '',
      sortOrder: textbook.sortOrder?.toString() || '0',
      status: textbook.status || 'draft',
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTextbookId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingTextbookId) {
      await updateTextbook({
        sessionToken: getSessionToken(),
        id: editingTextbookId,
        title: formData.title,
        year: formData.year,
        publisher: formData.publisher || undefined,
        isbn: formData.isbn || undefined,
        coverImage: formData.coverImage || undefined,
        description: formData.description || undefined,
        abstract: formData.abstract || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        sortOrder: parseInt(formData.sortOrder) || 0,
        status: formData.status,
      });
    } else {
      await createTextbook({
        sessionToken: getSessionToken(),
        title: formData.title,
        year: formData.year,
        publisher: formData.publisher || undefined,
        isbn: formData.isbn || undefined,
        coverImage: formData.coverImage || undefined,
        description: formData.description || undefined,
        abstract: formData.abstract || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        sortOrder: parseInt(formData.sortOrder) || 0,
        status: formData.status,
      });
    }

    setIsModalOpen(false);
    setEditingTextbookId(null);
    setFormData(emptyFormData);
  };

  const handleFileUpload = async (textbookId: Id<"textbooks">, file: File) => {
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
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await updateTextbook({
        sessionToken: token,
        id: textbookId,
        fileStorageId: storageId,
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      if (err.message?.includes('Server Error') || err.message?.includes('Сессия не найдена')) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        localStorage.removeItem('admin_session_token');
        window.location.hash = '#/admin/login';
      }
    }
    setIsUploading(false);
  };

  const filteredTextbooks = (textbooks || []).filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.publisher || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (textbooks === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Поиск по названию или издательству..."
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
            <Plus size={18} /> Добавить издание
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Название</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Год</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Издательство</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Статус</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTextbooks.map((textbook) => (
              <tr key={textbook._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {textbook.coverImage ? (
                      <img src={textbook.coverImage} className="w-10 h-14 object-cover rounded shadow-sm" alt="" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-100 rounded shadow-sm flex items-center justify-center">
                        <FileX size={16} className="text-gray-300" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900">{textbook.title}</p>
                      {textbook.isbn && (
                        <p className="text-xs text-slate-400 font-mono">ISBN: {textbook.isbn}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700">{textbook.year}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700">{textbook.publisher || '—'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${textbook.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {textbook.status === 'published' ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(textbook._id, file);
                        }}
                        disabled={isUploading}
                      />
                      <span className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all inline-flex">
                        <Upload size={18} />
                      </span>
                    </label>
                    <button
                      onClick={() => handleEdit(textbook)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(textbook._id)}
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

        {filteredTextbooks.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto">
              <FileX size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Издания не найдены</p>
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
                {editingTextbookId ? 'Редактировать издание' : 'Добавить издание'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Год *</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Издательство</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="978-..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  >
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликовано</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL обложки</label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Аннотация</label>
                  <RichTextEditor value={formData.abstract} onChange={val => setFormData({...formData, abstract: val})} minHeight="100px" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на источник</label>
                  <input
                    type="url"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="https://..."
                  />
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
                disabled={!formData.title || !formData.year}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTextbookId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTextbooks;
