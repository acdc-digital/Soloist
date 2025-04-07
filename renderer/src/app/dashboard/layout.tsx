// DASHBOARD LAYOUT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/layout.tsx

import React from "react";
import DraggableHeader from "./_components/DraggableHeader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-zinc-200">
      <DraggableHeader />
      </div>
      {/* Fill remaining space with the page content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}