import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Search, Edit3, Trash2, X, FileX, ChevronUp, ChevronDown, Upload } from 'lucide-react';

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'quote';
  text?: string;
  imageStorageId?: Id<"_storage">;
  imageCaption?: string;
  level?: number;
}

interface ArticleFormData {
  title: string;
  year: string;
  journal: string;
  authors: string;
  abstract: string;
  pdfUrl: string;
  category: string;
  pages: string;
  issueNumber: string;
  status: 'published' | 'draft';
}

const emptyFormData: ArticleFormData = {
  title: '',
  year: '',
  journal: '',
  authors: '',
  abstract: '',
  pdfUrl: '',
  category: '',
  pages: '',
  issueNumber: '',
  status: 'draft',
};

const categoryLabels: Record<string, string> = {
  reviewed_journals: 'Статьи в рецензируемых научных журналах',
  collections: 'Статьи в сборниках',
  conferences: 'Материалы межд. научных конференций, форумов и конгрессов',
  media_interviews: 'Интервью и статьи в СМИ',
};

const blockTypeLabels: Record<string, string> = {
  paragraph: 'Абзац',
  heading: 'Заголовок',
  image: 'Изображение',
  quote: 'Цитата',
};

const AdminArticles: React.FC = () => {
  const articles = useQuery(api.profile.listAllResearch);
  const createResearch = useMutation(api.profile.createResearch);
  const updateResearch = useMutation(api.profile.updateResearch);
  const deleteResearch = useMutation(api.profile.deleteResearch);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const checkSession = useMutation(api.auth.checkSession);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<Id<"researchPapers"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ArticleFormData>(emptyFormData);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [newBlockType, setNewBlockType] = useState<ContentBlock['type']>('paragraph');
  const [isUploading, setIsUploading] = useState(false);
  const [fileStorageId, setFileStorageId] = useState<Id<"_storage"> | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);

  const getSessionToken = () => {
    const token = localStorage.getItem('admin_session_token');
    if (!token) {
      throw new Error('Сессия не найдена. Пожалуйста, войдите заново.');
    }
    return token;
  };

  const handleDelete = async (id: Id<"researchPapers">) => {
    if (window.confirm('Вы уверены, что хотите удалить эту статью? Это действие необратимо.')) {
      await deleteResearch({ sessionToken: getSessionToken(), id });
    }
  };

  const handleEdit = (article: any) => {
    setEditingId(article._id);
    setFormData({
      title: article.title,
      year: article.year,
      journal: article.journal || '',
      authors: article.authors,
      abstract: article.abstract,
      pdfUrl: article.pdfUrl || '',
      category: article.category || '',
      pages: article.pages || '',
      issueNumber: article.issueNumber || '',
      status: article.status,
    });
    setContentBlocks(
      (article.contentBlocks || []).map((block: any) => ({
        type: block.type,
        text: block.text,
        imageStorageId: block.imageStorageId,
        imageCaption: block.imageCaption,
        level: block.level,
      }))
    );
    setFileStorageId((article.fileStorageId as Id<"_storage">) || null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData(emptyFormData);
    setContentBlocks([]);
    setFileStorageId(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const blocksToSave = contentBlocks.map((block) => {
      const b: any = { type: block.type };
      if (block.text !== undefined) b.text = block.text;
      if (block.imageStorageId !== undefined) b.imageStorageId = block.imageStorageId;
      if (block.imageCaption !== undefined) b.imageCaption = block.imageCaption;
      if (block.level !== undefined) b.level = block.level;
      return b;
    });

    if (editingId) {
      await updateResearch({
        sessionToken: getSessionToken(),
        id: editingId,
        title: formData.title,
        year: formData.year,
        journal: formData.journal || undefined,
        authors: formData.authors,
        abstract: formData.abstract,
        pdfUrl: formData.pdfUrl || undefined,
        fileStorageId: fileStorageId || undefined,
        contentBlocks: blocksToSave.length > 0 ? blocksToSave : undefined,
        status: formData.status,
        category: (formData.category as any) || undefined,
        pages: formData.pages || undefined,
        issueNumber: formData.issueNumber || undefined,
      });
    } else {
      await createResearch({
        sessionToken: getSessionToken(),
        title: formData.title,
        year: formData.year,
        journal: formData.journal || undefined,
        authors: formData.authors,
        abstract: formData.abstract,
        pdfUrl: formData.pdfUrl || undefined,
        fileStorageId: fileStorageId || undefined,
        contentBlocks: blocksToSave.length > 0 ? blocksToSave : undefined,
        status: formData.status,
        category: (formData.category as any) || undefined,
        pages: formData.pages || undefined,
        issueNumber: formData.issueNumber || undefined,
      });
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyFormData);
    setContentBlocks([]);
  };

  const addBlock = () => {
    const newBlock: ContentBlock = { type: newBlockType };
    if (newBlockType === 'paragraph' || newBlockType === 'quote') {
      newBlock.text = '';
    }
    if (newBlockType === 'heading') {
      newBlock.text = '';
      newBlock.level = 2;
    }
    if (newBlockType === 'image') {
      newBlock.imageCaption = '';
    }
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const updated = [...contentBlocks];
    updated[index] = { ...updated[index], ...updates };
    setContentBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contentBlocks.length) return;
    const updated = [...contentBlocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setContentBlocks(updated);
  };

  const handleImageUpload = async (index: number, file: File) => {
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
      updateBlock(index, { imageStorageId: storageId });
    } catch (err: any) {
      console.error('Upload failed:', err);
      if (err.message?.includes('Server Error') || err.message?.includes('Сессия не найдена')) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        localStorage.removeItem('admin_session_token');
        window.location.hash = '#/admin/login';
      } else {
        alert(`Ошибка загрузки изображения: ${err.message || 'Попробуйте ещё раз.'}`);
      }
    }
    setIsUploading(false);
  };

  const handleFileUpload = async (file: File) => {
    setIsFileUploading(true);
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
      setFileStorageId(storageId as Id<"_storage">);
    } catch (err: any) {
      console.error('File upload failed:', err);
      if (err.message?.includes('Server Error') || err.message?.includes('Сессия не найдена')) {
        alert('Сессия истекла. Пожалуйста, войдите заново.');
        localStorage.removeItem('admin_session_token');
        window.location.hash = '#/admin/login';
      } else {
        alert(`Ошибка загрузки файла: ${err.message || 'Попробуйте ещё раз.'}`);
      }
    }
    setIsFileUploading(false);
  };

  const getBlockPreview = (block: ContentBlock): string => {
    if (block.type === 'image') {
      return block.imageStorageId
        ? `[Изображение загружено] ${block.imageCaption || ''}`
        : '[Изображение не загружено]';
    }
    const text = block.text || '';
    return text.length > 80 ? text.substring(0, 80) + '...' : text || '(пусто)';
  };

  const filteredArticles = (articles || []).filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (articles === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Поиск статей по названию..."
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
            <Plus size={18} /> Добавить статью
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Название</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Год</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Авторы</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Статус</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredArticles.map((article) => (
              <tr key={article._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 line-clamp-2">{article.title}</p>
                  {article.journal && (
                    <p className="text-xs text-slate-400 mt-1">{article.journal}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600">{article.year}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{article.authors}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      article.status === 'published'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {article.status === 'published' ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
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

        {filteredArticles.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto">
              <FileX size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Статьи не найдены</p>
              <p className="text-slate-400 text-sm">Попробуйте изменить параметры поиска.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl mx-4 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Редактировать статью' : 'Добавить статью'}
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
              {/* Section 1 - Basic Info */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Журнал</label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                  >
                    <option value="">— Не указана —</option>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Авторы *</label>
                  <input
                    type="text"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="Иванов И.И., Петров П.П."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Аннотация</label>
                  <textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Номер журнала</label>
                  <input
                    type="text"
                    value={formData.issueNumber}
                    onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="№ 5 (120)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Номер страницы</label>
                  <input
                    type="text"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="С. 45-52"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на источник</label>
                  <input
                    type="text"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Прикрепить файл (PDF/DOC)</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        disabled={isFileUploading}
                      />
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 cursor-pointer font-medium">
                        <Upload size={14} /> {isFileUploading ? 'Загрузка...' : 'Загрузить файл'}
                      </span>
                    </label>
                    {fileStorageId && (
                      <span className="text-xs text-emerald-600 font-bold">✓ Файл прикреплён</span>
                    )}
                  </div>
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

              {/* Section 2 - Content Blocks */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Содержание статьи</h3>

                {/* Existing blocks list */}
                <div className="space-y-3 mb-4">
                  {contentBlocks.map((block, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {blockTypeLabels[block.type]}
                          {block.type === 'heading' && block.level ? ` (H${block.level})` : ''}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveBlock(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => moveBlock(index, 'down')}
                            disabled={index === contentBlocks.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            onClick={() => removeBlock(index)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Block content editor based on type */}
                      {(block.type === 'paragraph' || block.type === 'quote') && (
                        <textarea
                          value={block.text || ''}
                          onChange={(e) => updateBlock(index, { text: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none resize-none text-sm"
                          placeholder={block.type === 'quote' ? 'Текст цитаты...' : 'Текст абзаца...'}
                        />
                      )}

                      {block.type === 'heading' && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={block.text || ''}
                            onChange={(e) => updateBlock(index, { text: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-sm"
                            placeholder="Текст заголовка..."
                          />
                          <select
                            value={block.level || 2}
                            onChange={(e) =>
                              updateBlock(index, { level: parseInt(e.target.value) })
                            }
                            className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-sm"
                          >
                            <option value={2}>H2</option>
                            <option value={3}>H3</option>
                          </select>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(index, file);
                                }}
                                disabled={isUploading}
                              />
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 cursor-pointer font-medium">
                                <Upload size={14} /> {isUploading ? 'Загрузка...' : 'Загрузить изображение'}
                              </span>
                            </label>
                            {block.imageStorageId && (
                              <span className="text-xs text-emerald-600 font-bold">Загружено</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={block.imageCaption || ''}
                            onChange={(e) => updateBlock(index, { imageCaption: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-sm"
                            placeholder="Подпись к изображению..."
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add block controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={newBlockType}
                    onChange={(e) => setNewBlockType(e.target.value as ContentBlock['type'])}
                    className="px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none text-sm"
                  >
                    <option value="paragraph">Абзац</option>
                    <option value="heading">Заголовок</option>
                    <option value="image">Изображение</option>
                    <option value="quote">Цитата</option>
                  </select>
                  <button
                    onClick={addBlock}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                  >
                    <Plus size={16} /> Добавить блок
                  </button>
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
                disabled={!formData.title || !formData.year || !formData.authors}
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

export default AdminArticles;
