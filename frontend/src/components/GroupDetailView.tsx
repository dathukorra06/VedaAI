import React, { useState } from 'react';
import { ArrowLeft, Users, BookOpen, Calendar, MoreVertical, Plus, UserPlus, X, Clock } from 'lucide-react';
import { useStore, Group } from '../store/store';
import axios from 'axios';
import { API_URL } from '../config/api';

export default function GroupDetailView() {
  const { selectedGroup, setView, setSelectedGroup, setCurrentAssignment, setGroups, groups } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [adding, setAdding] = useState(false);

  if (!selectedGroup) return <div className="p-8 text-center">No group selected</div>;

  const group = selectedGroup;

  const handleAddStudent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!studentName.trim() || !group._id) return;
      
      setAdding(true);
      try {
          const { data } = await axios.post(`${API_URL}/api/groups/${group._id}/members`, { name: studentName });
          // If mock, just update local state for UI demo
          const updatedGroup = { ...group, members: [...(group.members || []), studentName], membersCount: (group.membersCount || 0) + 1 };
          setSelectedGroup(updatedGroup);
          
          // Also update the groups list in global store
          setGroups(groups.map(g => g._id === group._id ? updatedGroup : g));
          
          setStudentName('');
          setIsModalOpen(false);
      } catch (err) {
          console.error("Failed to add student", err);
      } finally {
          setAdding(false);
      }
  };

  const handleNewAssignment = () => {
      setCurrentAssignment({
          title: '',
          subject: '', // Can pre-fill if group had a subject field
          className: group.name,
          dueDate: new Date().toISOString().split('T')[0],
          questionTypes: [
            { id: '1', type: "Multiple Choice Questions", count: 4, marks: 1 },
            { id: '2', type: "Short Answer Questions", count: 3, marks: 2 }
          ]
      });
      setView('create');
  };

  return (
    <div className="flex-1 overflow-auto bg-[#f7f7fb] p-8">
      {/* Back Button */}
      <button 
        onClick={() => setView('groups')}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a2e] mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} /> Back to Groups
      </button>

      {/* Hero / Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full opacity-5" style={{ backgroundColor: group.color }}></div>
          
          <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl shadow-inner" style={{ backgroundColor: `${group.color}15` }}>
                      {group.emoji}
                  </div>
                  <div>
                      <h1 className="text-4xl font-bold font-playfair text-[#1a1a2e] mb-2">{group.name}</h1>
                      <div className="flex items-center gap-4 text-sm font-medium">
                          <span className="flex items-center gap-1.5 text-gray-400">
                             <Users size={16} style={{ color: group.color }} /> {group.membersCount || 0} Students
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400">
                             <BookOpen size={16} style={{ color: group.color }} /> {group.assignmentsCount || 0} Active Assignments
                          </span>
                      </div>
                  </div>
              </div>
              <div className="flex gap-3">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                      <UserPlus size={16} /> Add Student
                  </button>
                  <button 
                    onClick={handleNewAssignment}
                    className="bg-[#1a1a2e] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#2d2d46] transition-all shadow-md"
                  >
                      <Plus size={16} /> New Assignment
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
          {/* Members List */}
          <div className="col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-playfair text-[#1a1a2e]">Group Members</h3>
                  <button className="text-sm font-bold text-gray-400 hover:text-gray-600">View All</button>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {group.members && group.members.length > 0 ? group.members.map((member, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ backgroundColor: group.color }}>
                                  {member.charAt(0)}
                              </div>
                              <div>
                                  <div className="font-bold text-[#1a1a2e] group-hover:text-[#E84855] transition-colors">{member}</div>
                                  <div className="text-xs text-gray-400 font-medium">Student • Join Date: {new Date().toLocaleDateString()}</div>
                              </div>
                          </div>
                          <button className="text-gray-300 hover:text-gray-600 p-2">
                              <MoreVertical size={18} />
                          </button>
                      </div>
                  )) : (
                      <div className="p-12 text-center text-gray-400">
                          <Users size={40} className="mx-auto mb-3 opacity-20" />
                          <p className="font-medium italic text-sm">No members added yet</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Activity / Assignments */}
          <div className="space-y-6">
              <h3 className="text-xl font-bold font-playfair text-[#1a1a2e]">Recent Assignments</h3>
              <div className="space-y-4">
                  <div 
                    onClick={() => alert("Reviewing performance for Midterm Review Quiz...")}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                      <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                              <Calendar size={22} />
                          </div>
                          <span className="text-[10px] font-bold bg-green-50 text-green-600 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">In Progress</span>
                      </div>
                      <h4 className="font-bold text-[#1a1a2e] group-hover:text-[#E84855] transition-colors mb-2 text-lg">Midterm Review Quiz</h4>
                      <p className="text-xs text-gray-400 font-semibold mb-6 flex items-center gap-1">
                          <Clock size={12} /> Due: Mar 25, 2026
                      </p>
                      <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden mb-3 border border-gray-100">
                          <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 flex justify-between uppercase tracking-tighter">
                          <span>65% Submissions</span>
                          <span className="text-blue-600">21 of 32 Students</span>
                      </div>
                  </div>

                  <button 
                    onClick={handleNewAssignment}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                  >
                      <Plus size={16} /> Assign to Group
                  </button>
              </div>
          </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold font-playfair text-[#1a1a2e]">Add New Student</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  <form onSubmit={handleAddStudent} className="space-y-6">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Student's Full Name</label>
                          <input 
                              type="text" 
                              required
                              autoFocus
                              value={studentName}
                              onChange={e => setStudentName(e.target.value)}
                              placeholder="e.g. John Doe"
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E84855]/30"
                          />
                      </div>

                      <button 
                        type="submit"
                        disabled={adding}
                        className="w-full bg-[#1a1a2e] text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center"
                      >
                          {adding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Student'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
