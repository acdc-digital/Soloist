// HEATMAP CONTROLS 
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Controls.tsx

"use client";

// src/components/dashboard/Controls.tsx
import React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  FilterIcon, 
  Download,
  LayoutGrid,
  BarChart
} from "lucide-react";

// Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
type ControlsProps = {
  selectedYear: string;
  onYearChange: (year: string) => void;
  onLegendFilterChange: (selectedLegend: string | null) => void;
  selectedLegend: string | null;
  viewMode: "continuous" | "calendar";
  onViewModeChange: (mode: "continuous" | "calendar") => void;
};

// Years we want to display in the selector
const AVAILABLE_YEARS = ["2023", "2024", "2025", "2026", "2027"];

// Define the legend items here instead of expecting them as props
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
  { label: "No Log", color: "bg-zinc-800/30 border border-zinc-700/50", rangeCheck: (s: number | undefined) => s == null },
];

const Controls = ({ 
  selectedYear, 
  onYearChange, 
  onLegendFilterChange,
  selectedLegend,
  viewMode,
  onViewModeChange
}: ControlsProps) => {
  
  // Handle year change through direct navigation
  const handleYearChange = (direction: "prev" | "next") => {
    const currentIndex = AVAILABLE_YEARS.indexOf(selectedYear);
    if (direction === "prev" && currentIndex > 0) {
      onYearChange(AVAILABLE_YEARS[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < AVAILABLE_YEARS.length - 1) {
      onYearChange(AVAILABLE_YEARS[currentIndex + 1]);
    }
  };
  
  return (
    <div className="flex items-center pb-4 pr-1 pl-1 gap-3 justify-between flex-wrap sm:flex-nowrap">
      {/* Year Navigation */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleYearChange("prev")}
            disabled={AVAILABLE_YEARS.indexOf(selectedYear) === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Select
            value={selectedYear}
            onValueChange={onYearChange}
          >
            <SelectTrigger className="w-28 h-8 focus:ring-0 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_YEARS.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleYearChange("next")}
            disabled={AVAILABLE_YEARS.indexOf(selectedYear) === AVAILABLE_YEARS.length - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Legend Filter */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 flex items-center gap-1.5"
              >
                <FilterIcon className="h-3.5 w-3.5 text-zinc-500" />
                <span className="hidden sm:inline">{selectedLegend ? selectedLegend : "Filter"}</span>
                {selectedLegend && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-5 px-1 rounded-sm cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLegendFilterChange(null);
                    }}
                  >
                    ✕
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2">
              <div className="space-y-1.5 py-1">
                <div className="text-xs font-medium text-zinc-500 mb-2">
                  Filter by score range:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {legendItems.map((item) => (
                    <div
                      key={item.label}
                      className={`
                        flex items-center gap-1.5 text-xs rounded-sm px-2 py-1.5 cursor-pointer
                        ${selectedLegend === item.label 
                          ? "bg-zinc-100 dark:bg-zinc-800" 
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }
                      `}
                      onClick={() => onLegendFilterChange(
                        selectedLegend === item.label ? null : item.label
                      )}
                    >
                      <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                      <span className="text-zinc-600 dark:text-zinc-400">{item.label}</span>
                    </div>
                  ))}
                </div>
                {selectedLegend && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2 h-7 text-xs"
                    onClick={() => onLegendFilterChange(null)}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Export Button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
    </div>
  );
};

export default Controls;