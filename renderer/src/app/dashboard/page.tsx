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
import { useFeedStore, RightSidebarTab } from "@/store/feedStore"; // contains sidebarOpen, toggleSidebar, setSelectedDate, selectedDate, activeTab, setActiveTab

// Components
import Sidebar from "./_components/sidebar";
import Heatmap from "./_components/Heatmap";
import Controls from "./_components/Controls";
import DailyLogForm from "./_components/dailyLogForm";
import Feed from "./_components/Feed";
import { RightSidebar } from "./_components/RightSidebar";

// Icons & UI
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useUser();
  const setStoreUser = useUserStore((state) => state.setUser);

  // From feedStore: state for right sidebar and active tab
  const { sidebarOpen, toggleSidebar, selectedDate, setSelectedDate, activeTab, setSidebarOpen, setActiveTab } = useFeedStore();

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

  // When a day is clicked, update the store and open the right sidebar.
  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setActiveTab("log");
    // Optionally, default to showing the DailyLogForm tab when a day is selected.
    // If you want to switch tab programmatically, uncomment the line below:
    // setActiveTab("log");
    setSidebarOpen(true);
  };

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 px-2 mt-2 mb-2">
          <Controls />
        </div>
        <div className="flex-1 overflow-auto px-3 pb-2">
          <Heatmap dailyLogs={dailyLogs} year={year} onSelectDate={handleSelectDate} />
        </div>
      </main>

      {/* Right Sidebar: it displays either the DailyLogForm (if "log" tab is active) or the Feed (if "feed" tab is active) */}
      <RightSidebar
        open={sidebarOpen}
        onClose={() => {
          toggleSidebar();
          setSelectedDate(null);
        }}
        title={activeTab === "log" ? "Daily Log Form" : "Feed"}
      >
        {activeTab === "log" ? (
          selectedDate ? (
            <DailyLogForm
              onClose={() => {
                toggleSidebar();
                setSelectedDate(null);
              }}
              date={selectedDate}
            />
          ) : (
            <div className="p-4 text-sm text-zinc-500">
              Click a day on the calendar to open the log form.
            </div>
          )
        ) : activeTab === "feed" ? (
          <Feed userId={userId} />
        ) : (
          <div className="p-4 text-sm text-zinc-500">No content.</div>
        )}
      </RightSidebar>
    </div>
  );
}