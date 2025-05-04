// DASHBOARD PAGE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/page.tsx

"use client";

import React, { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
import { Loader2, ArrowRightToLine } from "lucide-react";
import { Button } from "@/components/ui/button";

// Responsive breakpoint for auto-collapse in pixels
const SIDEBAR_AUTO_COLLAPSE_WIDTH = 1256;

export default function Dashboard() {
  console.log("Dashboard rendering");
  
  const { user } = useUser();
  const setStoreUser = useUserStore((state) => state.setUser);
  const { setCollapsed, currentView } = useSidebarStore();

  // Feed-related store
  const {
    sidebarOpen,
    toggleSidebar,
    selectedDate,
    activeTab,
    setActiveTab,
    setSidebarOpen,
    updateDatePreserveTab,
  } = useFeedStore();
  
  console.log("Dashboard feed state:", {
    sidebarOpen,
    selectedDate,
    activeTab,
    currentView
  });

  /* ───────────────────────────────────────────── */
  /*  Sync user from Convex → Zustand store        */
  /* ───────────────────────────────────────────── */
  useEffect(() => {
    if (user) {
      setStoreUser({
        id: user._id ? user._id.toString() : "",
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.image,
      });
    }
  }, [user, setStoreUser]);

  /*  Update store only if changed (shallow)       */
  useEffect(() => {
    if (!user) return;

    const next = {
      id: user._id?.toString() ?? "",
      name: user.name ?? "",
      email: user.email ?? "",
      profilePicture: user.image,
    };

    // Type-safe comparison
    setStoreUser((prev) => {
      if (shallowEqual(prev, next)) return prev;
      return next;
    });
  }, [user, setStoreUser]);

  /* ───────────────────────────────────────────── */
  /*  Responsive left-sidebar auto-collapse        */
  /* ───────────────────────────────────────────── */
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < SIDEBAR_AUTO_COLLAPSE_WIDTH && sidebarOpen) {
        setCollapsed(true);
      } else if (
        window.innerWidth >= SIDEBAR_AUTO_COLLAPSE_WIDTH &&
        sidebarOpen
      ) {
        setCollapsed(false);
      }
    };

    checkWidth(); // initial
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [sidebarOpen, setCollapsed]);

  // Collapse left sidebar when right sidebar opens on narrow viewports
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < SIDEBAR_AUTO_COLLAPSE_WIDTH) {
      setCollapsed(true);
    }
  }, [sidebarOpen, setCollapsed]);

  // Debug handler to explicitly switch to feed tab
  const handleSwitchToFeed = () => {
    console.log("Explicitly switching to feed tab");
    if (selectedDate) {
      setActiveTab("feed");
      setSidebarOpen(true);
    } else {
      // If no date is selected, get today's date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;
      
      console.log("No date selected, setting to today:", dateKey);
      updateDatePreserveTab(dateKey);
      setActiveTab("feed");
      setSidebarOpen(true);
    }
  };

  /* ───────────────────────────────────────────── */
  /*  Heatmap year selector                        */
  /* ───────────────────────────────────────────── */
  const [selectedYear, setSelectedYear] = React.useState("2025");
  const [selectedLegend, setSelectedLegend] = React.useState<string | null>(null);
  const userId = getUserId(user);

  /*  Fetch daily logs (dashboard view only)       */
  const dailyLogs = useQuery(
    api.dailyLogs.listDailyLogs,
    { userId, year: selectedYear },
    { enabled: currentView === "dashboard" && !!userId }
  );

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

  /* ───────────────────────────────────────────── */
  /*  Handlers                                     */
  /* ───────────────────────────────────────────── */
  const handleSelectDate = (dateString: string) => {
    console.log("handleSelectDate called with:", dateString);
    updateDatePreserveTab(dateString);
    setSidebarOpen(true);

    if (window.innerWidth < SIDEBAR_AUTO_COLLAPSE_WIDTH) {
      setCollapsed(true);
    }
  };

  function handleYearChange(newYear: string) {
    setSelectedYear(newYear);
  }

  function handleLegendFilterChange(legend: string | null) {
    setSelectedLegend(legend);
  }

  /* ───────────────────────────────────────────── */
  /*  Sidebar title builder                        */
  /* ───────────────────────────────────────────── */
  function renderSidebarTitle() {
    console.log("renderSidebarTitle called, activeTab:", activeTab);
    
    // Daily Log
    if (activeTab === "log") {
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

    // Feed
    if (activeTab === "feed") {
      if (!selectedDate) return "Feed";
      const parsed = parseISO(selectedDate);
      const formatted = format(parsed, "MMM d, yyyy");
      return (
        <div className="flex flex-col">
          <span className="font-semibold">Feed</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatted}
          </span>
        </div>
      );
    }

    return null;
  }

  /* ───────────────────────────────────────────── */
  /*  Render                                       */
  /* ───────────────────────────────────────────── */
  return (
    <div className="flex h-full bg-white dark:bg-zinc-900">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main content */}
      {currentView === "dashboard" ? (
        <>
          <main className="flex-1 flex flex-col relative">
            {/* Year controls */}
            <div className="sticky top-0 z-10 px-4 mt-2">
              <div className="flex justify-between items-center mb-2">
                <Controls
                  selectedYear={selectedYear}
                  onYearChange={handleYearChange}
                  selectedLegend={selectedLegend}
                  onLegendFilterChange={handleLegendFilterChange}
                />
              </div>
              
              {/* Debug button row */}
              <div className="flex justify-end mb-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={handleSwitchToFeed}
                  className="text-xs"
                >
                  <ArrowRightToLine className="h-3 w-3 mr-1" />
                  Force Feed Tab
                </Button>
              </div>
            </div>

            {/* Heatmap */}
            <div className="flex-1 overflow-auto px-3 pb-2">
              <Heatmap
                year={parseInt(selectedYear)}
                onSelectDate={handleSelectDate}
              />
            </div>
          </main>

          {/* Right sidebar */}
          <RightSidebar
            open={sidebarOpen}
            title={renderSidebarTitle()}
            onClose={() => {
              toggleSidebar();
              updateDatePreserveTab(null);
              if (window.innerWidth >= SIDEBAR_AUTO_COLLAPSE_WIDTH) {
                setCollapsed(false);
              }
            }}
          >
            {activeTab === "log" ? (
              selectedDate ? (
                <DailyLogForm
                  date={selectedDate}
                  onClose={() => {
                    toggleSidebar();
                    updateDatePreserveTab(null);
                    if (window.innerWidth >= SIDEBAR_AUTO_COLLAPSE_WIDTH) {
                      setCollapsed(false);
                    }
                  }}
                />
              ) : (
                <div className="p-4 text-sm text-zinc-500">
                  Click a day on the calendar to open the log form.
                </div>
              )
            ) : activeTab === "feed" ? (
              <div>
                {console.log("Rendering Feed component", { activeTab, selectedDate })}
                <Feed />
              </div>
            ) : (
              <div className="p-4 text-sm text-zinc-500">No content.</div>
            )}
          </RightSidebar>
        </>
      ) : (
        /* Soloist view */
        <main className="flex-1 overflow-hidden">
          <SoloistPage />
        </main>
      )}
    </div>
  );
}