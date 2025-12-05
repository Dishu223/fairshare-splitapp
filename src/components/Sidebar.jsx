import React, { useState } from 'react';
import { Sparkles, Plus, ChevronRight, User, LogOut, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, groups, activeGroupId, onSelectGroup, onCreateGroup, onLogout, setView }) => {
  const [newGroupName, setNewGroupName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateGroup(newGroupName);
    setNewGroupName('');
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="p-6 flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xl cursor-pointer" onClick={() => setView('landing')}>
            <Sparkles size={20} />
            <span>FairShare</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* New Group Input */}
        <form onSubmit={handleSubmit} className="mb-6 relative flex-shrink-0">
          <input 
            type="text" 
            placeholder="New group name..." 
            value={newGroupName} 
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
          />
          <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
            <Plus size={16} />
          </button>
        </form>

        {/* Group List */}
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Your Groups</div>
        <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
          {groups.length > 0 ? groups.map((group) => (
            <button 
              key={group.id} 
              onClick={() => { onSelectGroup(group.id); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all duration-200 ${activeGroupId === group.id ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeGroupId === group.id ? 'bg-rose-400' : 'bg-slate-300'}`} />
                <span className="font-medium truncate">{group.name}</span>
              </div>
              {activeGroupId === group.id && <ChevronRight size={14} className="flex-shrink-0" />}
            </button>
          )) : (
            <p className="text-sm text-slate-400 italic px-4 mt-2">No groups found</p>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-9 h-9 rounded-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                <User size={18} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">{user?.displayName || 'Guest User'}</p>
              <p className="text-xs text-slate-400">{user?.isAnonymous ? 'Demo Mode' : 'Pro Plan'}</p>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-rose-500 transition-colors" title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;