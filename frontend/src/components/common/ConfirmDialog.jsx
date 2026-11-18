import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111C2F] border border-[#24344D] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
            <p className="text-sm text-[#94A3B8] mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#19263A]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#19263A] transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors shadow-sm ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-semibold'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

