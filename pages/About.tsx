
import React from 'react';
import { Profile } from '../types';
import { Download } from 'lucide-react';

interface AboutProps {
  profile: Profile;
}

const About: React.FC<AboutProps> = ({ profile }) => {
  return (
    <div className="space-y-24 animate-fade-in max-w-2xl mx-auto">
      <header className="space-y-6 text-center">
        <h1 className="text-4xl font-serif font-bold italic text-black">Biography & CV</h1>
      </header>

      <div className="space-y-20">
        <section className="prose prose-lg prose-slate font-normal leading-relaxed text-gray-800 max-w-none">
          <p className="text-xl leading-relaxed text-black font-bold italic mb-10">
             Developing a structural perspective on human communication.
          </p>
          <p>
            {profile.extendedBio}
          </p>
          <p>
            Previously, I was a postdoctoral fellow at the Max Planck Institute for Psycholinguistics. My work has been supported by various national and international grants, allowing for a multidisciplinary approach that combines linguistic theory with experimental data.
          </p>
        </section>

        <div className="space-y-12 pt-16 border-t border-gray-200">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Curriculum Vitae</h4>
          
          <div className="grid gap-12">
            {[
              { year: '2018—Now', role: 'Full Professor', context: 'Theoretical Linguistics, State University' },
              { year: '2012—2018', role: 'Associate Professor', context: 'Department of Cognitive Science, Stanford University' },
              { year: '2008—2012', role: 'Assistant Professor', context: 'Linguistic Laboratory, Oxford University' },
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
              <Download size={14} /> Download PDF Version
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
