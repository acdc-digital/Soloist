// HEATMAP CALENDAR
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Heatmap.tsx

"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

import { useFeedStore } from "@/store/feedStore";

interface DailyLog {
  date: string;
  score?: number;
}

interface HeatmapProps {
  dailyLogs: DailyLog[];
  year: string;
  onSelectDate?: (dateString: string) => void;
}

function buildDateKey(dateObj: Date): string {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getAllDatesInYear(year: number): Date[] {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const dates: Date[] = [];
  let current = start;
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function getColorClass(score: number | null | undefined): string {
  if (score == null) return "bg-zinc-800/20 border border-zinc-700/30";
  if (score >= 90) return "bg-indigo-400/80 hover:bg-indigo-400";
  if (score >= 80) return "bg-blue-400/80 hover:bg-blue-400";
  if (score >= 70) return "bg-sky-400/80 hover:bg-sky-400";
  if (score >= 60) return "bg-teal-400/80 hover:bg-teal-400";
  if (score >= 50) return "bg-green-400/80 hover:bg-green-400";
  if (score >= 40) return "bg-lime-400/80 hover:bg-lime-400";
  if (score >= 30) return "bg-yellow-400/80 hover:bg-yellow-400";
  if (score >= 20) return "bg-amber-500/80 hover:bg-amber-500";
  if (score >= 10) return "bg-orange-500/80 hover:bg-orange-500";
  return "bg-rose-600/80 hover:bg-rose-600";
}

export default function Heatmap({ dailyLogs, year, onSelectDate }: HeatmapProps) {

  const logsMap = React.useMemo(() => {
    const map = new Map<string, DailyLog>();
    dailyLogs.forEach((log) => map.set(log.date, log));
    return map;
  }, [dailyLogs]);

  const totalLogs = dailyLogs.length;
  const averageScore =
    dailyLogs.reduce((sum, log) => sum + (log.score ?? 0), 0) /
    Math.max(1, totalLogs);

  const today = new Date();
  const isThisYear = today.getFullYear().toString() === year;
  const todayKey = isThisYear ? buildDateKey(today) : null;

  const [hoveredLegend, setHoveredLegend] = React.useState<string | null>(null);

  const legendItems = [
    { label: "90-100", color: "bg-indigo-400", rangeCheck: (s: number) => s >= 90 },
    { label: "80-89", color: "bg-blue-400", rangeCheck: (s: number) => s >= 80 && s < 90 },
    { label: "70-79", color: "bg-sky-400", rangeCheck: (s: number) => s >= 70 && s < 80 },
    { label: "60-69", color: "bg-teal-400", rangeCheck: (s: number) => s >= 60 && s < 70 },
    { label: "50-59", color: "bg-green-400", rangeCheck: (s: number) => s >= 50 && s < 60 },
    { label: "40-49", color: "bg-lime-400", rangeCheck: (s: number) => s >= 40 && s < 50 },
    { label: "30-39", color: "bg-yellow-400", rangeCheck: (s: number) => s >= 30 && s < 40 },
    { label: "20-29", color: "bg-amber-500", rangeCheck: (s: number) => s >= 20 && s < 30 },
    { label: "10-19", color: "bg-orange-500", rangeCheck: (s: number) => s >= 10 && s < 20 },
    { label: "0-9", color: "bg-rose-600", rangeCheck: (s: number) => s >= 0 && s < 10 },
    {
      label: "No Log",
      color: "bg-zinc-800/30 border border-zinc-700/50",
      rangeCheck: (s: number | undefined) => s == null,
    },
  ];

  const allDates = React.useMemo(
    () => getAllDatesInYear(parseInt(year, 10)),
    [year]
  );

  const { selectedDate, setSelectedDate } = useFeedStore();

  const handleDayClick = (dateKey: string) => {
    if (onSelectDate) {
      onSelectDate(dateKey);
    }
    setSelectedDate(dateKey);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top section with badges and info */}
      <div className="flex-shrink-0 flex items-center justify-between mb-2 px-3 pt-2">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="border-zinc-700 text-zinc-600 dark:text-zinc-300">
            {totalLogs} Logs
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-600 dark:text-zinc-300">
            Avg: {Number.isNaN(averageScore) ? "0.0" : averageScore.toFixed(1)}
          </Badge>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <Info className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
              Scroll or wrap to see all days. Click on a block to view/add a log.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* The scrollable calendar area */}
      <div className="flex-1 min-h-0 border border-zinc-200 dark:border-zinc-700 rounded-md mx-0">
        <ScrollArea className="h-full">
          <div className="flex flex-wrap gap-0.75 p-3">
            {allDates.map((dateObj) => {
              const dateKey = buildDateKey(dateObj);
              const dayLog = logsMap.get(dateKey);
              const score = dayLog?.score ?? null;

              let shouldHighlight = hoveredLegend === null;
              if (hoveredLegend) {
                const legendItem = legendItems.find(
                  (item) => item.label === hoveredLegend
                );
                if (legendItem) {
                  shouldHighlight = legendItem.rangeCheck(score as number);
                }
              }

              const isToday = dateKey === todayKey;
              const dayNumber = dateObj.getDate();
              const monthNumber = dateObj.getMonth() + 1;

              return (
                <div
                  key={dateKey}
                  onClick={() => handleDayClick(dateKey)}
                  className={`
                    flex items-center justify-center
                    w-6 h-6 rounded-sm cursor-pointer
                    text-[10px] font-semibold transition-all duration-150
                    ${getColorClass(score)}
                    ${!shouldHighlight ? "opacity-30" : ""}
                    ${isToday ? "ring ring-red-600 dark:ring-zinc-300" : ""}
                    ${selectedDate === dateKey ? "ring ring-blue-600" : ""}
                  `}
                >
                  {score !== null && score >= 50 ? (
                    <span className="text-zinc-900">{dayNumber}</span>
                  ) : (
                    <span className="text-zinc-100">{dayNumber}</span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed legend at the bottom */}
      <div className="flex-shrink-0 mt-2 mb-2 px-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="mb-2">Score legend:</div>
        <div className="flex flex-wrap gap-2">
          {legendItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity duration-200 px-1 py-0.5 rounded-sm hover:bg-zinc-800/30"
              style={{
                opacity:
                  hoveredLegend === null || hoveredLegend === item.label ? 1 : 0.5,
              }}
              onMouseEnter={() => setHoveredLegend(item.label)}
              onMouseLeave={() => setHoveredLegend(null)}
            >
              <div className={`w-3 h-3 rounded-sm ${item.color}`} />
              <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs">
          Scroll vertically to view all days, or use the legend to highlight specific ranges.
        </div>
      </div>
    </div>
  );
}