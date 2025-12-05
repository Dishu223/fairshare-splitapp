import React, { useState } from 'react';
import { Sparkles, ArrowRight, Users, DollarSign, MessageCircle, Heart, ShieldCheck } from 'lucide-react';
import Button from './ui/Button';
import FeatureCard from './ui/FeatureCard';

export default function Landing({ onLogin, onGuestLogin }) {
  const [page, setPage] = useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 font-sans selection:bg-rose-200">
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 text-rose-500 font-bold text-2xl cursor-pointer" onClick={() => setPage('home')}>
          <Sparkles size={24} />
          <span>FairShare</span>
        </div>
        <div className="hidden md:flex gap-4">
          <Button variant="ghost" onClick={() => setPage('about')}>About</Button>
          <Button variant="ghost" onClick={() => setPage('features')}>Features</Button>
          <Button variant="secondary" onClick={onLogin} className="!py-2 !px-4">Log In</Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
        
        {/* --- HOME VIEW --- */}
        {page === 'home' && (
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-rose-100 text-rose-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              v4.4 Final Polish
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 mb-8 leading-tight tracking-tight">
              Splitting bills shouldn't <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400">break friendships.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Track shared expenses, settle up with friends, and keep your financial karma clean.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={onLogin} className="justify-center shadow-lg shadow-rose-200/50">
                Get Started with Google <ArrowRight size={20} />
              </Button>
              <Button variant="secondary" onClick={onGuestLogin} className="justify-center">
                Continue as Guest
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-24 text-left">
              <FeatureCard icon={Users} title="Groups & Households" desc="Create cozy groups for your apartment, road trip, or Friday night pizza." />
              <FeatureCard icon={DollarSign} title="Smart Splitting" desc="Split equally or unequally. Adjust the split in seconds." />
              <FeatureCard icon={MessageCircle} title="WhatsApp Reports" desc="Generate instant text summaries and share them directly." />
            </div>
          </div>
        )}

        {/* --- ABOUT VIEW --- */}
        {page === 'about' && (
          <div className="max-w-3xl mx-auto bg-white p-12 rounded-3xl shadow-xl animate-fadeIn text-left">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-6">About Us</h1>
            <p className="text-lg text-slate-600 mb-4">
              FairShare was born from a simple frustration: losing friends over money. We believe that shared experiences—dinners, trips, apartments—should be about the memories, not the math.
            </p>
            <p className="text-lg text-slate-600 mb-4">
              Our mission is to provide a clean, cute, and professional tool for the modern Indian user to track expenses in Rupees without the headache of spreadsheets.
            </p>
            <div className="bg-rose-50 p-6 rounded-2xl mt-8 border border-rose-100">
              <h3 className="font-bold text-rose-600 mb-2 flex items-center gap-2"><Heart size={18} /> Why we built this</h3>
              <p className="text-rose-800">To make "Hisaab Kitaab" simple, transparent, and friendly for everyone.</p>
            </div>
          </div>
        )}

        {/* --- FEATURES VIEW --- */}
        {page === 'features' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-12">Features</h1>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4"><Users size={24}/></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Groups & Friends</h3>
                <p className="text-slate-500">Create unlimited groups for every occasion. Add friends easily and keep track of who belongs where.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4"><ShieldCheck size={24}/></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Secure & Private</h3>
                <p className="text-slate-500">Your data is yours. We use secure authentication and real-time database rules to keep your finances safe.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-4"><DollarSign size={24}/></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Flexible Splits</h3>
                <p className="text-slate-500">Not everything is 50/50. Split by exact amounts or shares to make sure everyone pays exactly what they owe.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4"><MessageCircle size={24}/></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">WhatsApp Integration</h3>
                <p className="text-slate-500">The "Indian Way" of settling up. Generate a formatted text summary and send it to your group chat in one click.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}