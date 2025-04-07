// DASHBOARD
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/page.tsx

"use client";

import React, { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { signOut } from "../../../convex/auth";

// Hooks & Stores
import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";

// Components
import Sidebar from "./_components/sidebar";
import Heatmap from "./_components/Heatmap";
import Controls from "./_components/Controls";

// Icons
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const setStoreUser = useUserStore((state) => state.setUser);

  // Keep the user store in sync
  useEffect(() => {
    if (user) {
      setStoreUser({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.imageUrl,
      });
    }
  }, [user, setStoreUser]);

  // Sign out handler
  const handleSignOut = async () => {
    await signOut();
    useUserStore.getState().signOut();
  };

  // Hard-coded year for example
  const year = "2025";
  const userId = user ? user._id.toString() : "";

  // Query daily logs
  const dailyLogs = useQuery(api.dailyLogs.listDailyLogs, { userId, year });

  // Zustand store for right sidebar
  const { setSelectedDate, setSidebarMode } = useSidebarStore();

  // Handler to open sidebar for selected date
  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setSidebarMode("logForm");
  };

  // If still loading logs, show spinner
  if (!dailyLogs) {
    return (
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-zinc-500 animate-spin mb-2" />
            <p className="text-sm text-zinc-400">Loading your heatmap...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4">
          <div>
            <Controls />
          </div>
          {/* Our Heatmap fills available width/height */}
          <div className="h-full w-full">
            <Heatmap
              dailyLogs={dailyLogs}
              year={year}
              onSelectDate={handleSelectDate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}