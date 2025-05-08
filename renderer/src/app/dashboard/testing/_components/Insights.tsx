// INSIGHTS COMPONENT
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/_components/Insights.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ArrowRight, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTestingStore } from "../../../../store/Testingstore"; // Import store
import { format } from 'date-fns';

// Simplified ForecastDay structure, ensure it aligns with what sevenDayData provides
interface DayDataItem {
  date: string;
  day?: string;
  shortDay?: string;
  formattedDate?: string;
  emotionScore: number | null;
  isFuture: boolean;
  isPast?: boolean;
  isToday?: boolean;
  description?: string;
  details?: string;
  // Include other fields from sevenDayData if they are relevant for context
  answers?: any; 
  trend?: string | null;
  confidence?: number | null;
}

interface InsightsProps {
  userId: string;
  sevenDayData: DayDataItem[];
  // We need selectedDateRange to generate a cache key, similar to Consult.tsx
  selectedDateRange: { start: Date | null; end: Date | null };
}

// Define expected action result types - Keeping for clarity but won't strictly enforce on 'result' initially
type GenerateInsightsSuccess = { success: true; insights: string[] };
type GenerateInsightsError = { success: false; error: string };
// type GenerateInsightsResult = GenerateInsightsSuccess | GenerateInsightsError | null; 

// Helper to get the key for a date range (copied from TestingPage)
function getRangeKey(start: Date | null, end: Date | null) {
  if (!start || !end) return "";
  return `${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}`;
}

export default function Insights({ userId, sevenDayData, selectedDateRange }: InsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightsList, setInsightsList] = useState<string[] | null>(null);

  const weeklyInsightsCache = useTestingStore((state) => state.weeklyInsightsCache);
  const setWeeklyInsights = useTestingStore((state) => state.setWeeklyInsights);

  const generateInsightsAction = useAction(api.generator.generateWeeklyInsights);

  useEffect(() => {
    const fetchOrGetCachedInsights = async () => {
      if (!userId || !sevenDayData || sevenDayData.length < 7 || !selectedDateRange.start || !selectedDateRange.end) {
        // Not enough data to generate insights or form a cache key
        setInsightsList([]); // Clear any previous insights
        return;
      }

      const cacheKey = getRangeKey(selectedDateRange.start, selectedDateRange.end);
      if (weeklyInsightsCache[cacheKey]) {
        console.log("[Insights] Loading from cache for key:", cacheKey);
        setInsightsList(weeklyInsightsCache[cacheKey]);
        setIsLoading(false);
        setError(null);
        return;
      }

      console.log("[Insights] No cache, attempting to generate for key:", cacheKey);
      setIsLoading(true);
      setError(null);
      setInsightsList(null); // Clear previous insights before fetching new ones

      try {
        // Format sevenDayData for the AI action
        const sevenDayContextForAI = sevenDayData.map(day => ({
          date: day.date,
          score: day.emotionScore === null ? undefined : day.emotionScore,
          isFuture: day.isFuture,
          description: day.description === null ? undefined : day.description,
          details: day.details === null ? undefined : day.details,
          trend: day.trend === null ? undefined : day.trend,
        }));
        
        // Cast to any first to bypass overly strict initial typing from useAction if necessary
        const result: any = await generateInsightsAction({ userId, sevenDayContextData: sevenDayContextForAI });

        if (!result) {
          setIsLoading(false);
          setError("Failed to execute insights generation action.");
          setInsightsList([]);
          return;
        }

        if (result.success === true) {
          // Now we expect 'insights' to be present
          setInsightsList(result.insights as string[]);
          setWeeklyInsights(cacheKey, result.insights as string[]);
          setError(null);
        } else { 
          // Now we expect 'error' to be present
          setError(result.error as string || "Failed to generate insights.");
          setInsightsList([]);
        }
      } catch (e: any) {
        console.error("Error generating insights:", e);
        setError(e.message || "An unexpected error occurred.");
        setInsightsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrGetCachedInsights();
  }, [userId, sevenDayData, selectedDateRange, weeklyInsightsCache, setWeeklyInsights, generateInsightsAction]); // Added generateInsightsAction to dependency array

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!insightsList || insightsList.length === 0) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        No key insights available for this period.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {insightsList.map((insight, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
          <span>{insight}</span>
        </li>
      ))}
    </ul>
  );
}

