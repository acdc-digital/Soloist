"use client";

import React, { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { signOut } from "../../../convex/auth";

// Hooks & Stores
import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { useFeedStore } from "@/store/feedStore"; // references sidebarOpen, toggleSidebar, setSelectedDate

// Components
import Sidebar from "./_components/Sidebar";
import Heatmap from "./_components/Heatmap";
import Controls from "./_components/Controls";
import Feed from "./_components/Feed";
import { RightSidebar } from "./_components/RightSidebar";

// Icons & UI
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useUser();
  const setStoreUser = useUserStore((state) => state.setUser);

  // From feedStore: control the right sidebar state
  const { sidebarOpen, toggleSidebar, setSelectedDate } = useFeedStore();

  // Sync user data
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

  // Sign out
  const handleSignOut = async () => {
    await signOut();
    useUserStore.getState().signOut();
  };

  const year = "2025";
  const userId = user ? user._id.toString() : "";

  // Query daily logs
  const dailyLogs = useQuery(api.dailyLogs.listDailyLogs, { userId, year });

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

  // Handler: When a day is clicked, open the feed sidebar.
  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    // Optionally, also set left sidebar mode if needed:
    // setSidebarMode("logForm");
    toggleSidebar();
  };

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 px-2 mt-2 flex items-center justify-between">
          <Controls />
          <Button variant="outline" size="sm" onClick={toggleSidebar}>
            {sidebarOpen ? "Close Feed" : "Open Feed"}
          </Button>
        </div>
        <div className="flex-1 overflow-auto px-2 pb-2">
          <Heatmap dailyLogs={dailyLogs} year={year} onSelectDate={handleSelectDate} />
        </div>
      </main>

      {/* Right Sidebar as a flex item */}
      <RightSidebar
        open={sidebarOpen}
        onClose={() => toggleSidebar()}
        title="My Feed"
      >
        <Feed userId={userId} />
      </RightSidebar>
    </div>
  );
}