
import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Mail, MapPin, Building2, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const profiles = useQuery(api.profile.getProfiles);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  if (profiles === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  const profile = profiles?.[0];

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <h1 className="text-5xl font-serif font-bold">Контакты</h1>
        <p className="text-xl text-gray-500 max-w-2xl font-light">
          По вопросам приобретения книг, научного сотрудничества и приглашений на конференции.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-16">
        <div className="space-y-12">
          <section className="space-y-8">
            {profile && (
              <>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center flex-shrink-0 rounded-sm">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-1">Электронная почта</h4>
                    <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center flex-shrink-0 rounded-sm">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-1">Место работы</h4>
                    <p className="text-lg font-medium text-gray-900">{profile.university}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center flex-shrink-0 rounded-sm">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-1">Местоположение</h4>
                    <p className="text-lg font-medium text-gray-900">{profile.location}</p>
                  </div>
                </div>
              </>
            )}
          </section>

          <div className="p-8 bg-blue-50 border border-blue-100 rounded-sm">
            <h4 className="text-blue-900 font-serif font-bold mb-2 italic">Издательство Bilig</h4>
            <p className="text-sm text-blue-800/80 leading-relaxed font-light">
              Издательская деятельность, выпуск научных монографий и учебных пособий.
              Контактный email: biligbaspa@mail.ru
            </p>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-gray-100 shadow-xl rounded-sm">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Ваше имя</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium"
                placeholder="Иванов Иван"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Email</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium"
                placeholder="ivanov@mail.ru"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Тема</label>
              <select className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium appearance-none">
                <option>Общий вопрос</option>
                <option>Научное сотрудничество</option>
                <option>Приобретение книг</option>
                <option>Приглашение на конференцию</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Сообщение</label>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"
                placeholder="Ваше сообщение..."
              />
            </div>

            <button
              type="submit"
              disabled={sent}
              className={`w-full py-4 flex items-center justify-center font-bold uppercase tracking-widest text-sm rounded-sm transition-all ${
                sent ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              {sent ? (
                <>Сообщение отправлено <Send size={16} className="ml-2" /></>
              ) : (
                <>Отправить <Send size={16} className="ml-2" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
