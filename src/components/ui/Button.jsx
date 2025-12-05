import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  // Restored: Slightly larger text (text-base instead of default) and specific padding
  const baseStyle = "px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-95 shadow-sm flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed tracking-wide";
  
  const variants = {
    primary: "bg-rose-400 text-white hover:bg-rose-500 shadow-rose-200",
    secondary: "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200", // Standard secondary
    ghost: "bg-transparent text-slate-500 hover:text-rose-500",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#128C7E] shadow-green-200",
    google: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100",
    // New variant specifically for the "Settle Up" button in your screenshot (White bg, Green text)
    settle: "bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50"
  };

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;