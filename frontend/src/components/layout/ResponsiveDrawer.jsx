import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const ResponsiveDrawer = ({
  isOpen,
  onClose,
  side = 'left',
  title,
  children,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className={`relative z-50 w-[88vw] max-w-sm sm:max-w-md h-full bg-[#111C2F] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          side === 'left'
            ? 'mr-auto border-r border-[#24344D] animate-in slide-in-from-left duration-300'
            : 'ml-auto border-l border-[#24344D] animate-in slide-in-from-right duration-300'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-14 px-4 border-b border-[#24344D] flex items-center justify-between bg-[#19263A]/40 shrink-0">
          <span className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
            {title || (side === 'left' ? 'Network Controls' : 'Properties & Details')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#19263A] border border-transparent hover:border-[#24344D] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

