'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, FileText, Download, Clock, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useStore } from '../store/store';

const SUBJECT_COLORS: any = {
  'Physics': '#3A86FF',
  'Science': '#E84855',
  'Chemistry': '#8338EC',
  'Mathematics': '#06D6A0',
  'English': '#FB5607',
  'Social Studies': '#FFB703',
  'default': '#6B7280'
};

const SUBJECTS = ['All', 'Physics', 'Science', 'Chemistry', 'Mathematics', 'English', 'Social Studies'];

export default function LibraryView() {
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const { assignments, setAssignments, setView, setCurrentAssignment } = useStore();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/assignments`);
        setAssignments(data);
      } catch (err) {
        console.error("Failed to fetch library items", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const filtered = (assignments || []).filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchSubject = activeSubject === 'All' || item.subject === activeSubject;
    return matchSearch && matchSubject;
  });

  const handleOpen = (item: any) => {
      setCurrentAssignment(item);
      setView('output');
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto bg-[#f7f7fb]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-playfair text-[#1a1a2e]">My Library</h1>
          <p className="text-gray-500 text-sm mt-1">Your generated assessments and resources</p>
        </div>
        {!loading && (
          <div className="self-start md:self-center flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
            <Filter size={14} />
            <span>{filtered.length} resources</span>
          </div>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your library..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E84855]/30 shadow-sm"
          />
        </div>

        {/* Subject filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap">
          {SUBJECTS.map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeSubject === sub ? 'bg-[#1a1a2e] text-white shadow-md scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-[#E84855] animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading your library...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item, i) => {
            const color = SUBJECT_COLORS[item.subject] || SUBJECT_COLORS['default'];
            return (
              <div 
                key={i} 
                onClick={() => handleOpen(item)}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${color}15` }}>
                    <FileText size={22} style={{ color }} />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${color}15`, color }}>
                    {item.className}
                  </span>
                </div>

                <h3 className="font-bold text-[#1a1a2e] text-lg mb-2 group-hover:text-[#E84855] transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-gray-400 mb-6 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                  {item.subject}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-50 pt-4 mt-auto">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <button className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-[#E84855] hover:text-white transition-all font-bold">
                        <Download size={12} />
                        View
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
          <p className="font-bold text-[#1a1a2e]">No resources found</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try a different search term or change your subject filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}
