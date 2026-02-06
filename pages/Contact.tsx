
import React, { useState } from 'react';
import { Profile } from '../types';
import { Mail, MapPin, Building2, Send } from 'lucide-react';

interface ContactProps {
  profile: Profile;
}

const Contact: React.FC<ContactProps> = ({ profile }) => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="space-y-16">
      <header className="space-y-4">
        <h1 className="text-5xl font-serif font-bold">Get in Touch</h1>
        <p className="text-xl text-gray-500 max-w-2xl font-light">
          For inquiries regarding guest lectures, research collaborations, or media appearances, please reach out via the form below or professional email.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-16">
        <div className="space-y-12">
          <section className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center flex-shrink-0 rounded-sm">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-1">Email</h4>
                <p className="text-lg font-medium text-gray-900">{profile.email}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center flex-shrink-0 rounded-sm">
                <Building2 size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-1">Affiliation</h4>
                <p className="text-lg font-medium text-gray-900">{profile.university}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center flex-shrink-0 rounded-sm">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 mb-1">Office Location</h4>
                <p className="text-lg font-medium text-gray-900">{profile.location}</p>
              </div>
            </div>
          </section>

          <div className="p-8 bg-blue-50 border border-blue-100 rounded-sm">
            <h4 className="text-blue-900 font-serif font-bold mb-2 italic">Student Information</h4>
            <p className="text-sm text-blue-800/80 leading-relaxed font-light">
              Students seeking thesis supervision should attach their research proposal (2-3 pages) and latest transcript before requesting a formal meeting.
            </p>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 border border-gray-100 shadow-xl rounded-sm">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Your Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Academic Email</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium"
                placeholder="jane@university.edu"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Subject</label>
              <select className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium appearance-none">
                <option>General Inquiry</option>
                <option>Research Collaboration</option>
                <option>Media/Lecture Request</option>
                <option>Student Supervision</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-gray-400">Message</label>
              <textarea 
                required
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border-transparent border-b-gray-200 border-2 focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium resize-none"
                placeholder="How can I help you?"
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
                <>Message Sent <Send size={16} className="ml-2" /></>
              ) : (
                <>Send Message <Send size={16} className="ml-2" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
