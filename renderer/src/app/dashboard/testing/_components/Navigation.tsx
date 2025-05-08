// TESTING NAVIGATION COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/_components/Navigation.tsx

"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, RefreshCcw } from "lucide-react";
import { format, addDays, differenceInCalendarDays, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { useTestingStore } from "../../../../store/Testingstore";

interface NavigationProps {
  onGenerateForecast: () => Promise<void>;
}

export default function Navigation({ onGenerateForecast }: NavigationProps) {
  const { 
    selectedDateRange, 
    setSelectedDateRange,
    isGeneratingForecast,
    forecastGenerated,
    resetState,
    clearDailyDetailsCache,
    clearWeeklyInsightsCache
  } = useTestingStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0); // Key to force re-rendering

  /** Temporary range the user is choosing in the calendar */
  const [tempRange, setTempRange] = useState<{ from: Date | null; to: Date | null }>({
    from: selectedDateRange.start,
    to: selectedDateRange.end,
  });

  // When the popover opens, reset the temp range
  useEffect(() => {
    if (isOpen) {
      // Smooth transition - small delay before resetting
      const timer = setTimeout(() => {
        setTempRange({ from: null, to: null });
        setCalendarKey(prev => prev + 1); // Force calendar re-render with new key
      }, 50);
      return () => clearTimeout(timer);
    } else if (!isOpen && !tempRange.from && !tempRange.to) {
      // When closing without selection, restore the previous selection
      setTempRange({
        from: selectedDateRange.start,
        to: selectedDateRange.end,
      });
    }
  }, [isOpen, selectedDateRange.start, selectedDateRange.end]);

  // Memoized default month to prevent jumping
  const defaultMonth = useMemo(() => {
    return tempRange.from || selectedDateRange.start || new Date();
  }, [tempRange.from, selectedDateRange.start]);

  // Commit a range only when it's exactly four consecutive days
  const handleRangeSelect = useCallback((range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    
    const from = range.from ?? null;
    const to = range.to ?? null;
    
    setTempRange({ from, to });

    if (from && to) {
      const start = isBefore(from, to) ? from : to;
      const end = isAfter(to, from) ? to : from;
      const diff = differenceInCalendarDays(end, start);
      
      if (diff <= 3) {
        const finalEnd = diff < 3 ? addDays(start, 3) : end;
        
        setTimeout(() => {
          // Clear caches BEFORE setting the new range
          clearDailyDetailsCache(); 
          clearWeeklyInsightsCache();
          setSelectedDateRange({ 
            start: start, 
            end: finalEnd 
          });
          setIsOpen(false);
        }, 150);
      }
    }
  }, [setSelectedDateRange, clearDailyDetailsCache, clearWeeklyInsightsCache]);

  const handleReset = useCallback(() => {
    // Clear caches as part of the reset
    clearDailyDetailsCache(); 
    clearWeeklyInsightsCache();
    resetState(); // resetState also clears the caches now, but explicit call is fine
    setTempRange({ from: null, to: null });
    setCalendarKey(prev => prev + 1); 
    
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 3);
    
    setTimeout(() => {
      setSelectedDateRange({ 
        start: start, 
        end: today 
      });
    }, 100);
    
    setTimeout(() => setIsOpen(false), 150);
  }, [resetState, setSelectedDateRange, clearDailyDetailsCache, clearWeeklyInsightsCache]);
    
  // Format the range for display
  const formatRange = useCallback(() => {
    if (selectedDateRange.start && selectedDateRange.end) {
      return `${format(selectedDateRange.start, 'MMM d, yyyy')} - ${format(selectedDateRange.end, 'MMM d, yyyy')}`;
    } else if (selectedDateRange.start) {
      return `${format(selectedDateRange.start, 'MMM d, yyyy')} - Select end date`;
    } else {
      return "Select date range";
    }
  }, [selectedDateRange.start, selectedDateRange.end]);
  
  // Calculate forecast dates
  const forecastDates = useMemo(() => {
    if (!selectedDateRange.end) return null;
    
    const forecastStart = addDays(selectedDateRange.end, 1);
    const forecastEnd = addDays(forecastStart, 3); // 4 days total
    return { forecastStart, forecastEnd };
  }, [selectedDateRange.end]);

  return (
    <div className="flex flex-col gap-3 p-3 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold">Date Range Selection</h3>
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-zinc-500 h-7 text-xs px-2 transition-all duration-200"
            disabled={!selectedDateRange.start}
          >
            <RefreshCcw className="mr-1 h-3 w-3" />
            Reset
          </Button> */}
          <Button
            onClick={onGenerateForecast}
            disabled={
              !selectedDateRange.start ||
              !selectedDateRange.end ||
              isGeneratingForecast ||
              forecastGenerated
            }
            variant={forecastGenerated ? "ghost" : "default"}
            className={cn(
              "transition-all duration-200 h-7 text-xs px-2",
              forecastGenerated && "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            )}
            size="sm"
          >
            {isGeneratingForecast
              ? "Generating..."
              : forecastGenerated
                ? "Forecast Generated"
                : "Generate Forecast"}
          </Button>
        </div>
      </div>
      
      {/* Date picker */}
      <div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-8 justify-start text-left font-normal text-sm transition-all duration-200",
                !selectedDateRange.start && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              <span className="truncate">{formatRange()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2 border-b">
              <div className="text-xs text-zinc-500">
                Select 4 consecutive days
              </div>
            </div>
            <div className="transition-opacity duration-200 ease-in-out">
              <Calendar
                key={calendarKey}
                mode="range"
                numberOfMonths={1}
                selected={{
                  from: tempRange.from ?? undefined,
                  to: tempRange.to ?? undefined,
                }}
                onSelect={handleRangeSelect}
                disabled={(date) => {
                  // If there's an anchor date, only allow dates within range of ±3 days
                  if (tempRange.from && !tempRange.to) {
                    const diff = differenceInCalendarDays(date, tempRange.from);
                    return Math.abs(diff) > 3; 
                  }
                  
                  if (!tempRange.from && tempRange.to) {
                    const diff = differenceInCalendarDays(date, tempRange.to);
                    return Math.abs(diff) > 3;
                  }
                  
                  return false;
                }}
                defaultMonth={defaultMonth}
                className="transition-all duration-300"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Range display */}
      {selectedDateRange.start && selectedDateRange.end && (
        <div className="mt-1 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-md border border-zinc-100 dark:border-zinc-800 transition-all duration-300 animate-in fade-in-50">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-1"></div>
              <span className="text-xs text-zinc-500 mr-2">Selected:</span>
              <span className="text-xs font-medium">
                {format(selectedDateRange.start, 'MMM d, yyyy')} - {format(selectedDateRange.end, 'MMM d, yyyy')}
              </span>
            </div>
            
            {forecastDates && (
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                <span className="text-xs text-zinc-500 mr-2">Forecast:</span>
                <span className="text-xs font-medium">
                  {format(forecastDates.forecastStart, 'MMM d, yyyy')} - {format(forecastDates.forecastEnd, 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
