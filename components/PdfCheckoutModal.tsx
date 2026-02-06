import React, { useState } from 'react';
import { X, Mail, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { Book } from '../types';
import { checkoutPdf } from '../api';

interface PdfCheckoutModalProps {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
}

const PdfCheckoutModal: React.FC<PdfCheckoutModalProps> = ({ book, isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const formatPrice = (price: number, currency: string) => {
        if (currency === 'KZT') {
            return `${price.toLocaleString('ru-RU')} ₸`;
        }
        return `${price.toLocaleString('ru-RU')} ₽`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Пожалуйста, введите корректный email');
            }

            const response = await checkoutPdf(book.id, email);

            // Redirect to Robokassa
            window.location.href = response.redirectUrl;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-md mx-4 rounded-sm shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center rounded-sm">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Купить PDF версию</h2>
                            <p className="text-xs text-gray-500">{book.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-sm transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Price */}
                    <div className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Стоимость PDF:</span>
                            <span className="text-2xl font-bold text-gray-900">
                                {book.pdfPrice && book.pdfCurrency
                                    ? formatPrice(book.pdfPrice, book.pdfCurrency)
                                    : 'Цена не указана'}
                            </span>
                        </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email для получения книги
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@mail.ru"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            После оплаты мы отправим ссылку на скачивание PDF на указанный email.
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-sm text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-bold tracking-widest text-sm rounded-sm hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Переход к оплате...
                            </>
                        ) : (
                            'Перейти к оплате'
                        )}
                    </button>

                    {/* Payment info */}
                    <p className="text-xs text-gray-400 text-center">
                        Оплата через Robokassa. Безопасные платежи картами Visa, MasterCard, Мир.
                    </p>
                </form>
            </div>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default PdfCheckoutModal;
