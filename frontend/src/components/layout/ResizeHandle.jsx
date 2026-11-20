import React from 'react';
import { GripVertical } from 'lucide-react';

export const ResizeHandle = ({
  side = 'left',
  isDragging = false,
  onPointerDown,
  onDoubleClick,
  title,
  ariaLabel,
}) => {
  const defaultTitle =
    title ||
    `Drag to resize ${side} sidebar (Double-click to reset to default)`;

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={ariaLabel || `${side} sidebar resize handle`}
      title={defaultTitle}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className={`relative z-20 group flex items-center justify-center cursor-col-resize select-none shrink-0 transition-colors ${
        side === 'left' ? 'w-2 -mr-1' : 'w-2 -ml-1'
      }`}
    >
      {/* Visual divider line: 1px visible line centered within the 8px hit area */}
      <div
        className={`w-px h-full transition-all duration-150 ${
          isDragging
            ? 'bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.6)] w-0.5'
            : 'bg-[#24344D] group-hover:bg-[#38BDF8] group-hover:w-0.5'
        }`}
      />

      {/* Floating Grip indicator in the middle that appears on hover/drag */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-3.5 h-7 rounded-sm border transition-all duration-150 pointer-events-none ${
          isDragging
            ? 'opacity-100 bg-[#19263A] border-[#38BDF8] text-[#38BDF8] shadow-md shadow-sky-950/40'
            : 'opacity-0 group-hover:opacity-100 bg-[#111C2F] border-[#24344D] text-[#94A3B8] group-hover:border-[#38BDF8]/60 group-hover:text-[#38BDF8]'
        }`}
      >
        <GripVertical className="w-2.5 h-2.5" />
      </div>
    </div>
  );
};

