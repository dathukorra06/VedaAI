'use client';
import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ListView from '../components/ListView';
import CreateView from '../components/CreateView';
import OutputView from '../components/OutputView';
import HomeView from '../components/HomeView';
import GroupsView from '../components/GroupsView';
import ToolkitView from '../components/ToolkitView';
import LibraryView from '../components/LibraryView';
import SettingsView from '../components/SettingsView';
import GroupDetailView from '../components/GroupDetailView';
import { useStore } from '../store/store';

export default function Page() {
  const { view } = useStore();

  const renderView = () => {
    switch (view) {
      case 'home':     return <HomeView />;
      case 'list':     return <ListView />;
      case 'create':   return <CreateView />;
      case 'output':   return <OutputView />;
      case 'groups':   return <GroupsView />;
      case 'group-detail': return <GroupDetailView />;
      case 'toolkit':  return <ToolkitView />;
      case 'library':  return <LibraryView />;
      case 'settings': return <SettingsView />;
      default:         return <ListView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f0f7]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 flex overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
