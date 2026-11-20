import { useState, useEffect, useCallback, useRef } from 'react';

export const LEFT_SIDEBAR_MIN = 220;
export const LEFT_SIDEBAR_DEFAULT = 340;
export const LEFT_SIDEBAR_MAX = 500;

export const RIGHT_SIDEBAR_MIN = 250;
export const RIGHT_SIDEBAR_DEFAULT = 320;
export const RIGHT_SIDEBAR_MAX = 500;

export const MIN_CANVAS_WIDTH = 320;

const STORAGE_KEY_LEFT_WIDTH = 'netroute_left_sidebar_width';
const STORAGE_KEY_RIGHT_WIDTH = 'netroute_right_sidebar_width';
const STORAGE_KEY_LEFT_COLLAPSED = 'netroute_left_sidebar_collapsed';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const useResizablePanels = () => {
  // 1. Initial State from localStorage with safe validation against [MIN, MAX]
  const [leftWidth, setLeftWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEFT_WIDTH);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed)) {
          return clamp(parsed, LEFT_SIDEBAR_MIN, LEFT_SIDEBAR_MAX);
        }
      }
    } catch {
      // localStorage disabled or security exception
    }
    return LEFT_SIDEBAR_DEFAULT;
  });

  const [rightWidth, setRightWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RIGHT_WIDTH);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed)) {
          return clamp(parsed, RIGHT_SIDEBAR_MIN, RIGHT_SIDEBAR_MAX);
        }
      }
    } catch {
      // localStorage disabled or security exception
    }
    return RIGHT_SIDEBAR_DEFAULT;
  });

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEFT_COLLAPSED);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Dragging states
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  // Responsive breakpoint states
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;

  // Mobile drawer states
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Drag session reference storing frozen start coordinates and dimensions
  const dragRef = useRef({
    startX: 0,
    startWidth: 0,
    otherWidth: 0,
  });

  // Track window resizing and prevent canvas starvation
  useEffect(() => {
    const handleResize = () => {
      const currentW = window.innerWidth;
      setWindowWidth(currentW);

      // Enforce canvas minimum width if window shrinks
      if (currentW >= 1200) {
        const availableCanvas =
          currentW - (isLeftCollapsed ? 0 : leftWidth) - rightWidth;
        if (availableCanvas < MIN_CANVAS_WIDTH) {
          const excess = MIN_CANVAS_WIDTH - availableCanvas;
          const newRight = Math.max(RIGHT_SIDEBAR_MIN, rightWidth - excess / 2);
          const newLeft = Math.max(LEFT_SIDEBAR_MIN, leftWidth - excess / 2);
          setLeftWidth(newLeft);
          setRightWidth(newRight);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [leftWidth, rightWidth, isLeftCollapsed]);

  // Persist Left Width
  const saveLeftWidth = useCallback((newWidth) => {
    const clamped = clamp(newWidth, LEFT_SIDEBAR_MIN, LEFT_SIDEBAR_MAX);
    setLeftWidth(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_LEFT_WIDTH, String(clamped));
    } catch { }
  }, []);

  // Persist Right Width
  const saveRightWidth = useCallback((newWidth) => {
    const clamped = clamp(newWidth, RIGHT_SIDEBAR_MIN, RIGHT_SIDEBAR_MAX);
    setRightWidth(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_RIGHT_WIDTH, String(clamped));
    } catch { }
  }, []);

  // Toggle Left Collapse (preserves previous width for restoration on expand)
  const toggleLeftCollapse = useCallback(() => {
    setIsLeftCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_LEFT_COLLAPSED, String(next));
      } catch { }
      return next;
    });
  }, []);

  const expandLeft = useCallback(() => {
    setIsLeftCollapsed(false);
    try {
      localStorage.setItem(STORAGE_KEY_LEFT_COLLAPSED, 'false');
    } catch { }
  }, []);

  const collapseLeft = useCallback(() => {
    setIsLeftCollapsed(true);
    try {
      localStorage.setItem(STORAGE_KEY_LEFT_COLLAPSED, 'true');
    } catch { }
  }, []);

  // Reset to default widths (e.g. on double click)
  const resetLeftWidth = useCallback(() => {
    saveLeftWidth(LEFT_SIDEBAR_DEFAULT);
  }, [saveLeftWidth]);

  const resetRightWidth = useCallback(() => {
    saveRightWidth(RIGHT_SIDEBAR_DEFAULT);
  }, [saveRightWidth]);

  // High-performance pointer drag listener (zero re-binding during active drag)
  useEffect(() => {
    if (!isDraggingLeft && !isDraggingRight) return;

    // Apply global drag styles to prevent text selection and enforce col-resize cursor
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handlePointerMove = (e) => {
      const currentX = e.clientX;
      const totalWinWidth = window.innerWidth;
      const { startX, startWidth, otherWidth } = dragRef.current;

      if (isDraggingLeft) {
        // Dragging right (currentX > startX) increases left sidebar width
        const deltaX = currentX - startX;
        const candidateWidth = startWidth + deltaX;

        // Ensure canvas does not shrink below MIN_CANVAS_WIDTH
        const maxAllowedByCanvas = totalWinWidth - otherWidth - MIN_CANVAS_WIDTH;
        const upperLimit = Math.min(
          LEFT_SIDEBAR_MAX,
          Math.max(LEFT_SIDEBAR_MIN, maxAllowedByCanvas)
        );

        const clamped = clamp(candidateWidth, LEFT_SIDEBAR_MIN, upperLimit);
        setLeftWidth(clamped);
      } else if (isDraggingRight) {
        // Dragging left (currentX < startX => deltaX < 0) increases right sidebar width
        const deltaX = currentX - startX;
        const candidateWidth = startWidth - deltaX;

        // Ensure canvas does not shrink below MIN_CANVAS_WIDTH
        const maxAllowedByCanvas = totalWinWidth - otherWidth - MIN_CANVAS_WIDTH;
        const upperLimit = Math.min(
          RIGHT_SIDEBAR_MAX,
          Math.max(RIGHT_SIDEBAR_MIN, maxAllowedByCanvas)
        );

        const clamped = clamp(candidateWidth, RIGHT_SIDEBAR_MIN, upperLimit);
        setRightWidth(clamped);
      }
    };

    const handlePointerUp = () => {
      if (isDraggingLeft) {
        setIsDraggingLeft(false);
        setLeftWidth((final) => {
          try {
            localStorage.setItem(STORAGE_KEY_LEFT_WIDTH, String(final));
          } catch { }
          return final;
        });
      }

      if (isDraggingRight) {
        setIsDraggingRight(false);
        setRightWidth((final) => {
          try {
            localStorage.setItem(STORAGE_KEY_RIGHT_WIDTH, String(final));
          } catch { }
          return final;
        });
      }

      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('blur', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [isDraggingLeft, isDraggingRight]);

  // Initiate Left Drag Session
  const startDraggingLeft = useCallback(
    (e) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startWidth: leftWidth,
        otherWidth: rightWidth,
      };
      setIsDraggingLeft(true);
    },
    [leftWidth, rightWidth]
  );

  // Initiate Right Drag Session
  const startDraggingRight = useCallback(
    (e) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startWidth: rightWidth,
        otherWidth: isLeftCollapsed ? 0 : leftWidth,
      };
      setIsDraggingRight(true);
    },
    [rightWidth, leftWidth, isLeftCollapsed]
  );

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle left sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleLeftCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLeftCollapse]);

  return {
    leftWidth,
    rightWidth,
    isLeftCollapsed,
    isDraggingLeft,
    isDraggingRight,
    isDragging: isDraggingLeft || isDraggingRight,
    isMobile,
    isTablet,
    isLeftDrawerOpen,
    isRightDrawerOpen,
    setIsLeftDrawerOpen,
    setIsRightDrawerOpen,
    openLeftDrawer: () => setIsLeftDrawerOpen(true),
    closeLeftDrawer: () => setIsLeftDrawerOpen(false),
    openRightDrawer: () => setIsRightDrawerOpen(true),
    closeRightDrawer: () => setIsRightDrawerOpen(false),
    startDraggingLeft,
    startDraggingRight,
    toggleLeftCollapse,
    expandLeft,
    collapseLeft,
    resetLeftWidth,
    resetRightWidth,
    saveLeftWidth,
    saveRightWidth,
  };
};
