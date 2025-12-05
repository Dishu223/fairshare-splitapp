import React from 'react';
import { Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slideUp text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1 justify-center" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 justify-center !bg-red-500 hover:!bg-red-600 !shadow-red-200" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;