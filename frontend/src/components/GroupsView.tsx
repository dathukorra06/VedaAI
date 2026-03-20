'use client';
import React, { useState, useEffect } from 'react';
import { Users, Plus, ChevronRight, Search, BookOpen, MoreVertical, X } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useStore, Group } from '../store/store';

const COLORS = ['#E84855', '#3A86FF', '#8338EC', '#FB5607', '#06D6A0'];
const EMOJIS = ['🎓', '🔬', '📐', '📖', '🌍', '🎨', '💻', '🧪'];

export default function GroupsView() {
  const { groups, setGroups, setView, setSelectedGroup } = useStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
      name: '',
      emoji: EMOJIS[0],
      color: COLORS[0]
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
        const { data } = await axios.get(`${API_URL}/api/groups`);
        setGroups(data);
    } catch (err) {
        console.error("Failed to fetch groups", err);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name) return;

    try {
        const { data } = await axios.post(`${API_URL}/api/groups`, newGroup);
        setGroups([data.group, ...groups]);
        setIsModalOpen(false);
        setNewGroup({ name: '', emoji: EMOJIS[0], color: COLORS[0] });
    } catch (err) {
        console.error("Failed to create group", err);
    }
  };

  const handleViewGroup = (group: Group) => {
      setSelectedGroup(group);
      setView('group-detail');
  };

  const filtered = (groups || []).filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 p-8 overflow-auto bg-[#f7f7fb]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-[#1a1a2e]">My Groups</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your student groups and class sections</p>
        </div>
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-[#1a1a2e] text-white px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-[#2d2d46] transition-all shadow-md"
        >
          <Plus size={16} /> New Group
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E84855]/30"
        />
      </div>

      {/* Groups Grid */}
      {loading ? (
          <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((group, i) => (
            <div key={group._id || i} onClick={() => handleViewGroup(group)} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${group.color}15` }}>
                    {group.emoji}
                    </div>
                    <div>
                    <h3 className="font-bold text-[#1a1a2e] group-hover:text-[#E84855] transition-colors">{group.name}</h3>
                    <p className="text-xs text-gray-400">{group.membersCount || 0} students</p>
                    </div>
                </div>
                <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreVertical size={18} />
                </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                    <BookOpen size={14} style={{ color: group.color }} />
                    <span>{group.assignmentsCount || 0} assignments</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users size={14} style={{ color: group.color }} />
                    <span>{group.membersCount || 0} members</span>
                </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                    {[...Array(Math.min(4, group.membersCount || 0))].map((_, j) => (
                    <div key={j} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: group.color }}>
                        {String.fromCharCode(65 + j)}
                    </div>
                    ))}
                    {(group.membersCount || 0) > 4 && (
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                        +{(group.membersCount || 0) - 4}
                    </div>
                    )}
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleViewGroup(group); }}
                    className="text-xs font-semibold flex items-center gap-1 transition-colors" 
                    style={{ color: group.color }}
                >
                    View Group <ChevronRight size={12} />
                </button>
                </div>
            </div>
            ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No groups found for "{search}"</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold font-playfair text-[#1a1a2e]">Create New Group</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  <form onSubmit={handleCreateGroup} className="space-y-6">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
                          <input 
                              type="text" 
                              required
                              value={newGroup.name}
                              onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                              placeholder="e.g. Science Class - 10A"
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E84855]/30"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Emoji</label>
                          <div className="flex flex-wrap gap-2">
                              {EMOJIS.map(e => (
                                  <button 
                                    key={e}
                                    type="button"
                                    onClick={() => setNewGroup({...newGroup, emoji: e})}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${newGroup.emoji === e ? 'bg-[#1a1a2e] scale-110 shadow-md' : 'bg-gray-50 hover:bg-gray-100'}`}
                                  >
                                      {e}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Theme Color</label>
                          <div className="flex flex-wrap gap-3">
                              {COLORS.map(c => (
                                  <button 
                                    key={c}
                                    type="button"
                                    onClick={() => setNewGroup({...newGroup, color: c})}
                                    className={`w-8 h-8 rounded-full transition-all ${newGroup.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                  />
                              ))}
                          </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#1a1a2e] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      >
                          Create Group
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
