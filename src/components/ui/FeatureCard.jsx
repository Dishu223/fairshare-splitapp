import React from 'react';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-xl shadow-rose-100/50 hover:shadow-rose-200/50 transition-all duration-300">
    <div className="bg-rose-100 w-12 h-12 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default FeatureCard;