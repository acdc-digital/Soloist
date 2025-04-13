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
  // Instead of using fixed positioning here, we'll rely on the parent flex layout.
  // You can optionally transition the width or opacity if you want animation.
  return (
    <div
      className={cn(
        "h-full bg-white dark:bg-zinc-900 shadow-lg border-l border-zinc-200 dark:border-zinc-700 transition-all duration-300 ease-in-out",
        open ? "w-80" : "w-0"
      )}
      style={{ overflow: "hidden" }}
    >
      {open && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {title}
            </h2>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 text-sm text-zinc-700 dark:text-zinc-300">
            {children}
          </div>
        </>
      )}
    </div>
  );
}