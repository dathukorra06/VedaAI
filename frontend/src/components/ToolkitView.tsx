'use client';
import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Sparkles, FileQuestion, BarChart2, Brain, Edit3, ChevronRight, Zap, X, Info } from 'lucide-react';

const TOOLS = [
  {
    icon: <FileQuestion size={24} />,
    title: 'AI Question Generator',
    desc: 'Generate curriculum-aligned questions instantly from any topic or uploaded content.',
    badge: 'Most Used',
    badgeColor: '#E84855',
    color: '#E84855',
    action: 'create',
  },
  {
    icon: <Edit3 size={24} />,
    title: 'Rubric Builder',
    desc: 'Build fair, consistent grading rubrics for essays, projects, and open-ended questions.',
    badge: 'New',
    badgeColor: '#3A86FF',
    color: '#3A86FF',
    action: 'rubric',
    details: 'The Rubric Builder will allow you to specify grading criteria and levels of achievement. Our AI will then suggest point distributions and qualitative descriptors based on your learning objectives.'
  },
  {
    icon: <Brain size={24} />,
    title: 'Bloom\'s Taxonomy Mapper',
    desc: 'Map your questions to Bloom\'s levels automatically for balanced cognitive assessment.',
    badge: 'AI Powered',
    badgeColor: '#8338EC',
    color: '#8338EC',
    action: 'blooms',
    details: 'Upload any existing assessment, and our AI will categorize each question into Remember, Understand, Apply, Analyse, Evaluate, or Create. This ensures your tests reach the desired cognitive depth.'
  },
  {
    icon: <BarChart2 size={24} />,
    title: 'Performance Analyser',
    desc: 'Visualise class performance trends and identify weak areas across assessments.',
    badge: 'Coming Soon',
    badgeColor: '#6B7280',
    color: '#06D6A0',
    action: 'analyser',
    details: 'This tool will import scores from your assignments and provide heatmaps of where your class is struggling, allowing for targeted remediation and intervention.'
  },
];

export default function ToolkitView() {
  const { setView, setCurrentAssignment } = useStore();
  const [selectedTool, setSelectedTool] = useState<any>(null);

  const handleTool = (tool: any) => {
    if (tool.action === 'create') { 
        setView('create'); 
        setCurrentAssignment(null); 
    } else {
        setSelectedTool(tool);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto bg-[#f7f7fb]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8338EC] to-[#3A86FF] rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-playfair text-[#1a1a2e]">AI Teacher's Toolkit</h1>
        </div>
        <p className="text-gray-500 text-sm ml-0 md:ml-13">Supercharge your teaching with purpose-built AI tools</p>
      </div>

      {/* Feature Highlight */}
      <div className="bg-gradient-to-r from-[#8338EC] to-[#3A86FF] rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/3 translate-x-1/4"></div>
        <Zap size={32} className="mb-4 text-[#FFD700] fill-[#FFD700] opacity-80" />
        <h2 className="text-xl md:text-2xl font-playfair font-bold mb-2">All tools powered by Gemini 2.0 Flash</h2>
        <p className="text-white/80 text-sm md:text-base max-w-md leading-relaxed">
          Every tool in this toolkit leveraged state-of-the-art multimodal AI to help you design better learning experiences.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOOLS.map((tool, i) => (
          <div
            key={i}
            onClick={() => handleTool(tool)}
            className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all group flex flex-col cursor-pointer hover:shadow-xl hover:-translate-y-1`}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
                {tool.icon}
              </div>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full text-white shadow-sm" style={{ backgroundColor: tool.badgeColor }}>
                {tool.badge}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#1a1a2e] mb-2 group-hover:text-[#8338EC] transition-colors">{tool.title}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed flex-1">{tool.desc}</p>

            <div className="flex items-center text-sm font-bold transition-colors pt-4 border-t border-gray-50" style={{ color: tool.color }}>
              {tool.action === 'create' ? 'Launch Tool' : 'Preview Feature'}
              <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedTool && (
          <div className="fixed inset-0 bg-[#1a1a2e]/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full -mr-10 -mt-10" style={{ backgroundColor: selectedTool.color }}></div>
                  
                  <button onClick={() => setSelectedTool(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-full">
                      <X size={20} />
                  </button>

                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: `${selectedTool.color}15`, color: selectedTool.color }}>
                      {selectedTool.icon}
                  </div>

                  <h2 className="text-2xl font-bold font-playfair text-[#1a1a2e] mb-3">{selectedTool.title}</h2>
                  <div className="flex items-center gap-2 mb-6">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md text-white" style={{ backgroundColor: selectedTool.badgeColor }}>{selectedTool.badge}</span>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Info size={12} /> Coming in next update
                      </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-8">
                      {selectedTool.details}
                  </p>

                  <button 
                    onClick={() => setSelectedTool(null)}
                    className="w-full py-4 rounded-2xl text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: selectedTool.color }}
                  >
                      I'm Excited!
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}

