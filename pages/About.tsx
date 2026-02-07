
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Download } from 'lucide-react';

const About: React.FC = () => {
  const profile = useQuery(api.profile.getProfile);

  if (profile === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }
  if (!profile) {
    return <div className="text-center py-20 text-gray-400">Профиль не найден</div>;
  }

  return (
    <div className="space-y-24 animate-fade-in max-w-2xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Обо мне</h1>
      </header>

      <div className="space-y-20">
        <section className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
          <p className="text-xl leading-relaxed text-black font-bold italic mb-10">
             Научная деятельность в области культурологии, философии и искусствоведения.
          </p>
          <p>
            {profile.extendedBio}
          </p>
        </section>

        {/* Аязбекова Сабина CV */}
        <div className="space-y-12 pt-16 border-t border-gray-200">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Curriculum Vitae</h4>

          <div className="grid gap-12">
            {[
              { year: '2012—н.в.', role: 'Профессор', context: 'Кафедра искусствоведения и культурологии' },
              { year: '2005—2012', role: 'Доцент', context: 'Кафедра теории и истории культуры' },
              { year: '1998—2005', role: 'Старший преподаватель', context: 'Кафедра музыковедения и культурологии' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-16">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 w-32 shrink-0">{item.year}</span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-black uppercase tracking-wider">{item.role}</p>
                  <p className="text-sm text-gray-700 font-normal italic">{item.context}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12">
            <a
              href={profile.cvUrl}
              className="inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black border-b-2 border-black pb-2 hover:text-gray-600 hover:border-gray-400 transition-all"
            >
              <Download size={14} /> Скачать PDF версию
            </a>
          </div>
        </div>

        {/* Аязбеков Скандарбек — Соавтор */}
        <div className="space-y-12 pt-16 border-t border-gray-200">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Соавтор — Аязбеков Скандарбек</h4>

          <div className="grid gap-12">
            {[
              { year: '2010—н.в.', role: 'Профессор', context: 'Кафедра культурологии и философии' },
              { year: '2003—2010', role: 'Доцент', context: 'Кафедра социально-гуманитарных дисциплин' },
              { year: '1995—2003', role: 'Старший преподаватель', context: 'Кафедра философии и методологии науки' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-16">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600 w-32 shrink-0">{item.year}</span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-black uppercase tracking-wider">{item.role}</p>
                  <p className="text-sm text-gray-700 font-normal italic">{item.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
