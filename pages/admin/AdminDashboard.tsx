
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Book, Video, FileText, Eye, TrendingUp, Calendar, ArrowUpRight, Users, Image } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const books = useQuery(api.books.listAll);
  const media = useQuery(api.profile.listAllMedia);
  const research = useQuery(api.profile.listAllResearch);
  const orders = useQuery(api.orders.listOrders);
  const coAuthors = useQuery(api.coAuthors.listAll);
  const gallery = useQuery(api.gallery.listAll);

  const stats = [
    { label: 'Книги', value: books?.length ?? 0, icon: Book, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Статьи', value: research?.length ?? 0, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Видео', value: media?.length ?? 0, icon: Video, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Со-авторы', value: coAuthors?.length ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Фото', value: gallery?.length ?? 0, icon: Image, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Заказы', value: orders?.length ?? 0, icon: Eye, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  const chartData = [
    { name: 'Пн', visits: 45 },
    { name: 'Вт', visits: 52 },
    { name: 'Ср', visits: 38 },
    { name: 'Чт', visits: 65 },
    { name: 'Пт', visits: 48 },
    { name: 'Сб', visits: 30 },
    { name: 'Вс', visits: 25 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Обзор посещаемости</h3>
              <p className="text-sm text-slate-400">Еженедельная статистика посещений сайта.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border border-slate-100 rounded-md px-3 py-1">
              <Calendar size={14} /> Последние 7 дней
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#2563EB' : '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Последние заказы</h3>
          <div className="space-y-6">
            {(orders || []).slice(0, 3).map((order) => (
              <div key={order._id} className="flex gap-4 items-start">
                <div className={`mt-1 ${order.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  <Book size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {order.book?.title || 'Неизвестная книга'} - {order.status}
                  </p>
                  <p className="text-xs text-slate-400">{order.email}</p>
                </div>
              </div>
            ))}
            {(!orders || orders.length === 0) && (
              <p className="text-sm text-slate-400">Заказов пока нет</p>
            )}
          </div>
          <div className="pt-6 border-t border-slate-50">
             <button className="w-full flex items-center justify-between text-sm font-bold text-blue-600 group">
               Все заказы <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
