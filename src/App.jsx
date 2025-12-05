import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase'; 
import { signInAnonymously, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { Heart, Home, Sparkles, Plus, ArrowRightLeft, Trash2, RotateCcw, History, MessageCircle, Menu, UserPlus, Receipt } from 'lucide-react';

// Hooks & Components
import { useFairShare } from './hooks/useFairShare';
import Sidebar from './components/Sidebar';
import Landing from './components/Landing';
import Button from './components/ui/Button';
import ConfirmModal from './components/modals/ConfirmModal';
import TransactionModal from './components/modals/TransactionModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState('landing'); 

  // Core Logic Hook (Data & Actions)
  const { 
    groups, expenses, loading: dataLoading, 
    createGroup, addMember, addTransaction, deleteTransaction, deleteGroup 
  } = useFairShare(user);

  // UI State
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalMode, setTxModalMode] = useState('expense');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [newMemberName, setNewMemberName] = useState('');

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) setView('dashboard');
    });
    return () => unsubscribe();
  }, []);

  // --- Auth Handlers ---
  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { await signInAnonymously(auth); }
  };
  const handleGuestLogin = async () => await signInAnonymously(auth);
  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
    setActiveGroupId(null);
  };

  // --- Helper to Open Modal ---
  const openTxModal = (mode) => {
    setTxModalMode(mode);
    setIsTxModalOpen(true);
  };

  // --- Derived State (Math) ---
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeExpenses = expenses.filter(ex => ex.groupId === activeGroupId && ex.deleted === showDeleted);
  const groupTotal = activeExpenses.filter(ex => ex.type !== 'settlement').reduce((sum, ex) => sum + ex.amount, 0);

  // Calculate Balances
  const balances = {};
  if (activeGroup) {
    activeGroup.members?.forEach(m => balances[m] = 0);
    activeExpenses.forEach(ex => {
      const paidBy = ex.payer;
      const amount = ex.amount;
      if (ex.type === 'settlement') {
        if (balances[paidBy] !== undefined) balances[paidBy] += amount;
        if (balances[ex.receiver] !== undefined) balances[ex.receiver] -= amount;
      } else {
        if (balances[paidBy] !== undefined) balances[paidBy] += amount;
        if (ex.splitType === 'unequal' && ex.splits) {
          Object.entries(ex.splits).forEach(([m, val]) => { if (balances[m] !== undefined) balances[m] -= parseFloat(val); });
        } else {
          const split = amount / (activeGroup.members?.length || 1);
          activeGroup.members?.forEach(m => { if (balances[m] !== undefined) balances[m] -= split; });
        }
      }
    });
  }

  // --- Helpers ---
  const shareWhatsapp = () => {
    if (!activeGroup) return;
    let msg = `*${activeGroup.name} Summary*\n`;
    Object.entries(balances).forEach(([m, b]) => {
      if (Math.abs(b) > 1) msg += `${m}: ${b > 0 ? 'Gets' : 'Owes'} ₹${Math.abs(b).toFixed(0)}\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-rose-50"><Heart className="animate-bounce text-rose-400" size={48} /></div>;

  if (view === 'landing') return <Landing onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;

  // DASHBOARD VIEW
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        groups={groups}
        activeGroupId={activeGroupId}
        onSelectGroup={(id) => { setActiveGroupId(id); setIsSidebarOpen(false); }}
        onCreateGroup={createGroup}
        onLogout={handleLogout}
        setView={setView}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header Toggle */}
        <div className="md:hidden p-4 bg-white border-b flex justify-between items-center">
          <button 
            onClick={() => setView('landing')} 
            className="font-bold text-rose-500 flex gap-2 items-center"
          >
            <Sparkles size={20} /> 
            <span>FairShare</span>
          </button>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="text-slate-600" />
          </button>
        </div>

        {activeGroup ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto pb-20">
              {/* --- GROUP HEADER SECTION --- */}
              <div className="flex flex-col md:flex-row justify-between mb-8 gap-6 items-start">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-3 font-medium">
                    <button onClick={() => setActiveGroupId(null)} className="hover:text-slate-600 transition-colors flex items-center gap-1">
                       <Home size={16} /> 
                    </button>
                    <span>/</span> 
                    <button onClick={() => setActiveGroupId(null)} className="hover:text-slate-600 transition-colors">
                       Groups
                    </button>
                    <span>/</span> 
                    <span className="text-rose-500 font-bold">{activeGroup.name}</span>
                  </div>
                  
                  {/* BALANCED: 4xl md:5xl (Big but not huge) */}
                  <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-5">{activeGroup.name}</h1>
                  
                  <div className="flex items-center gap-3">
                    {/* BALANCED: w-10 (40px) */}
                    <div className="flex -space-x-2">
                      {activeGroup.members?.map(m => (
                        <div key={m} className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm" title={m}>{m[0].toUpperCase()}</div>
                      ))}
                    </div>
                    
                    <form onSubmit={(e) => { e.preventDefault(); addMember(activeGroupId, newMemberName); setNewMemberName(''); }} className="flex gap-2">
                      <input placeholder="Add friend..." value={newMemberName} onChange={e => setNewMemberName(e.target.value)} className="bg-white border border-slate-200 rounded-full px-4 py-2 text-sm w-36 shadow-sm focus:ring-2 focus:ring-rose-100 outline-none transition-all" />
                      <button className="bg-rose-100 text-rose-500 p-2 rounded-full hover:bg-rose-200 transition-colors"><UserPlus size={18} /></button>
                    </form>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-right min-w-[200px]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Spend</p>
                    {/* BALANCED: 3xl */}
                    <p className="text-3xl font-black text-slate-800 mt-1">₹{groupTotal.toFixed(0)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="whatsapp" onClick={shareWhatsapp} className="!py-2 !px-4 !text-sm !rounded-xl gap-2 font-bold">
                      <MessageCircle size={16} /> WhatsApp
                    </Button>
                    <button onClick={() => setShowDeleted(!showDeleted)} className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors" title="View History">
                      {showDeleted ? <RotateCcw size={18} /> : <History size={18} />}
                    </button>
                    <button onClick={() => setConfirmModal({isOpen: true, title: 'Delete Group?', message: 'Undo?', onConfirm: () => { deleteGroup(activeGroupId); setActiveGroupId(null); setConfirmModal({isOpen: false}); }})} className="p-2.5 text-slate-300 hover:text-red-500 transition-colors" title="Delete Group">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* --- BALANCES SECTION --- */}
              {!showDeleted && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {Object.entries(balances).map(([m, val]) => Math.abs(val) > 1 && (
                    <div key={m} className={`p-5 rounded-2xl border flex justify-between items-center shadow-sm transition-all hover:shadow-md ${val > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                      <div className="flex items-center gap-3">
                         {/* BALANCED: w-10 text-base */}
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${val > 0 ? 'bg-emerald-200 text-emerald-700' : 'bg-orange-200 text-orange-700'}`}>{m[0]}</div>
                         <span className="font-bold text-lg">{m}</span>
                      </div>
                      <div className="text-right">
                         <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${val > 0 ? 'text-emerald-500' : 'text-orange-400'}`}>{val > 0 ? 'GETS BACK' : 'OWES'}</p>
                         {/* BALANCED: text-xl */}
                         <p className="font-black text-xl">₹{Math.abs(val).toFixed(0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- ACTION BUTTONS --- */}
              {!showDeleted && (
                <div className="flex gap-3 mb-8">
                  {/* BALANCED: text-base, py-3 px-6 */}
                  <Button onClick={() => openTxModal('expense')} className="px-6 py-3 text-base shadow-rose-200/50">
                    <Plus size={20} /> Add Expense
                  </Button>
                  <Button onClick={() => openTxModal('settlement')} variant="settle" className="px-6 py-3 text-base border-2">
                    <ArrowRightLeft size={20} /> Settle Up
                  </Button>
                </div>
              )}

              {/* --- EXPENSE LIST --- */}
              <div className="space-y-3">
                {showDeleted && <div className="p-4 bg-slate-100 rounded-xl mb-4 text-center text-slate-500 text-sm">Viewing <strong>Deleted Items</strong></div>}
                
                {activeExpenses.map(ex => (
                  <div key={ex.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all hover:-translate-y-0.5 relative">
                    <div className="flex items-center gap-4">
                      {/* BALANCED: w-12 (standard icon box) */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${ex.type === 'settlement' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        {ex.type === 'settlement' ? <ArrowRightLeft size={22} /> : <Receipt size={22} />}
                      </div>
                      <div>
                        {/* BALANCED: text-lg */}
                        <h4 className="font-bold text-slate-800 text-lg mb-0.5 flex items-center gap-2">
                          {ex.desc}
                          {ex.splitType === 'unequal' && <span className="text-[10px] bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Unequal</span>}
                        </h4>
                        <p className="text-sm text-slate-400 font-medium">
                          <span className="text-slate-600 font-bold">{ex.payer}</span> {ex.type === 'settlement' ? <span className="text-emerald-500 font-bold"> paid </span> : ' paid • '}
                          {ex.type === 'settlement' && <span className="text-slate-600 font-bold">{ex.receiver}</span>}
                          {ex.type !== 'settlement' && (<span>{ex.date}</span>)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* BALANCED: text-xl */}
                      <p className={`text-xl font-black ${ex.type === 'settlement' ? 'text-emerald-600' : 'text-slate-800'}`}>₹{ex.amount}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{ex.type === 'settlement' ? 'Settlement' : 'Full Cost'}</p>
                      {!showDeleted && (
                        <button onClick={() => setConfirmModal({isOpen: true, title: 'Delete?', message: 'Move to trash?', onConfirm: () => { deleteTransaction(ex.id); setConfirmModal({isOpen: false}); }})} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 hover:text-red-500 shadow-sm"><Trash2 size={18} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mb-6 shadow-lg shadow-rose-100"><Sparkles size={48} /></div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome to Dashboard</h2>
            <p className="text-lg">Select a group from the sidebar to start tracking expenses.</p>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        title={confirmModal.title} 
        message={confirmModal.message} 
        onConfirm={confirmModal.onConfirm} 
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
      />
      
      <TransactionModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
        activeGroup={activeGroup} 
        initialMode={txModalMode} 
        onSave={(mode, form) => { addTransaction(activeGroupId, mode, form); setIsTxModalOpen(false); }} 
      />
    </div>
  );
}