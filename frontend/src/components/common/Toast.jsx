import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-[#111C2F] border-emerald-500/40 text-emerald-100',
    error: 'bg-[#111C2F] border-rose-500/40 text-rose-100',
    info: 'bg-[#111C2F] border-sky-500/40 text-sky-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl transition-all animate-bounce-in max-w-md ${bgStyles[toast.type] || bgStyles.info}">
      {icons[toast.type] || icons.info}
      <div className="text-sm font-medium pr-2 text-[#F8FAFC]">{toast.message}</div>
      <button
        onClick={onClose}
        className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

