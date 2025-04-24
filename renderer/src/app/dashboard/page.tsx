// DASHBOARD PAGE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/page.tsx

"use client";

import React, { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { signOut } from "../../../convex/auth";
import { parseISO, format } from "date-fns";

// Hooks & Stores
import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { useFeedStore } from "@/store/feedStore";
import { getUserId } from "@/utils/userUtils";
import { shallowEqual } from "@/utils/objectEquals";

// Components
import { Sidebar } from "./_components/sidebar";
import Heatmap from "./_components/Heatmap";
import Controls from "./_components/Controls";
import DailyLogForm from "./_components/dailyLogForm";
import Feed from "./_components/Feed";
import { RightSidebar } from "./_components/RightSidebar";
import SoloistPage from "./soloist/page";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const setStoreUser = useUserStore((state) => state.setUser);
  const { setCollapsed, currentView } = useSidebarStore();

  // Our feed store: if 'sidebarOpen' is true, the feed is open
  const {
    sidebarOpen,
    toggleSidebar,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab,
    setSidebarOpen,
  } = useFeedStore();

  // Keep user store in sync - this looks good already
  useEffect(() => {
    if (user) {
      setStoreUser({
        id: user._id ? user._id.toString() : "",
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.imageUrl,
      });
    }
  }, [user, setStoreUser]);

  // Second effect: auto-collapse left sidebar if (window < 1256) & feed is open
  useEffect(() => {
    if (!user) return;                    // still loading
  
    const next = {
      id:   user._id?.toString() ?? "",
      name: user.name        ?? "",
      email: user.email      ?? "",
      profilePicture: user.imageUrl,
    };
  
    // Functional update: we get the *current* store value
    setStoreUser(prev => {
      return shallowEqual(prev, next) ? prev : next;
    });
    }, [user, setStoreUser]);

  const handleSignOut = async () => {
    await signOut();
    useUserStore.getState().signOut();
  };

  // Year Selection
  const [selectedYear, setSelectedYear] = React.useState("2025");
  
  // Use getUserId utility instead of direct access
  const userId = getUserId(user);

  // Query logs (only needed for dashboard view)
  const dailyLogs = useQuery(
    api.dailyLogs.listDailyLogs, 
    { userId, year: selectedYear },
    { enabled: currentView === "dashboard" && !!userId } // Only query when in dashboard view and userId exists
  );

  // If we're in dashboard view and data is loading
  if (currentView === "dashboard" && !dailyLogs) {
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

  // If a day is clicked in Heatmap
  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setActiveTab("log");
    setSidebarOpen(true);
  };

  // Example formatting for 'Daily Log Form' title
  function renderLogTitle() {
    if (activeTab !== "log") return "Feed";
    if (!selectedDate) return "Daily Log Form";

    const parsed = parseISO(selectedDate);
    const formatted = format(parsed, "MMM d, yyyy");
    return (
      <div className="flex flex-col">
        <span className="font-semibold">Daily Log Form</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {formatted}
        </span>
      </div>
    );
  }

  function handleYearChange(newYear: string) {
    setSelectedYear(newYear);
  }

  return (
    <div className="flex h-full bg-white dark:bg-zinc-900">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main content - conditionally render based on current view */}
      {currentView === "dashboard" ? (
        <>
          <main className="flex-1 flex flex-col relative">
            <div className="sticky top-0 z-10 px-4 mt-2 mb-2">
              <Controls
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
              />
            </div>
            <div className="flex-1 overflow-auto px-3 pb-2">
              <Heatmap
                dailyLogs={dailyLogs}
                year={selectedYear}
                onSelectDate={handleSelectDate}
              />
            </div>
          </main>

          {/* Right sidebar for dashboard view */}
          <RightSidebar
            open={sidebarOpen}
            onClose={() => {
              toggleSidebar();
              setSelectedDate(null);
            }}
            title={renderLogTitle()}
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
              <Feed />
            ) : (
              <div className="p-4 text-sm text-zinc-500">No content.</div>
            )}
          </RightSidebar>
        </>
      ) : (
        // Soloist view
        <main className="flex-1 overflow-hidden">
          <SoloistPage />
        </main>
      )}
    </div>
  );
}