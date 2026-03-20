import React from 'react';
import { useStore, ViewType } from '../store/store';
import { Plus, Home, Users, FileText, Wrench, BookOpen, Settings, X } from 'lucide-react';

const NAV_ITEMS: { icon: React.ReactNode; label: string; view: ViewType }[] = [
  { icon: <Home size={18} />, label: 'Home', view: 'home' },
  { icon: <Users size={18} />, label: 'My Groups', view: 'groups' },
  { icon: <FileText size={18} />, label: 'Assignments', view: 'list' },
  { icon: <Wrench size={18} />, label: "AI Teacher's Toolkit", view: 'toolkit' },
  { icon: <BookOpen size={18} />, label: 'My Library', view: 'library' },
];

export default function Sidebar() {
  const { setView, setCurrentAssignment, view, isSidebarOpen, setSidebarOpen } = useStore();

  const handleNav = (targetView: ViewType) => {
    setView(targetView);
    if (targetView !== 'create') setCurrentAssignment(null);
  };

  const isActive = (itemView: ViewType) => {
    if (itemView === 'list') return view === 'list' || view === 'create' || view === 'output';
    return view === itemView;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-[#1a1a2e]/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
      )}

      <div className={`
        fixed lg:sticky top-4 left-0 h-[calc(100vh-32px)] m-4 z-50
        w-64 bg-white shadow-2xl lg:shadow-xl flex flex-col p-6 rounded-[2rem] transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
      `}>
        {/* Close Button Mobile */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100"
        >
          <X size={18} className="text-gray-400" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2 text-2xl font-bold font-playfair mb-10">
          <div className="w-9 h-9 bg-gradient-to-br from-[#E84855] to-[#FB5607] text-white rounded-xl flex items-center justify-center shadow-lg">
            V
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1a1a2e] to-[#4b4b6b]">VedaAI</span>
        </div>

        {/* Primary Action */}
        <button
          onClick={() => { setView('create'); setCurrentAssignment(null); }}
          className="w-full bg-[#1a1a2e] text-white rounded-2xl py-4 px-4 flex items-center justify-center space-x-2 shadow-lg mb-10 hover:bg-[#E84855] hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} />
          <span className="font-bold text-sm tracking-tight text-white/90">New Assignment</span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNav(item.view)}
              className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isActive(item.view)
                  ? 'bg-[#1a1a2e] text-white shadow-[0_10px_20px_rgba(26,26,46,0.15)] scale-[1.02]'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-[#1a1a2e]'
              }`}
            >
              <span className={isActive(item.view) ? 'text-white' : 'text-gray-300'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button
            onClick={() => handleNav('settings')}
            className={`w-full flex items-center space-x-4 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
              view === 'settings'
                ? 'bg-[#1a1a2e] text-white'
                : 'text-gray-400 hover:text-[#1a1a2e] hover:bg-gray-50'
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          {/* User Badge */}
          <div className="bg-gray-50 p-4 rounded-3xl flex items-center space-x-3 border border-gray-100">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">🏫</div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-[#1a1a2e] truncate">DPS Bokaro</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Senior Teacher</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

