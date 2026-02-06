
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Save, User, Globe, FileText, Info } from 'lucide-react';

const AdminPages: React.FC = () => {
  const profileData = useQuery(api.profile.getProfile);
  const updateProfile = useMutation(api.profile.updateProfile);
  const sessionToken = localStorage.getItem('admin_session_token') || '';

  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    extendedBio: '',
    email: '',
    university: '',
    location: '',
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'contact'>('profile');

  useEffect(() => {
    if (profileData) {
      setProfile({
        name: profileData.name,
        title: profileData.title,
        bio: profileData.bio,
        extendedBio: profileData.extendedBio,
        email: profileData.email,
        university: profileData.university,
        location: profileData.location,
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    await updateProfile({
      sessionToken,
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      extendedBio: profile.extendedBio,
      email: profile.email,
      university: profile.university,
      location: profile.location,
    });
    alert('Site content updated successfully.');
  };

  if (profileData === undefined) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={14} /> Global Identity
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'about' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Info size={14} /> Extended Bio
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
            activeTab === 'contact' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe size={14} /> Contact & University
        </button>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8">
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name & Honorifics</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Academic Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.title}
                  onChange={e => setProfile({...profile, title: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Short Homepage Bio</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none resize-none"
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 italic">Visible on the front page intro section. Keep it concise.</p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Research Narrative</label>
              <textarea
                rows={10}
                className="w-full px-4 py-4 border border-slate-200 rounded-md focus:border-blue-600 outline-none font-serif text-lg leading-relaxed"
                value={profile.extendedBio}
                onChange={e => setProfile({...profile, extendedBio: e.target.value})}
              />
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-md flex gap-4">
               <div className="w-10 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400">
                 <FileText size={20} />
               </div>
               <div className="flex-1">
                 <h5 className="text-xs font-bold text-slate-900 uppercase tracking-widest">CV Document (PDF)</h5>
                 <p className="text-xs text-slate-500 mb-2">vance_cv_2024_revised.pdf</p>
                 <button className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline">Upload New Version</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Primary Academic Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                value={profile.email}
                onChange={e => setProfile({...profile, email: e.target.value})}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">University Affiliation</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.university}
                  onChange={e => setProfile({...profile, university: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Office Room / Building</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:border-blue-600 outline-none"
                  value={profile.location}
                  onChange={e => setProfile({...profile, location: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-sm rounded-md hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10"
          >
            <Save size={18} /> Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
