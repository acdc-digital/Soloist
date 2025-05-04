// RIGHT SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/RightSidebar.tsx

"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, GripVertical } from "lucide-react";
import { initResize } from "@/lib/resizer";

interface RightSidebarProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
}

export function RightSidebar({
  open,
  onClose,
  title = "Details",
  children,
}: RightSidebarProps) {
  const [width, setWidth] = useState(320);
  const MIN_WIDTH = 240;
  const MAX_WIDTH = 500;
  const [isResizeHovered, setIsResizeHovered] = useState(false);

  // If not open, width = 0 hides the panel
  const actualWidth = open ? width : 0;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      initResize(e, setWidth, MIN_WIDTH, MAX_WIDTH, "rightSidebar");
    },
    []
  );

  return (
    <div
      id="rightSidebar"
      style={{
        // Immediately set the panel width
        width: actualWidth,
        // No width transition for drag
        transition: open ? "opacity 0.2s ease-in-out" : "none",
      }}
      className={`
        relative flex-shrink-0 h-full
        bg-white dark:bg-zinc-900
        border-l ${isResizeHovered 
          ? "border-l-zinc-400 dark:border-l-zinc-500" 
          : "border-l-zinc-200 dark:border-l-zinc-700"}
        transition-colors duration-150
        ${open ? "opacity-100" : "opacity-0 overflow-hidden"}
      `}
    >
      {/* Drag handle */}
      {open && (
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 -translate-x-[6px]"
          aria-hidden="true"
          onMouseEnter={() => setIsResizeHovered(true)}
          onMouseLeave={() => setIsResizeHovered(false)}
        >
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown as any}
            className={`
              flex flex-col items-center justify-center cursor-col-resize 
              w-[14px] h-12 rounded-md
              bg-white dark:bg-zinc-800
              border transition-colors duration-150
              ${isResizeHovered 
                ? "border-zinc-400 dark:border-zinc-500" 
                : "border-zinc-300 dark:border-zinc-600"}
              hover:bg-zinc-100 dark:hover:bg-zinc-700
              active:bg-zinc-200 dark:active:bg-zinc-600
              shadow-sm
            `}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <GripVertical className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>
        </div>
      )}

      {/* Left border hover detector (invisible) */}
      {open && (
        <div
          onMouseEnter={() => setIsResizeHovered(true)}
          onMouseLeave={() => setIsResizeHovered(false)}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown as any}
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize z-40"
          style={{ backgroundColor: 'transparent' }}
        />
      )}

      <div
        className={`flex flex-col h-full w-full ${
          open ? "opacity-100 delay-150" : "opacity-0"
        }`}
        style={{ transition: "opacity 0.2s ease-in-out" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
            {title}
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>

        {/* Main content area: vertical scroll, no horizontal scroll */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}