import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign } from 'lucide-react';
import Button from '../ui/Button';

// Added 'initialMode' prop here
const TransactionModal = ({ isOpen, onClose, activeGroup, onSave, initialMode = 'expense' }) => {
  const [txMode, setTxMode] = useState(initialMode);
  const [form, setForm] = useState({ 
    desc: '', amount: '', payer: 'You', receiver: '', splitType: 'equal', customSplits: {} 
  });

  // Reset form AND set the correct mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({ desc: '', amount: '', payer: 'You', receiver: '', splitType: 'equal', customSplits: {} });
      setTxMode(initialMode); // <--- This fixes the mode
    }
  }, [isOpen, initialMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(txMode, form);
  };

  const handleSplitChange = (member, value) => {
    setForm(prev => ({
      ...prev,
      customSplits: { ...prev.customSplits, [member]: value }
    }));
  };

  const totalSplit = Object.values(form.customSplits).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const remaining = (parseFloat(form.amount || 0) - totalSplit).toFixed(2);
  const isSplitValid = Math.abs(parseFloat(remaining)) < 0.1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp my-8">
        <div className="flex text-center border-b border-slate-100">
          <button type="button" onClick={() => setTxMode('expense')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${txMode === 'expense' ? 'bg-rose-50 text-rose-500 border-b-2 border-rose-500' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Add Expense</button>
          <button type="button" onClick={() => setTxMode('settlement')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider transition-colors ${txMode === 'settlement' ? 'bg-emerald-50 text-emerald-500 border-b-2 border-emerald-500' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>Settle Up</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {txMode === 'expense' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
              <div className="relative">
                <Receipt className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input type="text" required placeholder="e.g. Sushi Dinner" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 font-medium text-slate-700"
                  value={form.desc} onChange={(e) => setForm({...form, desc: e.target.value})} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-lg">₹</span>
              <input type="number" required min="0" step="0.01" placeholder="0.00" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 font-medium text-slate-700"
                value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paid By</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 font-medium text-slate-700"
                value={form.payer} onChange={(e) => setForm({...form, payer: e.target.value})}>
                {activeGroup?.members?.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {txMode === 'settlement' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paid To</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 font-medium text-slate-700"
                  required value={form.receiver} onChange={(e) => setForm({...form, receiver: e.target.value})}>
                  <option value="" disabled>Select...</option>
                  {activeGroup?.members?.filter(m => m !== form.payer).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
          </div>

          {txMode === 'expense' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Split Options</label>
                <div className="flex bg-white p-1 rounded-lg border border-slate-200 mb-4">
                    <button type="button" onClick={() => setForm({...form, splitType: 'equal'})}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${form.splitType === 'equal' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Equally</button>
                    <button type="button" onClick={() => setForm({...form, splitType: 'unequal'})}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${form.splitType === 'unequal' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Unequal</button>
                </div>

                {form.splitType === 'unequal' && (
                    <div className="space-y-3 animate-fadeIn">
                         {activeGroup?.members?.map(member => (
                             <div key={member} className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{member[0]}</div>
                                 <span className="text-sm font-medium text-slate-700 flex-1 truncate">{member}</span>
                                 <div className="relative w-28">
                                    <span className="absolute left-3 top-2 text-slate-400 text-xs">₹</span>
                                    <input type="number" min="0" placeholder="0" className="w-full pl-6 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-300"
                                        value={form.customSplits[member] || ''} onChange={(e) => handleSplitChange(member, e.target.value)} />
                                 </div>
                             </div>
                         ))}
                         <div className="text-right pt-2 border-t border-slate-200 mt-2">
                             <span className="text-xs text-slate-500 mr-2">Remaining:</span>
                             <span className={`text-sm font-bold ${isSplitValid ? 'text-emerald-500' : 'text-red-500'}`}>₹{remaining}</span>
                         </div>
                    </div>
                )}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1 justify-center" onClick={onClose}>Cancel</Button>
            <Button type="submit" className={`flex-1 justify-center ${txMode === 'settlement' ? '!bg-emerald-500 hover:!bg-emerald-600' : ''}`}>
              {txMode === 'settlement' ? 'Record' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;