// DASHBOARD
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { signOut } from "../../../convex/auth";

// Hooks & Stores
import { useUser } from "@/hooks/useUser";
import { useUserStore } from "@/store/userStore";
import { useSidebarStore } from "@/store/sidebarStore";

// Components
import Sidebar from "./_components/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// Icons
import { Calendar, Loader2, Info } from "lucide-react";

// ------------------
// Utility Functions
// ------------------

function daysInMonth(monthIndex: number): number {
  // For 2025, February has 28 days (not a leap year), etc.
  if (monthIndex === 1) return 28; // Feb
  if ([3, 5, 8, 10].includes(monthIndex)) return 30; // Apr, Jun, Sep, Nov
  return 31; // All other months
}

function getColorClass(score: number | null | undefined): string {
  if (score == null) return "bg-zinc-800/20 border border-zinc-700/30"; // No log
  if (score >= 90) return "bg-emerald-500/80 hover:bg-emerald-500";
  if (score >= 70) return "bg-emerald-400/80 hover:bg-emerald-400";
  if (score >= 50) return "bg-amber-400/80 hover:bg-amber-400";
  if (score >= 30) return "bg-amber-500/80 hover:bg-amber-500";
  if (score >= 10) return "bg-rose-400/80 hover:bg-rose-400";
  return "bg-rose-600/80 hover:bg-rose-600";
}

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

  // Basic year assumption for the heatmap
  const year = "2025";
  const userId = user ? user._id.toString() : "";

  // Query daily logs
  const dailyLogs = useQuery(api.dailyLogs.listDailyLogs, { userId, year });

  // Zustand store for controlling the right sidebar details
  const { setSelectedDate, setSidebarMode } = useSidebarStore();

  // Keep track of "today" to highlight
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  // For legend hover behavior
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);

  // Loading state
  if (!dailyLogs) {
    return (
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-zinc-500 animate-spin mb-2" />
            <p className="text-sm text-zinc-400">Loading your heatmap...</p>
          </div>
        </main>
      </div>
    );
  }

  // Turn dailyLogs array into a map keyed by "YYYY-MM-DD"
  const logsMap = new Map<string, { date: string; score?: number }>();
  dailyLogs.forEach((log) => logsMap.set(log.date, log));

  // Generate stats
  const totalLogs = dailyLogs.length;
  const averageScore =
    dailyLogs.reduce((sum, log) => sum + (log.score || 0), 0) /
    Math.max(1, totalLogs);

  // Legend items
  const legendItems = [
    { label: "90-100", color: "bg-emerald-500", score: 95 },
    { label: "70-89", color: "bg-emerald-400", score: 75 },
    { label: "50-69", color: "bg-amber-400", score: 55 },
    { label: "30-49", color: "bg-amber-500", score: 35 },
    { label: "10-29", color: "bg-rose-400", score: 15 },
    { label: "0-9", color: "bg-rose-600", score: 5 },
    { label: "No Log", color: "bg-zinc-800/30 border border-zinc-700/50", score: null },
  ];

  // Handle day click -> open sidebar for that date
  function handleDayClick(monthIndex: number, day: number) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateString = `${year}-${mm}-${dd}`;
    setSelectedDate(dateString);
    setSidebarMode("logForm");
  }

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  const monthsAbbr = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Left Sidebar (with expand/collapse behavior) */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Heatmap content */}
        <ScrollArea className="h-full w-full" type="hover">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="pt-4 pl-4 border-b border-zinc-200">
              <div className="flex items-start justify-between gap-2 pb-3.25">
                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-zinc-400" />
                    Dashboard Heatmap
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Track your daily scores and see your progress over time
                  </p>
                </div>
                {/* Stats badges */}
                <div className="flex gap-3 pr-6 pt-4">
                  <Badge variant="outline" className="px-2 py-1 border-zinc-700 text-zinc-500 dark:text-zinc-300">
                    {totalLogs} Logs
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 border-zinc-700 text-zinc-500 dark:text-zinc-300">
                    Avg: {averageScore.toFixed(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <Card className="bg-white dark:bg-zinc-900/50 border dark:border-zinc-800/50 shadow-md m-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-zinc-800 dark:text-zinc-100">
                    {year} Overview
                  </h2>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                        <p>Click on any day to add or view a daily log.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-5">
                  {months.map((month, monthIndex) => {
                    const totalDays = daysInMonth(monthIndex);
                    const isCurrentMonth = (
                      currentYear.toString() === year && currentMonth === monthIndex
                    );

                    return (
                      <div key={month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            {month}
                            {isCurrentMonth && (
                              <Badge className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                                Current
                              </Badge>
                            )}
                          </div>
                          {/* Count of logs for this month */}
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {
                              dailyLogs.filter((log) => {
                                const logMonth = parseInt(log.date.split("-")[1]) - 1;
                                return logMonth === monthIndex;
                              }).length
                            } logs
                          </div>
                        </div>

                        <div
                          className="grid gap-1"
                          style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(24px, 1fr))` }}
                        >
                          {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                            const mm = String(monthIndex + 1).padStart(2, "0");
                            const dd = String(day).padStart(2, "0");
                            const dateKey = `${year}-${mm}-${dd}`;
                            const log = logsMap.get(dateKey);
                            const score = log?.score ?? null;

                            // Is it today?
                            const isToday =
                              currentYear.toString() === year &&
                              currentMonth === monthIndex &&
                              currentDay === day;

                            // Should we dim this day based on hovered legend?
                            const shouldHighlight =
                              hoveredLegend === null ||
                              (score !== null &&
                                (
                                  (hoveredLegend === "90-100" && score >= 90) ||
                                  (hoveredLegend === "70-89" && score >= 70 && score < 90) ||
                                  (hoveredLegend === "50-69" && score >= 50 && score < 70) ||
                                  (hoveredLegend === "30-49" && score >= 30 && score < 50) ||
                                  (hoveredLegend === "10-29" && score >= 10 && score < 30) ||
                                  (hoveredLegend === "0-9"  && score < 10)
                                )
                              ) ||
                              (score === null && hoveredLegend === "No Log");

                            return (
                              <TooltipProvider key={day}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={`
                                        relative w-6 h-6 rounded-sm ${getColorClass(score)}
                                        flex items-center justify-center cursor-pointer
                                        transition-all duration-200 hover:scale-110
                                        ${!shouldHighlight ? "opacity-30" : ""}
                                        ${isToday ? "ring-1 ring-zinc-600 dark:ring-zinc-300" : ""}
                                      `}
                                      onClick={() => handleDayClick(monthIndex, day)}
                                    >
                                      <span
                                        className={`
                                          text-[10px] font-medium
                                          ${score !== null && score >= 50 ? "text-zinc-900" : "text-zinc-100"}
                                        `}
                                      >
                                        {day}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    className="bg-zinc-800 border-zinc-700 text-zinc-200"
                                    side="top"
                                  >
                                    <p>{monthsAbbr[monthIndex]} {day}, {year}</p>
                                    {score !== null ? (
                                      <p className="font-medium">Score: {score}</p>
                                    ) : (
                                      <p>No log yet</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Separator before legend */}
                <Separator className="my-6 bg-zinc-200 dark:bg-zinc-800/30" />

                {/* Legend */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="w-full text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    Score legend:
                  </div>
                  {legendItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity duration-200 px-1.5 py-1 rounded-sm hover:bg-zinc-800/30"
                      style={{
                        opacity:
                          hoveredLegend === null || hoveredLegend === item.label ? 1 : 0.5,
                      }}
                      onMouseEnter={() => setHoveredLegend(item.label)}
                      onMouseLeave={() => setHoveredLegend(null)}
                    >
                      <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                      <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/20 py-2 border-t border-zinc-200 dark:border-zinc-800/30">
                Click on any day to view or create a daily log
              </CardFooter>
            </Card>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}