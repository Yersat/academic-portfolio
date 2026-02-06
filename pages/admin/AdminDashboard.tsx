
import React from 'react';
import { SiteData } from '../../types';
import { Book, Video, FileText, Eye, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  data: SiteData;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data }) => {
  const stats = [
    { label: 'Books', value: data.books.length, icon: Book, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Media Items', value: data.media.length, icon: Video, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Research Papers', value: data.research.length, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Site Visits (Mock)', value: '1.2k', icon: Eye, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  const chartData = [
    { name: 'Mon', visits: 45 },
    { name: 'Tue', visits: 52 },
    { name: 'Wed', visits: 38 },
    { name: 'Thu', visits: 65 },
    { name: 'Fri', visits: 48 },
    { name: 'Sat', visits: 30 },
    { name: 'Sun', visits: 25 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-500 flex items-center">
                <TrendingUp size={14} className="mr-1" /> +12%
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Traffic Overview</h3>
              <p className="text-sm text-slate-400">Weekly site engagement metrics.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border border-slate-100 rounded-md px-3 py-1">
              <Calendar size={14} /> Last 7 Days
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

        {/* Quick Actions / Recent Activity */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { text: 'Book "Architecture of Syntax" updated', time: '2h ago', icon: Book, color: 'text-blue-500' },
              { text: 'New lecture recording added', time: '5h ago', icon: Video, color: 'text-amber-500' },
              { text: 'CV PDF replaced', time: 'Yesterday', icon: FileText, color: 'text-emerald-500' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`mt-1 ${activity.color}`}>
                  <activity.icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-slate-50">
             <button className="w-full flex items-center justify-between text-sm font-bold text-blue-600 group">
               View System Logs <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
