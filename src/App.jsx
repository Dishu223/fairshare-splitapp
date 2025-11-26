import React, { useState, useEffect } from 'react';
// --- CRITICAL FIX: Import from your local firebase file ---
import { auth, db } from './firebase'; 
import { signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { Heart, DollarSign, Users, ArrowRight, Sparkles, ShieldCheck, Plus, Home, Settings, ChevronRight, X, Receipt, UserPlus, Wallet, ArrowRightLeft, Trash2, Clock, RotateCcw, History, Share2, MessageCircle, LogOut, User, Menu } from 'lucide-react';

// We define a static App ID for your local project so data stays consistent
const appId = "fairshare-local"; 
const googleProvider = new GoogleAuthProvider();

// --- COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform active:scale-95 shadow-sm flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-rose-400 text-white hover:bg-rose-500 shadow-rose-200",
    secondary: "bg-white text-slate-600 hover:bg-slate-50 border border-rose-100",
    ghost: "bg-transparent text-slate-500 hover:text-rose-500",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-green-200",
    google: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
  };

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-xl shadow-rose-100/50 hover:shadow-rose-200/50 transition-all duration-300">
    <div className="bg-rose-100 w-12 h-12 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('landing');
  
  // DATA STATE
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  
  // UI STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FORM STATES
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberName, setNewMemberName] = useState(''); 
  const [txMode, setTxMode] = useState('expense'); 
  const [expenseForm, setExpenseForm] = useState({ 
    desc: '', amount: '', payer: 'You', receiver: '', splitType: 'equal', customSplits: {} 
  });

  // 1. AUTHENTICATION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && view === 'landing') {
        // Optional: Auto-redirect if already logged in
        // setView('dashboard'); 
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. DATA LISTENERS
  useEffect(() => {
    if (!user) {
        setGroups([]);
        setExpenses([]);
        return;
    }

    // DEBUG: Log to ensure we are connecting
    console.log("Listening to DB for User:", user.uid);

    const groupsRef = collection(db, 'artifacts', appId, 'public', 'data', 'groups');
    const unsubGroups = onSnapshot(groupsRef, 
      (snapshot) => {
        const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Groups Loaded:", groupsData); // DEBUG LOG
        groupsData.sort((a, b) => b.createdAt - a.createdAt);
        setGroups(groupsData);
      }, 
      (error) => {
        console.error("🔥 GROUPS PERMISSION ERROR:", error);
        alert("Database Error: " + error.message + ". Check Firestore Rules.");
      }
    );

    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');
    const unsubExpenses = onSnapshot(expensesRef, 
      (snapshot) => {
        const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        expensesData.sort((a, b) => b.createdAt - a.createdAt);
        setExpenses(expensesData);
      },
      (error) => console.error("🔥 EXPENSES PERMISSION ERROR:", error)
    );

    return () => { unsubGroups(); unsubExpenses(); };
  }, [user]);

  // --- ACTIONS ---
  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      setView('dashboard');
    } catch (error) {
      console.warn("Google Sign-In blocked/closed. Falling back to Guest.");
      handleGuestLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
      setView('dashboard');
    } catch (error) {
      console.error("Guest login failed:", error);
      alert("Login Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
    setActiveGroupId(null);
    setMobileMenuOpen(false);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !user) return;
    
    console.log("Attempting to create group:", newGroupName); // DEBUG LOG

    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'groups'), {
        name: newGroupName,
        createdBy: user.uid,
        createdAt: Date.now(),
        type: 'Custom',
        members: ['You'] 
      });
      console.log("Group Created with ID:", docRef.id); // DEBUG LOG
      setNewGroupName('');
      setActiveGroupId(docRef.id);
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Could not create group. Error: " + error.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeGroupId) return;
    try {
      const groupRef = doc(db, 'artifacts', appId, 'public', 'data', 'groups', activeGroupId);
      await updateDoc(groupRef, { members: arrayUnion(newMemberName.trim()) });
      setNewMemberName('');
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !user) return;
    if (txMode === 'expense' && !expenseForm.desc) return;
    if (txMode === 'settlement' && !expenseForm.receiver) return;

    if (txMode === 'expense' && expenseForm.splitType === 'unequal') {
        const totalSplit = Object.values(expenseForm.customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        if (Math.abs(totalSplit - parseFloat(expenseForm.amount)) > 0.1) {
            alert(`Error: The split amounts (₹${totalSplit}) must match the total bill (₹${expenseForm.amount})`);
            return;
        }
    }

    try {
      const now = new Date();
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), {
        groupId: activeGroupId,
        type: txMode,
        desc: txMode === 'expense' ? expenseForm.desc : 'Settlement',
        amount: parseFloat(expenseForm.amount),
        payer: expenseForm.payer,
        receiver: txMode === 'settlement' ? expenseForm.receiver : null,
        splitType: txMode === 'expense' ? expenseForm.splitType : null,
        splits: txMode === 'expense' && expenseForm.splitType === 'unequal' ? expenseForm.customSplits : null,
        createdBy: user.uid,
        createdAt: Date.now(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        deleted: false
      });

      setExpenseForm({ desc: '', amount: '', payer: 'You', receiver: '', splitType: 'equal', customSplits: {} });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const softDeleteExpense = async (expenseId) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', expenseId), { deleted: true });
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const deleteGroup = async () => {
    if (!activeGroupId) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'groups', activeGroupId));
      setActiveGroupId(null);
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleShareWhatsapp = () => {
    if (!activeGroup) return;
    let message = `*FairShare Summary: ${activeGroup.name}*\n\n`;
    const relevantBalances = Object.entries(balances).filter(([_, bal]) => Math.abs(bal) > 1);
    
    if (relevantBalances.length === 0) {
        message += "✅ All settled up! No debts.";
    } else {
        relevantBalances.forEach(([member, bal]) => {
            if (bal > 0) message += `🟢 ${member} gets back ₹${bal.toFixed(0)}\n`;
            else message += `🔴 ${member} owes ₹${Math.abs(bal).toFixed(0)}\n`;
        });
    }
    message += `\n_Generated by FairShare_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- MATH LOGIC ---
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const groupExpenses = expenses.filter(ex => ex.groupId === activeGroupId);
  const activeExpenses = groupExpenses.filter(ex => !ex.deleted);
  const deletedExpenses = groupExpenses.filter(ex => ex.deleted);
  const displayedExpenses = showDeleted ? deletedExpenses : activeExpenses;

  const groupTotal = activeExpenses.filter(ex => ex.type !== 'settlement').reduce((sum, ex) => sum + ex.amount, 0);

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
            Object.entries(ex.splits).forEach(([member, splitAmount]) => {
                if (balances[member] !== undefined) balances[member] -= parseFloat(splitAmount);
            });
        } else {
            const splitCount = activeGroup.members?.length || 1;
            const splitAmount = amount / splitCount;
            activeGroup.members?.forEach(m => {
              if (balances[m] !== undefined) balances[m] -= splitAmount;
            });
        }
      }
    });
  }

  const openModal = (mode) => {
    setTxMode(mode);
    setExpenseForm({ desc: '', amount: '', payer: 'You', receiver: '', splitType: 'equal', customSplits: {} });
    setIsModalOpen(true);
  };

  const handleSplitChange = (member, value) => {
      setExpenseForm(prev => ({
          ...prev,
          customSplits: { ...prev.customSplits, [member]: value }
      }));
  };

  if (loading) return <div className="min-h-screen bg-rose-50 flex items-center justify-center"><Heart className="text-rose-300 animate-bounce" size={48} fill="currentColor" /></div>;

  // VIEW: ABOUT & HOW IT WORKS
  if (view === 'about' || view === 'how-it-works') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-8">
        <div className="max-w-3xl mx-auto bg-white p-12 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-2 text-rose-500 font-bold text-2xl cursor-pointer" onClick={() => setView('landing')}>
              <Sparkles size={24} />
              <span>FairShare</span>
            </div>
            <Button variant="secondary" onClick={() => setView('landing')}>Back Home</Button>
          </div>
          
          {view === 'about' ? (
            <div className="prose prose-slate">
              <h1 className="text-4xl font-extrabold text-slate-800 mb-6">About Us</h1>
              <p className="text-lg text-slate-600 mb-4">
                FairShare was born from a simple frustration: losing friends over money. We believe that shared experiences—dinners, trips, apartments—should be about the memories, not the math.
              </p>
              <p className="text-lg text-slate-600 mb-4">
                Our mission is to provide a clean, cute, and professional tool for the modern Indian user to track expenses in Rupees without the headache of spreadsheets.
              </p>
              <div className="bg-rose-50 p-6 rounded-2xl mt-8">
                <h3 className="font-bold text-rose-600 mb-2">Why we built this</h3>
                <p className="text-rose-800">To make "Hisaab Kitaab" simple, transparent, and friendly for everyone.</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate">
              <h1 className="text-4xl font-extrabold text-slate-800 mb-6">How it Works</h1>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Create a Group</h3>
                    <p className="text-slate-500">Make a group for your Home, Trip, or Event. Add your friends by name.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-xl flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Add Expenses</h3>
                    <p className="text-slate-500">Whenever someone pays, click "Add Expense". Enter the amount in ₹ and select who paid.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Settle Up</h3>
                    <p className="text-slate-500">The app calculates who owes whom. When you pay a friend back, record a "Settlement" to clear the debt.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VIEW: LANDING
  if (view === 'landing') {
     return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 font-sans selection:bg-rose-200">
        <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-2xl">
            <Sparkles size={24} />
            <span>FairShare</span>
          </div>
          <div className="hidden md:flex gap-4">
             <Button variant="ghost" onClick={() => setView('about')}>About</Button>
             <Button variant="ghost" onClick={() => setView('how-it-works')}>Features</Button>
             <Button variant="secondary" onClick={handleLogin} className="!py-2 !px-4">Log In</Button>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-rose-100 text-rose-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            v4.3 Final Local Version
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 mb-8 leading-tight tracking-tight">
            Splitting bills shouldn't <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400">break friendships.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
             Track shared expenses, settle up with friends, and keep your financial karma clean. 
             Perfect for flatmates, road trips, and couples.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleLogin} className="justify-center shadow-lg shadow-rose-200/50">
               Get Started with Google <ArrowRight size={20} />
            </Button>
            <Button variant="secondary" onClick={handleGuestLogin} className="justify-center">
              Continue as Guest
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-24 text-left">
            <FeatureCard 
                icon={Users} 
                title="Groups & Households" 
                desc="Create cozy groups for your apartment, road trip, or Friday night pizza. Keep every expense organized in one place." 
            />
            <FeatureCard 
                icon={DollarSign} 
                title="Smart Splitting" 
                desc="Split equally or unequally. Alice ate less pizza? Bob ordered drinks? Adjust the split in seconds." 
            />
            <FeatureCard 
                icon={MessageCircle} 
                title="WhatsApp Reports" 
                desc="Generate instant text summaries of who owes what and share them directly to your WhatsApp group." 
            />
          </div>
        </main>
      </div>
    );
  }

  // VIEW: DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setConfirmModal({...confirmModal, isOpen: false})}>Cancel</Button>
              <Button className="flex-1 justify-center !bg-red-500 hover:!bg-red-600 !shadow-red-200" onClick={confirmModal.onConfirm}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp my-8">
            <div className="flex text-center border-b border-slate-100">
              <button onClick={() => setTxMode('expense')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${txMode === 'expense' ? 'bg-rose-50 text-rose-500 border-b-2 border-rose-500' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Add Expense</button>
              <button onClick={() => setTxMode('settlement')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${txMode === 'settlement' ? 'bg-emerald-50 text-emerald-500 border-b-2 border-emerald-500' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Settle Up</button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              {txMode === 'expense' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <div className="relative">
                    <Receipt className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input type="text" required placeholder="e.g. Sushi Dinner" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 font-medium text-slate-700"
                      value={expenseForm.desc} onChange={(e) => setExpenseForm({...expenseForm, desc: e.target.value})} />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-lg">₹</span>
                  <input type="number" required min="0" step="0.01" placeholder="0.00" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 font-medium text-slate-700"
                    value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paid By</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 font-medium text-slate-700"
                    value={expenseForm.payer} onChange={(e) => setExpenseForm({...expenseForm, payer: e.target.value})}>
                    {activeGroup?.members?.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {txMode === 'settlement' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paid To</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-medium text-slate-700"
                      required value={expenseForm.receiver} onChange={(e) => setExpenseForm({...expenseForm, receiver: e.target.value})}>
                      <option value="" disabled>Select...</option>
                      {activeGroup?.members?.filter(m => m !== expenseForm.payer).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {txMode === 'expense' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Split Options</label>
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 mb-4">
                        <button type="button" onClick={() => setExpenseForm({...expenseForm, splitType: 'equal'})}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${expenseForm.splitType === 'equal' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Equally</button>
                        <button type="button" onClick={() => setExpenseForm({...expenseForm, splitType: 'unequal'})}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${expenseForm.splitType === 'unequal' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Unequal</button>
                    </div>
                    {expenseForm.splitType === 'unequal' && (
                        <div className="space-y-3 animate-fadeIn">
                             <p className="text-xs text-slate-400 italic mb-2">Enter the exact share for each person:</p>
                             {activeGroup?.members?.map(member => (
                                 <div key={member} className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{member[0]}</div>
                                     <span className="text-sm font-medium text-slate-700 flex-1 truncate">{member}</span>
                                     <div className="relative w-28">
                                        <span className="absolute left-3 top-2 text-slate-400 text-xs">₹</span>
                                        <input type="number" min="0" placeholder="0" className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-300"
                                            value={expenseForm.customSplits[member] || ''} onChange={(e) => handleSplitChange(member, e.target.value)} />
                                     </div>
                                 </div>
                             ))}
                             <div className="text-right pt-2 border-t border-slate-200 mt-2">
                                 <span className="text-xs text-slate-500 mr-2">Remaining:</span>
                                 <span className={`text-sm font-bold ${Math.abs(parseFloat(expenseForm.amount || 0) - Object.values(expenseForm.customSplits).reduce((a,b)=>a+(parseFloat(b)||0),0)) < 0.1 ? 'text-emerald-500' : 'text-red-500'}`}>
                                     ₹{(parseFloat(expenseForm.amount || 0) - Object.values(expenseForm.customSplits).reduce((a,b)=>a+(parseFloat(b)||0),0)).toFixed(2)}
                                 </span>
                             </div>
                        </div>
                    )}
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1 justify-center" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className={`flex-1 justify-center ${txMode === 'settlement' ? '!bg-emerald-500 hover:!bg-emerald-600' : ''}`}>{txMode === 'settlement' ? 'Record' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR - RESPONSIVE */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xl cursor-pointer" onClick={() => setView('landing')}>
                <Sparkles size={20} />
                <span>FairShare</span>
            </div>
            <button className="md:hidden text-slate-400" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateGroup} className="mb-6 relative flex-shrink-0">
            <input type="text" placeholder="New group name..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all" />
            <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
              <Plus size={16} />
            </button>
          </form>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Your Groups</div>
          <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
            {groups.length > 0 ? groups.map((group) => (
              <button key={group.id} onClick={() => { setActiveGroupId(group.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-all duration-200 ${activeGroupId === group.id ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}`}>
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

          <div className="mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><User size={18} /></div>
                )}
                <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{user?.displayName || 'Guest User'}</p>
                <p className="text-xs text-slate-400">{user?.isAnonymous ? 'Demo Mode' : 'Pro Plan'}</p>
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors" title="Log Out">
                    <LogOut size={16} />
                </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="md:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
             <div className="flex items-center gap-2 text-rose-500 font-bold text-lg">
                <Sparkles size={18} />
                <span>FairShare</span>
             </div>
             <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                 <Menu size={24} />
             </button>
        </div>

        {activeGroup ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
              
              <header className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-1 font-medium">
                      <Home size={14} /> <span>/</span> <span>Groups</span> <span>/</span> <span className="text-rose-500">{activeGroup.name}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">{activeGroup.name}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex -space-x-2">
                        {activeGroup.members?.map((member, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600" title={member}>{member[0].toUpperCase()}</div>
                        ))}
                      </div>
                      <div className="h-6 w-px bg-slate-200 mx-2"></div>
                      <form onSubmit={handleAddMember} className="flex items-center gap-2">
                        <input type="text" placeholder="Add friend..." value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)}
                          className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-sm w-32 focus:w-48 transition-all outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
                        <button type="submit" disabled={!newMemberName.trim()} className="bg-rose-100 text-rose-500 p-1.5 rounded-full hover:bg-rose-200 disabled:opacity-50 transition-colors"><UserPlus size={14} /></button>
                      </form>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end w-full md:w-auto">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right w-full md:w-auto">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Spend</p>
                      <p className="text-2xl font-black text-slate-800">₹{groupTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <Button variant="whatsapp" onClick={handleShareWhatsapp} className="!py-1.5 !px-3 !text-xs !rounded-lg"><MessageCircle size={14} /> WhatsApp</Button>
                      <button onClick={() => setShowDeleted(!showDeleted)} className={`p-2 rounded-lg transition-colors ${showDeleted ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                        {showDeleted ? <RotateCcw size={16}/> : <History size={16}/>}
                      </button>
                      <button onClick={() => setConfirmModal({isOpen: true, title: 'Delete Group?', message: 'Undo?', onConfirm: deleteGroup})} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>

                {!showDeleted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {Object.entries(balances).map(([member, balance]) => {
                      if (Math.abs(balance) < 0.01) return null;
                      const isPositive = balance > 0;
                      return (
                        <div key={member} className={`p-4 rounded-2xl border flex items-center justify-between ${isPositive ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPositive ? 'bg-emerald-200 text-emerald-700' : 'bg-orange-200 text-orange-700'}`}>{member[0]}</div>
                            <span className={`font-bold ${isPositive ? 'text-emerald-800' : 'text-orange-800'}`}>{member}</span>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-bold uppercase ${isPositive ? 'text-emerald-500' : 'text-orange-400'}`}>{isPositive ? 'Gets back' : 'Owes'}</p>
                            <p className={`text-lg font-black ${isPositive ? 'text-emerald-700' : 'text-orange-700'}`}>₹{Math.abs(balance).toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {!showDeleted && (
                  <div className="flex gap-2">
                    <Button onClick={() => openModal('expense')} className="flex-1 sm:flex-none"><Plus size={18} /> Add Expense</Button>
                    <Button onClick={() => openModal('settlement')} variant="secondary" className="flex-1 sm:flex-none !text-emerald-600 !border-emerald-100 hover:!bg-emerald-50"><ArrowRightLeft size={18} /> Settle Up</Button>
                  </div>
                )}
                {showDeleted && <div className="p-4 bg-slate-100 rounded-xl mb-4 text-center text-slate-500 text-sm">Viewing <strong>Deleted Items</strong></div>}
              </header>

              {displayedExpenses.length > 0 ? (
                <div className="space-y-4">
                  {displayedExpenses.map((expense) => {
                    const isSettlement = expense.type === 'settlement';
                    return (
                      <div key={expense.id} className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group relative pr-12 ${expense.deleted ? 'opacity-70 bg-slate-50' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSettlement ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-400'}`}>{isSettlement ? <ArrowRightLeft size={20} /> : <Receipt size={20} />}</div>
                          <div>
                            <h4 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                              {expense.desc}
                              {expense.splitType === 'unequal' && <span className="text-[10px] bg-indigo-100 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-wide">Unequal</span>}
                            </h4>
                            <p className="text-sm text-slate-400">
                              <span className="font-bold text-slate-600">{expense.payer}</span> {isSettlement ? <span className="text-emerald-500 font-bold"> paid </span> : ' paid • '}
                              {isSettlement && <span className="font-bold text-slate-600">{expense.receiver}</span>}
                              {!isSettlement && (<><span className="mx-1">•</span><span>{expense.date}</span></>)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${isSettlement ? 'text-emerald-600' : 'text-slate-800'}`}>₹{expense.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-400 font-medium">{isSettlement ? 'payment' : 'full cost'}</p>
                        </div>
                        {!expense.deleted && (
                          <button onClick={(e) => { e.stopPropagation(); setConfirmModal({isOpen: true, title: 'Delete Item?', message: 'Move to trash?', onConfirm: () => softDeleteExpense(expense.id)}); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-red-50 text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 hover:text-red-500"><Trash2 size={18} /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center mt-8">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4"><DollarSign size={32} /></div>
                   <h3 className="text-lg font-bold text-slate-700 mb-2">No items found</h3>
                 </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
             <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-300 mb-6 relative"><Sparkles size={48} /></div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Dashboard</h2>
             <p className="text-slate-500">Select a group to start tracking expenses.</p>
          </div>
        )}
      </main>
    </div>
  );
}