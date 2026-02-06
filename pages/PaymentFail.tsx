import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentFail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md mx-auto text-center space-y-8 p-8">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <XCircle size={40} />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">
                        Оплата не прошла
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                        К сожалению, платёж был отменён или произошла ошибка. Пожалуйста, попробуйте ещё раз.
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-sm border border-gray-100 space-y-3">
                    <p className="text-sm text-gray-600">
                        Возможные причины:
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                        <li>• Недостаточно средств на карте</li>
                        <li>• Платёж был отменён</li>
                        <li>• Техническая ошибка банка</li>
                    </ul>
                </div>

                {orderId && (
                    <p className="text-xs text-gray-400">
                        Номер заказа: {orderId}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/books"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-medium text-sm rounded-sm hover:bg-gray-50 transition-all"
                    >
                        <ArrowLeft size={16} />
                        К каталогу
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold tracking-widest text-sm rounded-sm hover:bg-black transition-all"
                    >
                        <RefreshCw size={16} />
                        Попробовать снова
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFail;
