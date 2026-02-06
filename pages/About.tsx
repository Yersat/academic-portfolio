
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const About: React.FC = () => {
  const profiles = useQuery(api.profile.getProfiles);

  if (profiles === undefined) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }
  if (!profiles || profiles.length === 0) {
    return <div className="text-center py-20 text-gray-400">Профили не найдены</div>;
  }

  return (
    <div className="space-y-24 animate-fade-in max-w-2xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Об авторах</h1>
      </header>

      <div className="space-y-20">
        {profiles.map((profile) => (
          <section key={profile._id} className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-bold text-black">
                {profile.name}
              </h2>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                {profile.title}
              </p>
              {profile.university && (
                <p className="text-sm text-gray-600 italic">
                  {profile.university}
                </p>
              )}
            </div>

            <div className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none space-y-4">
              <p>{profile.bio}</p>
              <p>{profile.extendedBio}</p>
            </div>

            {profile.researchInterests.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-4">Научные интересы</h4>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                  {profile.researchInterests.map((interest: string) => (
                    <span key={interest} className="text-[11px] uppercase tracking-[0.15em] font-bold text-gray-700">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default About;
