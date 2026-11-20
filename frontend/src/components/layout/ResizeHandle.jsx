import React from 'react';

/**
 * ChatGPT-style vertical resize handle.
 * Renders as a crisp 1px divider with an expanded invisible hit zone (9px)
 * for effortless mouse and touch grabbing, displaying a cyan accent highlight
 * and col-resize cursor on hover and active drag.
 */
export const ResizeHandle = ({
  side = 'left',
  isDragging = false,
  onPointerDown,
  onDoubleClick,
  title,
  ariaLabel,
  className = '',
}) => {
  const defaultTitle =
    title ||
    `Drag boundary to resize ${side} sidebar (Double-click to reset)`;

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={ariaLabel || `${side} sidebar resize handle`}
      title={defaultTitle}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      className={`relative z-20 group hidden md:flex items-center justify-center cursor-col-resize select-none shrink-0 h-full w-[9px] -mx-[4px] ${className}`}
    >
      {/* 1px visible divider line centered within the 9px interaction area */}
      <div
        className={`h-full pointer-events-none transition-all duration-150 ${
          isDragging
            ? 'w-[2px] bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.7)]'
            : 'w-[1px] bg-[#24344D] group-hover:w-[2px] group-hover:bg-[#38BDF8] group-hover:shadow-[0_0_6px_rgba(56,189,248,0.5)]'
        }`}
      />
    </div>
  );
};
