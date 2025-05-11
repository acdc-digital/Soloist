// HEATMAP CONTROLS 
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Controls.tsx

"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  Tag as TagIcon,
} from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Store & Types
import { useFeedStore, RightSidebarTab } from "@/store/feedStore";
import { Tag } from "./Tags";

// Import your new YearSelector
import { YearSelector } from "./YearSelector";

// Define the legend items locally or import from utils
const legendItems = [
  { label: "90-100", color: "bg-indigo-400" },
  { label: "80-89", color: "bg-blue-400" },
  { label: "70-79", color: "bg-sky-400" },
  { label: "60-69", color: "bg-teal-400" },
  { label: "50-59", color: "bg-green-400" },
  { label: "40-49", color: "bg-lime-400" },
  { label: "30-39", color: "bg-yellow-400" },
  { label: "20-29", color: "bg-amber-500" },
  { label: "10-19", color: "bg-orange-500" },
  { label: "0-9", color: "bg-rose-600" },
  { label: "No Log", color: "bg-zinc-800/30 border border-zinc-700/50" },
];

type ControlsProps = {
  selectedYear: string;
  onYearChange: (year: string) => void;
  onLegendFilterChange: (selectedLegend: string | null) => void;
  selectedLegend: string | null;
  // New props for tag filtering
  availableTags?: Tag[];
  selectedTags?: Tag[];
  onTagFilterChange?: (tags: Tag[]) => void;
};

export default function Controls({
  selectedYear,
  onYearChange,
  onLegendFilterChange,
  selectedLegend,
  availableTags = [],
  selectedTags = [],
  onTagFilterChange = () => {},
}: ControlsProps) {
  // --- State from Feed Store ---
  const activeTab = useFeedStore((state) => state.activeTab);
  const setActiveTab = useFeedStore((state) => state.setActiveTab);

  // Define your year range however you like
  const minYear = 1970;
  const maxYear = new Date().getFullYear() + 10;

  // Handlers for arrow buttons
  const handlePrevYear = () => {
    const current = parseInt(selectedYear, 10);
    if (current > minYear) {
      onYearChange(String(current - 1));
    }
  };

  const handleNextYear = () => {
    const current = parseInt(selectedYear, 10);
    if (current < maxYear) {
      onYearChange(String(current + 1));
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "log" || value === "feed") {
      setActiveTab(value as RightSidebarTab);
    }
  };

  // Helper to check if there's any active filter
  const hasLegendFilter = selectedLegend !== null;
  const hasTagFilter = selectedTags.length > 0;
  const hasAnyFilter = hasLegendFilter || hasTagFilter;

  // Toggle a tag in the selected tags list
  const toggleTagFilter = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagFilterChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagFilterChange([...selectedTags, tag]);
    }
  };

  // Get tag color class based on tag color
  const getTagColorClass = (tag: Tag, isSelected: boolean) => {
    if (!isSelected) {
      return "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700";
    }
    
    switch (tag.color) {
      case "red": return "bg-red-500 hover:bg-red-600 text-white";
      case "green": return "bg-green-500 hover:bg-green-600 text-white";
      case "blue": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "yellow": return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "purple": return "bg-purple-500 hover:bg-purple-600 text-white";
      case "pink": return "bg-pink-500 hover:bg-pink-600 text-white";
      case "orange": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "cyan": return "bg-cyan-500 hover:bg-cyan-600 text-white";
      case "indigo": return "bg-indigo-500 hover:bg-indigo-600 text-white";
      default: return "bg-zinc-500 hover:bg-zinc-600 text-white";
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full">

      {/* ----- Left Side: Year Navigation ----- */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevYear}
          disabled={+selectedYear <= minYear}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <YearSelector
          selectedYear={selectedYear}
          onYearChange={onYearChange}
          minYear={minYear}
          maxYear={maxYear}
          className="w-28 h-8 font-medium"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextYear}
          disabled={+selectedYear >= maxYear}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ----- Middle: Filter Control ----- */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={hasAnyFilter ? "default" : "outline"} 
            size="sm" 
            className="h-8 flex items-center gap-1.5"
          >
            <FilterIcon className="h-3.5 w-3.5 text-zinc-500" />
            <span className="hidden sm:inline">
              {hasAnyFilter ? "Filters Active" : "Filter"}
            </span>
            {hasAnyFilter && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1 rounded-sm cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                {hasTagFilter ? selectedTags.length : ""}
                {hasLegendFilter ? (hasTagFilter ? "+" : "") + selectedLegend : ""}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-2">
          {/* Score Range Filter */}
          <div className="space-y-1.5 py-1">
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 px-1">
              Filter by score range:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {legendItems.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 text-xs rounded-sm px-2 py-1.5 cursor-pointer transition-colors ${
                    selectedLegend === item.label
                      ? "bg-zinc-100 dark:bg-zinc-800 font-medium"
                      : "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                  }`}
                  onClick={() =>
                    onLegendFilterChange(
                      selectedLegend === item.label ? null : item.label
                    )
                  }
                >
                  <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.color}`} />
                  <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags section - only show if we have tags */}
          {availableTags.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="space-y-1.5 py-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 px-1 flex items-center gap-1">
                    <TagIcon className="h-3 w-3" />
                    <span>Filter by tags:</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.some(t => t.id === tag.id);
                    return (
                      <Badge
                        key={tag.id}
                        className={`cursor-pointer ${getTagColorClass(tag, isSelected)}`}
                        onClick={() => toggleTagFilter(tag)}
                      >
                        {tag.name}
                        {isSelected && <span className="ml-1 text-xs">×</span>}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Clear filters button - only if we have active filters */}
          {hasAnyFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-7 text-xs"
              onClick={() => {
                if (hasLegendFilter) onLegendFilterChange(null);
                if (hasTagFilter) onTagFilterChange([]);
              }}
            >
              Clear All Filters
            </Button>
          )}
        </PopoverContent>
      </Popover>

      {/* Spacer div to push the Tabs to the right */}
      <div className="flex-grow"></div>

      {/* ----- Rightmost: Tabs for Right Sidebar View ----- */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-[150px] flex-shrink-0">
        <TabsList className="grid w-full grid-cols-2 h-8">
          <TabsTrigger value="log" className="text-xs h-7">
            Log
          </TabsTrigger>
          <TabsTrigger value="feed" className="text-xs h-7">
            Feed
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}