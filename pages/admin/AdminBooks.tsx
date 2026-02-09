
import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Search, Filter, Edit3, Trash2, Globe, FileX, X, ExternalLink, FileText, Upload, Image, ArrowUp, ArrowDown } from 'lucide-react';

interface BookFormData {
  title: string;
  year: string;
  publisher: string;
  isbn: string;
  coverImage: string;
  description: string;
  abstract: string;
  status: 'published' | 'draft';
  litresUrl: string;
  pdfPrice: string;
  pdfCurrency: 'KZT' | 'RUB';
}

const emptyFormData: BookFormData = {
  title: '',
  year: '',
  publisher: '',
  isbn: '',
  coverImage: '',
  description: '',
  abstract: '',
  status: 'draft',
  litresUrl: '',
  pdfPrice: '',
  pdfCurrency: 'KZT',
};

const AdminBooks: React.FC = () => {
  const books = useQuery(api.books.listAll);
  const createBook = useMutation(api.admin.createBook);
  const updateBook = useMutation(api.admin.updateBook);
  const deleteBook = useMutation(api.admin.deleteBook);
  const generateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const attachPdf = useMutation(api.admin.attachPdf);
  const createPreviewPage = useMutation(api.admin.createPreviewPage);
  const deletePreviewPage = useMutation(api.admin.deletePreviewPage);
  const reorderPreviewPages = useMutation(api.admin.reorderPreviewPages);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingBookId, setEditingBookId] = useState<Id<"books"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BookFormData>(emptyFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPreview, setIsUploadingPreview] = useState(false);

  const getSessionToken = () => {
    const token = localStorage.getItem('admin_session_token');
    if (!token) {
      throw new Error('Сессия не найдена. Пожалуйста, войдите заново.');
    }
    return token;
  };

  const handleDelete = async (id: Id<"books">) => {
    if (window.confirm('Вы уверены, что хотите удалить эту книгу? Это действие необратимо.')) {
      await deleteBook({ sessionToken: getSessionToken(), id });
    }
  };

  const handleEdit = (book: any) => {
    setEditingBookId(book._id);
    setFormData({
      title: book.title,
      year: book.year,
      publisher: book.publisher,
      isbn: book.isbn,
      coverImage: book.coverImage,
      description: book.description,
      abstract: book.abstract,
      status: book.status,
      litresUrl: book.litresUrl || '',
      pdfPrice: book.pdfPrice?.toString() || '',
      pdfCurrency: book.pdfCurrency || 'KZT',
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBookId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingBookId) {
      await updateBook({
        sessionToken: getSessionToken(),
        id: editingBookId,
        title: formData.title,
        year: formData.year,
        publisher: formData.publisher,
        isbn: formData.isbn,
        coverImage: formData.coverImage || 'https://picsum.photos/seed/newbook/400/600',
        description: formData.description,
        abstract: formData.abstract,
        status: formData.status,
        litresUrl: formData.litresUrl || undefined,
        pdfPrice: formData.pdfPrice ? parseFloat(formData.pdfPrice) : undefined,
        pdfCurrency: formData.pdfCurrency,
        isPublished: formData.status === 'published',
      });
    } else {
      await createBook({
        sessionToken: getSessionToken(),
        title: formData.title,
        year: formData.year,
        publisher: formData.publisher,
        isbn: formData.isbn,
        coverImage: formData.coverImage || 'https://picsum.photos/seed/newbook/400/600',
        description: formData.description,
        abstract: formData.abstract,
        status: formData.status,
        litresUrl: formData.litresUrl || undefined,
        pdfPrice: formData.pdfPrice ? parseFloat(formData.pdfPrice) : undefined,
        pdfCurrency: formData.pdfCurrency,
        isPublished: formData.status === 'published',
      });
    }

    setIsModalOpen(false);
    setEditingBookId(null);
    setFormData(emptyFormData);
  };

  const handlePdfUpload = async (bookId: Id<"books">, file: File) => {
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({ sessionToken: getSessionToken() });
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await attachPdf({ sessionToken: getSessionToken(), bookId, storageId });
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setIsUploading(false);
  };

  const previewPages = useQuery(
    api.books.getPreviewPages,
    editingBookId ? { bookId: editingBookId } : "skip"
  );

  const handlePreviewUpload = async (file: File) => {
    if (!editingBookId) return;
    setIsUploadingPreview(true);
    try {
      const uploadUrl = await generateUploadUrl({ sessionToken: getSessionToken() });
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const nextOrder = (previewPages?.length ?? 0);
      await createPreviewPage({
        sessionToken: getSessionToken(),
        bookId: editingBookId,
        imageStorageId: storageId,
        sortOrder: nextOrder,
      });
    } catch (err) {
      console.error('Preview upload failed:', err);
    }
    setIsUploadingPreview(false);
  };

  const handleDeletePreviewPage = async (pageId: Id<"bookPreviewPages">) => {
    if (window.confirm('Удалить эту страницу предпросмотра?')) {
      await deletePreviewPage({ sessionToken: getSessionToken(), id: pageId });
    }
  };

  const handleMovePreviewPage = async (index: number, direction: 'up' | 'down') => {
    if (!previewPages) return;
    const newOrder = [...previewPages];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    await reorderPreviewPages({
      sessionToken: getSessionToken(),
      pageIds: newOrder.map((p) => p._id),
    });
  };

  const filteredBooks = (books || []).filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.publisher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'KZT') {
      return `${price.toLocaleString('ru-RU')} ₸`;
    }
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  if (books === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Поиск книг по названию или издательству..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-600 rounded-lg hover:bg-gray-50 font-medium">
            <Filter size={18} /> Фильтр
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
          >
            <Plus size={18} /> Добавить книгу
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Книга</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Издательство</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Покупка</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">PDF</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Статус</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredBooks.map((book) => (
              <tr key={book._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={book.coverImage} className="w-10 h-14 object-cover rounded shadow-sm" alt="" />
                    <div>
                      <p className="font-bold text-slate-900">{book.title}</p>
                      <p className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700">{book.publisher}</p>
                  <p className="text-xs text-slate-400">{book.year}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {book.litresUrl && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                        <ExternalLink size={10} /> Литрес
                      </span>
                    )}
                    {book.pdfPrice && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <FileText size={10} /> PDF: {formatPrice(book.pdfPrice, book.pdfCurrency || 'KZT')}
                      </span>
                    )}
                    {!book.litresUrl && !book.pdfPrice && (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {book.pdfStorageId ? (
                      <span className="text-xs text-emerald-600 font-bold">Загружен</span>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePdfUpload(book._id, file);
                          }}
                          disabled={isUploading}
                        />
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                          <Upload size={10} /> {isUploading ? 'Загрузка...' : 'Загрузить'}
                        </span>
                      </label>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${book.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {book.status === 'published' ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all">
                      <Globe size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
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

        {filteredBooks.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto">
              <FileX size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Книги не найдены</p>
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
                {editingBookId ? 'Редактировать книгу' : 'Добавить книгу'}
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
              {/* Basic Info */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Издательство *</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    required
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
                  <textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Purchase Options */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={16} /> Опции покупки
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на Литрес</label>
                    <input
                      type="url"
                      value={formData.litresUrl}
                      onChange={(e) => setFormData({ ...formData, litresUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                      placeholder="https://www.litres.ru/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Цена PDF</label>
                    <input
                      type="number"
                      value={formData.pdfPrice}
                      onChange={(e) => setFormData({ ...formData, pdfPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                      placeholder="2990"
                      min="0"
                      step="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                    <select
                      value={formData.pdfCurrency}
                      onChange={(e) => setFormData({ ...formData, pdfCurrency: e.target.value as 'KZT' | 'RUB' })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none"
                    >
                      <option value="KZT">Тенге (KZT)</option>
                      <option value="RUB">Рубль (RUB)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview Pages */}
              {editingBookId && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Image size={16} /> Предпросмотр книги
                  </h3>

                  {/* Existing preview pages */}
                  {previewPages && previewPages.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {previewPages.map((page, index) => (
                        <div
                          key={page._id}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-md border border-gray-100"
                        >
                          <span className="text-xs text-gray-400 font-mono w-6 text-center">{index + 1}</span>
                          {page.imageUrl && (
                            <img
                              src={page.imageUrl}
                              alt=""
                              className="w-10 h-14 object-cover rounded shadow-sm"
                            />
                          )}
                          <span className="flex-1 text-xs text-gray-600">
                            Страница {index + 1}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleMovePreviewPage(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePreviewPage(index, 'down')}
                              disabled={index === previewPages.length - 1}
                              className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePreviewPage(page._id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files) return;
                        for (let i = 0; i < files.length; i++) {
                          await handlePreviewUpload(files[i]);
                        }
                        e.target.value = '';
                      }}
                      disabled={isUploadingPreview}
                    />
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <Upload size={14} />
                      {isUploadingPreview ? 'Загрузка...' : 'Добавить страницы'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Загрузите изображения страниц для предпросмотра (JPG, PNG). Порядок можно изменить стрелками.
                  </p>
                </div>
              )}
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
                disabled={!formData.title || !formData.year || !formData.publisher}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingBookId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
