'use client';
import React, { useState } from 'react';
import { Settings, Bell, Palette, User, Shield, ChevronRight, Check, X, Camera } from 'lucide-react';

const ACCENT_COLORS = ['#E84855', '#3A86FF', '#8338EC', '#06D6A0', '#FB5607', '#FFB703'];

export default function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [accentColor, setAccentColor] = useState('#E84855');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profile, setProfile] = useState({
      name: 'Teacher',
      school: 'Delhi Public School, Bokaro Steel City',
      role: 'Admin · Senior Teacher'
  });
  const [tempProfile, setTempProfile] = useState(profile);

  const handleUpdateProfile = (e: React.FormEvent) => {
      e.preventDefault();
      setProfile(tempProfile);
      setIsProfileModalOpen(false);
      alert("Profile updated successfully!");
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? 'bg-[#E84855]' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-7' : 'translate-x-1'}`}></div>
    </button>
  );

  const Section = ({ title, icon, children }: any) => (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#1a1a2e]/5 flex items-center justify-center text-[#1a1a2e] shadow-inner">{icon}</div>
        <h2 className="text-xl font-bold text-[#1a1a2e] font-playfair">{title}</h2>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, sub, right }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-50 last:border-0 gap-2">
      <div>
        <div className="text-sm font-bold text-gray-800">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-1 font-medium">{sub}</div>}
      </div>
      <div className="self-end sm:self-auto">
        {right}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto bg-[#f7f7fb]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-playfair text-[#1a1a2e]">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account and platform preferences</p>
        </div>

        {/* Profile */}
        <Section title="Profile" icon={<User size={18} />}>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E84855] to-[#FB5607] flex items-center justify-center text-white text-3xl font-bold shadow-lg relative group">
                {profile.name.charAt(0)}
                <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera size={20} />
                </div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-xl font-bold text-[#1a1a2e]">{profile.name}</div>
              <div className="text-sm text-gray-500 font-medium">{profile.school}</div>
              <div className="inline-block px-3 py-1 bg-[#E84855]/10 text-[#E84855] text-xs font-bold rounded-full mt-2">
                  {profile.role}
              </div>
            </div>
          </div>
          <button 
            onClick={() => { setTempProfile(profile); setIsProfileModalOpen(true); }}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-50 text-[#1a1a2e] font-bold text-sm rounded-xl border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            Edit Profile <ChevronRight size={14} />
          </button>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={<Bell size={18} />}>
          <Row
            label="Assignment Notifications"
            sub="Receive instant alerts when AI generation completes"
            right={<Toggle value={notifications} onChange={setNotifications} />}
          />
          <Row
            label="Sound Effects"
            sub="Audio feedback for system events"
            right={<Toggle value={sound} onChange={setSound} />}
          />
          <div className="mt-4">
              <button 
                onClick={() => alert("Success! Notifications are working correctly.")}
                className="text-xs font-bold text-[#3A86FF] hover:underline"
              >
                  Send test notification
              </button>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={<Palette size={18} />}>
          <Row
            label="Primary Theme Color"
            sub="Customise the interface highlight color"
            right={
              <div className="flex gap-2.5">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all hover:scale-125 hover:rotate-12 shadow-sm"
                    style={{ backgroundColor: color, borderColor: accentColor === color ? '#1a1a2e' : 'transparent' }}
                  >
                    {accentColor === color && <Check size={14} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            }
          />
        </Section>

        {/* Security */}
        <Section title="Security & API" icon={<Shield size={18} />}>
          <Row label="Change Password" right={<ChevronRight size={18} className="text-gray-300" />} />
          <Row label="API Integration" sub="Integrate with Google Drive or LMS" right={<ChevronRight size={18} className="text-gray-300" />} />
          <Row label="Active Sessions" sub="Bokaro, IN • Currently active" right={<span className="text-[10px] font-bold text-green-500 uppercase">Live</span>} />
        </Section>
      </div>

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
          <div className="fixed inset-0 bg-[#1a1a2e]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold font-playfair text-[#1a1a2e]">Edit Profile</h2>
                      <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                          <input 
                              type="text" 
                              required
                              value={tempProfile.name}
                              onChange={e => setTempProfile({...tempProfile, name: e.target.value})}
                              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E84855]/30 font-medium"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">School / Institution</label>
                          <input 
                              type="text" 
                              required
                              value={tempProfile.school}
                              onChange={e => setTempProfile({...tempProfile, school: e.target.value})}
                              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E84855]/30 font-medium"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Official Role</label>
                          <input 
                              type="text" 
                              required
                              value={tempProfile.role}
                              onChange={e => setTempProfile({...tempProfile, role: e.target.value})}
                              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E84855]/30 font-medium"
                          />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-4 bg-[#1a1a2e] text-white font-bold rounded-2xl shadow-lg hover:bg-[#2d2d46] hover:-translate-y-1 transition-all"
                      >
                          Save Changes
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
