import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Mail } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md mx-auto text-center space-y-8 p-8">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={40} />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">
                        Оплата прошла успешно!
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                        Спасибо за покупку. Мы отправили ссылку для скачивания PDF на указанный вами email.
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Mail size={18} />
                        <span className="font-medium">Проверьте почту</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Если письмо не пришло в течение 5 минут, проверьте папку "Спам".
                    </p>
                </div>

                {orderId && (
                    <p className="text-xs text-gray-400">
                        Номер заказа: {orderId}
                    </p>
                )}

                <Link
                    to="/books"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold tracking-widest text-sm rounded-sm hover:bg-black transition-all"
                >
                    <ArrowLeft size={16} />
                    Вернуться к каталогу
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
