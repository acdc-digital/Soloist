// RIGHT SIDEBAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/RightSidebar.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RightSidebarProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
}

export function RightSidebar({ open, onClose, title = "Details", children }: RightSidebarProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0", // Prevent shrinking in the parent flex layout
        "h-full bg-white dark:bg-zinc-900 shadow-lg border-l border-zinc-200 dark:border-zinc-700",
        "transition-all duration-300 ease-in-out", // Transition width
        open ? "w-80 opacity-100" : "w-0 opacity-0" 
      )}
    >
      {/* Inner container for layout and smooth content fade */}
      <div className={cn(
        "flex flex-col h-full w-full",
        "transition-opacity duration-200 ease-in-out",
        open ? "opacity-100 delay-150" : "opacity-0"
      )}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
            {title}
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
        {/* Content Area: Change overflow-hidden to overflow-y-auto for vertical scrolling */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}