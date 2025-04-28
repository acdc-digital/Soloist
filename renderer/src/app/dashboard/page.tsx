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

// Responsive breakpoint for auto-collapse in pixels
const SIDEBAR_AUTO_COLLAPSE_WIDTH = 1256;

export default function Dashboard() {
  const { user } = useUser();
  const setStoreUser = useUserStore((state) => state.setUser);
  const { setCollapsed, currentView } = useSidebarStore();

  // Feed-related store
  const {
    sidebarOpen,
    toggleSidebar,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab,
    setSidebarOpen,
  } = useFeedStore();

  /* ───────────────────────────────────────────── */
  /*  Sync user from Convex → Zustand store        */
  /* ───────────────────────────────────────────── */
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

  /*  Update store only if changed (shallow)       */
  useEffect(() => {
    if (!user) return;

    const next = {
      id: user._id?.toString() ?? "",
      name: user.name ?? "",
      email: user.email ?? "",
      profilePicture: user.imageUrl,
    };

    setStoreUser((prev) => (shallowEqual(prev, next) ? prev : next));
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

  const handleSignOut = async () => {
    await signOut();
    useUserStore.getState().signOut();
  };

  /* ───────────────────────────────────────────── */
  /*  Heatmap year selector                        */
  /* ───────────────────────────────────────────── */
  const [selectedYear, setSelectedYear] = React.useState("2025");
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
    setSelectedDate(dateString);
    setActiveTab("log");
    setSidebarOpen(true);

    if (window.innerWidth < SIDEBAR_AUTO_COLLAPSE_WIDTH) {
      setCollapsed(true);
    }
  };

  function handleYearChange(newYear: string) {
    setSelectedYear(newYear);
  }

  /* ───────────────────────────────────────────── */
  /*  Sidebar title builder                        */
  /* ───────────────────────────────────────────── */
  function renderSidebarTitle() {
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
            <div className="sticky top-0 z-10 px-4 mt-2 mb-2">
              <Controls
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
              />
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
              setSelectedDate(null);
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
                    setSelectedDate(null);
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
              <Feed />
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