import React from 'react';
import { Bell, ArrowLeft, Grid, Menu } from 'lucide-react';
import { useStore, ViewType } from '../store/store';

const VIEW_TITLES: Record<ViewType, string> = {
  home:     'Home',
  list:     'Assignments',
  create:   'Create Assignment',
  output:   'Generated Paper',
  groups:   'My Groups',
  'group-detail': 'Group Details',
  toolkit:  "AI Teacher's Toolkit",
  library:  'My Library',
  settings: 'Settings',
};

const BACK_MAP: Partial<Record<ViewType, ViewType>> = {
  create: 'list',
  output: 'list',
  'group-detail': 'groups',
};

export default function TopBar() {
  const { view, setView, setSidebarOpen } = useStore();
  const backTarget = BACK_MAP[view];

  return (
    <div className="flex justify-between items-center px-4 md:px-6 py-4 bg-white rounded-3xl mt-4 mr-4 shadow-sm relative z-10 ml-4 lg:ml-2">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
        >
          <Menu size={20} />
        </button>

        {backTarget && (
          <button
            onClick={() => setView(backTarget)}
            className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all shadow-sm"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
        )}
        <div className="flex items-center space-x-2 text-gray-400">
          <Grid size={18} className="hidden sm:block" />
          <span className="font-bold text-[#1a1a2e] text-sm md:text-base">{VIEW_TITLES[view] ?? 'VedaAI'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <button className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <Bell size={20} className="text-gray-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#E84855] rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-gray-100 pl-4 md:pl-6 cursor-pointer group">
          <div className="hidden md:block text-right">
            <div className="text-xs font-bold text-[#1a1a2e] group-hover:text-[#E84855] transition-colors">Teacher</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">DPS Bokaro</div>
          </div>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"
            alt="User"
            className="w-10 h-10 rounded-2xl bg-gray-50 shadow-sm border border-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

