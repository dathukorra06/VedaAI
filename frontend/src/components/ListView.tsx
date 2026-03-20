import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useStore, Assignment } from '../store/store';

export default function ListView() {
  const { assignments, setAssignments, setView, setCurrentAssignment, setGeneratedPaper } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/assignments`);
      setAssignments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentAssignment(null);
    setView('create');
  };

  const handleView = (item: Assignment) => {
    setCurrentAssignment(item);
    setGeneratedPaper(item.generatedPaper);
    setView('output');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/api/assignments/${id}`);
      fetchAssignments();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex-1 flex justify-center items-center">Loading...</div>;

  if (assignments.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-10 h-full">
        <div className="mb-6 bg-white p-8 rounded-full shadow-lg">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E84855" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h2 className="text-2xl font-playfair font-bold text-[#1a1a2e] mb-2">No assignments yet</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
        </p>
        <button 
          onClick={handleCreate}
          className="bg-[#1a1a2e] text-white px-8 py-3 rounded-full font-semibold flex items-center shadow-[0_4px_14px_0_rgba(26,26,46,0.39)] hover:bg-[#2d2d46] transition-transform hover:scale-105"
        >
          <Plus size={20} className="mr-2" /> Create Your First Assignment
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 h-full overflow-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-[#1a1a2e] flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            Assignments
          </h1>
          <p className="text-gray-500 mt-1">Manage and create assignments for your classes.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Assignment" 
              className="pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E84855] transition-shadow shadow-sm"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 bg-white rounded-full text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <Filter size={16} /> <span>Filter By</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {assignments.map((item) => (
          <div 
            key={item._id} 
            className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer border border-gray-100 relative group overflow-hidden"
            onClick={() => handleView(item)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-lg text-[#1a1a2e] font-playfair line-clamp-1">{item.title}</h3>
              
              <div className="relative group/menu">
                <button className="text-gray-400 hover:text-gray-700 p-1" onClick={(e) => { e.stopPropagation(); }}>
                  <MoreVertical size={20} />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 group-hover/menu:opacity-100 group-hover/menu:visible invisible transition-all z-20 overflow-hidden transform origin-top-right scale-95 group-hover/menu:scale-100">
                  <button onClick={(e) => { e.stopPropagation(); handleView(item); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">View</button>
                  <button onClick={(e) => handleDelete(item._id!, e)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-medium">
              <div className="text-gray-500">
                Assigned on: <span className="text-[#1a1a2e]">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-500">
                Due: <span className="text-[#1a1a2e]">{new Date(item.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={`mt-4 w-full h-1 rounded-full ${item.jobStatus === 'done' ? 'bg-green-500' : item.jobStatus === 'error' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-10 left-1/2 transform translate-x-12 z-50">
          <button 
              onClick={handleCreate}
              className="bg-[#1a1a2e] text-white px-6 py-3 rounded-full font-semibold flex items-center shadow-[0_8px_30px_rgba(26,26,46,0.5)] hover:bg-[#2d2d46] hover:-translate-y-1 transition-all"
          >
              <Plus size={20} className="mr-2" /> Create Assignment
          </button>
      </div>

    </div>
  );
}
