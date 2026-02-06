
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Plus, Video, Trash2, Edit3, Link2 } from 'lucide-react';

const AdminMedia: React.FC = () => {
  const media = useQuery(api.profile.listAllMedia);
  const deleteMedia = useMutation(api.profile.deleteMedia);
  const sessionToken = localStorage.getItem('admin_session_token') || '';

  const handleDelete = async (id: Id<"mediaItems">) => {
    if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      await deleteMedia({ sessionToken, id });
    }
  };

  if (media === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-slate-400 text-sm font-medium">Архив записей лекций и медиа-выступлений</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-900/10">
          <Plus size={18} /> Добавить медиа
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(media || []).map((item) => (
          <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
            <div className="aspect-video bg-slate-100 relative">
               <img src={`https://picsum.photos/seed/${item._id}/400/225`} className="w-full h-full object-cover" alt="" />
               <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="bg-white p-3 rounded-full text-slate-900 hover:scale-110 transition-transform">
                   <Video size={20} />
                 </button>
               </div>
               <div className="absolute bottom-2 right-2 flex gap-1">
                 {item.tags.map(t => (
                   <span key={t} className="px-2 py-0.5 bg-black/60 text-white text-[8px] uppercase tracking-widest rounded-sm">{t}</span>
                 ))}
               </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{item.type}</span>
                <h4 className="font-bold text-slate-900 leading-tight">{item.title}</h4>
                <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                 <div className="flex gap-1">
                   <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                     <Edit3 size={16} />
                   </button>
                   <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md">
                     <Link2 size={16} />
                   </button>
                 </div>
                 <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMedia;
