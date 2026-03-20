'use client';
import React from 'react';
import { useStore } from '../store/store';
import {
  BookOpen, Users, BarChart3, Clock, TrendingUp,
  Star, Award, ChevronRight, Plus
} from 'lucide-react';

const stats = [
  { label: 'Assignments Created', value: '24', icon: <BookOpen size={20} />, color: '#E84855' },
  { label: 'Students Reached', value: '312', icon: <Users size={20} />, color: '#3A86FF' },
  { label: 'Avg. Score', value: '76%', icon: <BarChart3 size={20} />, color: '#8338EC' },
  { label: 'Hours Saved', value: '18h', icon: <Clock size={20} />, color: '#06D6A0' },
];

const recentActivity = [
  { text: 'Science Midterm generated', time: '2 hours ago', icon: '📄', target: 'list' as const },
  { text: 'Physics Quiz published', time: 'Yesterday', icon: '✅', target: 'list' as const },
  { text: 'Maths Assignment reviewed', time: '2 days ago', icon: '✏️', target: 'list' as const },
  { text: 'Chemistry Test created', time: '3 days ago', icon: '🔬', target: 'list' as const },
];

const tips = [
  { title: 'Add more context', desc: 'Include specific chapters or topics for better AI-generated questions.', icon: '💡' },
  { title: 'Mix difficulty levels', desc: 'A 30-50-20 easy-moderate-hard split keeps assessments well-balanced.', icon: '⚖️' },
  { title: 'Use file upload', desc: 'Upload your lesson notes as PDF for hyper-relevant question generation.', icon: '📎' },
];

export default function HomeView() {
  const { setView, setCurrentAssignment } = useStore();

  return (
    <div className="flex-1 p-8 overflow-auto bg-[#f7f7fb]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2d2d46] rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute right-24 bottom-0 w-32 h-32 bg-[#E84855] opacity-20 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-medium mb-1">Good evening 👋</p>
          <h1 className="text-3xl font-playfair font-bold mb-2">Welcome back, Teacher!</h1>
          <p className="text-gray-400 text-sm max-w-md">
            Your AI-powered assessment suite is ready. Create a question paper in seconds.
          </p>
          <button
            onClick={() => { setView('create'); setCurrentAssignment(null); }}
            className="mt-6 bg-[#E84855] hover:bg-[#c73642] text-white px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg"
          >
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-[#1a1a2e] font-mono">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#1a1a2e] font-playfair">Recent Activity</h2>
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-1 text-xs font-semibold text-[#E84855] hover:underline"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <button
                key={i}
                onClick={() => setView(item.target)}
                className="w-full flex items-center gap-3 group text-left hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
              >
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-lg shrink-0">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800 group-hover:text-[#E84855] transition-colors">{item.text}</div>
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-[#E84855] transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Tips Panel */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#1a1a2e] font-playfair">Pro Tips</h2>
            <Star size={18} className="text-yellow-400" />
          </div>
          <div className="space-y-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <span className="text-xl shrink-0">{tip.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-[#1a1a2e]">{tip.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#E84855]/10 to-[#FB5607]/10 border border-[#E84855]/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#E84855]">
              <Award size={16} /> You saved 18 hours this month with VedaAI!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
