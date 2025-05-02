// DRAGGABALE HEADER
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/DraggableHeader.tsx

import React from "react";
import { ThemeToggle } from "./themeToggle";

const DraggableHeader: React.FC = () => {
  return (
    <div
      style={{ WebkitAppRegion: "drag" }}
      className="flex h-9 items-center justify-between px-2 bg-zinc-50 dark:bg-zinc-800"
    >
      {/* Title or Logo */}
      <div className="flex-1 leading-none">
      </div>
      {/* Interactive elements go in a no-drag region */}
      <div style={{ WebkitAppRegion: "no-drag" }}>
      <ThemeToggle />
        {/* e.g., min/max/close buttons or other controls */}
      </div>
    </div>
  );
};

export default DraggableHeader;