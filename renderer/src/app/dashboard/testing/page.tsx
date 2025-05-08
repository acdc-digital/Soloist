// TESTING ENVIRONMENT FOR FORECAST FUNCTIONALITY
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/testing/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { Info, ChevronLeft, ChevronRight, ArrowRight, TrendingUp, TrendingDown, Sparkles, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { api as dailyApi } from "../../../../convex/_generated/api"; // alias for dailyLogs
import { useUserContext } from "@/provider/userContext";
import WeeklyPatterns from "./_components/WeeklyPatterns";
import Navigation from "./_components/Navigation";
import { getColorClass } from "@/lib/scoreColors";
import { useTestingStore } from "../../../store/Testingstore";
import { format } from 'date-fns';
import { api as testingApi } from "../../../../convex/_generated/api";

// Types for forecast data
interface ForecastDay {
  date: string;
  day: string;  // Make required to match WeeklyPatterns component
  shortDay?: string;
  formattedDate?: string;
  emotionScore: number | null;
  isFuture: boolean;
  isPast?: boolean;
  isToday?: boolean;
  description?: string;
  details?: string;
  recommendation?: string;
  trend?: string | null;
  confidence?: number;
}

// Helper component for Loading State
const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex-1 h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
    <Loader2 className="h-8 w-8 animate-spin text-zinc-500 dark:text-zinc-400 mb-4" />
    <div className="text-zinc-600 dark:text-zinc-400">{message}</div>
  </div>
);

// Helper component for Empty/Error State
const EmptyState = ({ title, description, onGenerate, isGenerating, error }: {
  title: string;
  description: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
  error?: string | null;
}) => (
  <div className="flex-1 h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-center px-4">
    <div className="text-zinc-600 dark:text-zinc-400 mb-4">{title}</div>
    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{description}</p>
    {onGenerate && (
      <Button
        variant="outline"
        size="sm"
        onClick={onGenerate}
        disabled={isGenerating}
        className="h-8 text-xs"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Run Test
          </>
        )}
      </Button>
    )}
    {error && (
      <div className="mt-4 p-2 w-full max-w-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-md">
        Test Error: {error}
      </div>
    )}
  </div>
);

// Helper functions
function getBorderColorClass(score: number | null | undefined): string {
  if (score == null) return "border-zinc-700/50";
  if (score >= 90) return "border-indigo-500";
  if (score >= 80) return "border-blue-500";
  if (score >= 70) return "border-sky-500";
  if (score >= 60) return "border-teal-500";
  if (score >= 50) return "border-green-500";
  if (score >= 40) return "border-lime-500";
  if (score >= 30) return "border-yellow-500";
  if (score >= 20) return "border-amber-600";
  if (score >= 10) return "border-orange-600";
  return "border-rose-700";
}

function getTextColorClass(score: number | null | undefined): string {
  if (score == null) return "text-zinc-400";
  if (score >= 60) return "text-zinc-900"; // Dark text for lighter backgrounds
  return "text-zinc-100"; // Light text for darker backgrounds
}

const TrendIcon = ({ trend }: { trend?: string | null }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-rose-500" />;
  return <Sparkles className="h-4 w-4 text-blue-400 opacity-70" />;
};

const mockInsights = [
  "Your emotional state tends to peak midweek (Wednesday) and on weekends",
  "Thursday consistently shows lower emotional scores - consider additional self-care",
  "Evening periods generally show higher wellbeing than mornings",
  "Your recovery pattern is strong, with quick rebounds after challenging days"
];

// Helper to get the key for a date range
function getRangeKey(start: Date | null, end: Date | null) {
  if (!start || !end) return "";
  return `${formatDateString(start)}_to_${formatDateString(end)}`;
}

// Helper to format date as YYYY-MM-DD
function formatDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Helper to parse ISO date string with timezone consistency
function parseISODate(dateString: string): Date {
  // Force noon UTC to avoid timezone shifting problems
  return new Date(`${dateString}T12:00:00Z`);
}

// Helper to get day name (Monday, Tuesday, etc.)
function getDayName(date: Date): string {
  return format(date, 'EEEE');
}

// Helper to get short day name (Mon, Tue, etc.)
function getShortDayName(date: Date): string {
  return format(date, 'EEE');
}

// Helper to get formatted date (Apr 10)
function getFormattedMonthDay(date: Date): string {
  return format(date, 'MMM d');
}

export default function TestingPage() {
  // Single source‑of‑truth user (from Zustand context)
  const { user, isLoading: userLoading, userId: contextUserId } = useUserContext();
  const userIdRaw = contextUserId || user?.id || null;
  const userId = userIdRaw ? userIdRaw.split("|")[0] : null;
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(3);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<{ [date: string]: "up" | "down" | undefined }>({});
  
  // Use the testing store
  const { 
    selectedDateRange, 
    setSelectedDateRange,
    isGeneratingForecast, 
    setIsGeneratingForecast,
    setForecastGenerated 
  } = useTestingStore();

  // Set default date range to current week (last 4 days including today) on first load
  useEffect(() => {
    // Only set default if not already set
    if (!selectedDateRange.start || !selectedDateRange.end) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 3);
      setSelectedDateRange({ start, end: today });
    }
  }, [setSelectedDateRange]);

  // When the date range changes, update forecastGenerated flag
  useEffect(() => {
    const key = getRangeKey(selectedDateRange.start, selectedDateRange.end);
    if (key) {
      const map = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
      setForecastGenerated(!!map[key]);
    } else {
      setForecastGenerated(false);
    }
    
    // Clear any previous errors when date range changes
    setForecastError(null);
  }, [selectedDateRange.start, selectedDateRange.end, setForecastGenerated]);

  // Debug logs
  console.log("userId", userId);
  console.log("selectedDateRange", selectedDateRange);

  // Fetch raw forecast data and log it for debugging
  const forecastDataFromAPI = useQuery(
    testingApi.testing.getTestSevenDayForecast,
    userId && selectedDateRange.start && selectedDateRange.end
      ? {
          userId: userId as string,
          startDate: formatDateString(selectedDateRange.start),
          endDate: formatDateString(selectedDateRange.end),
        }
      : "skip"
  );

  // Log query params and raw API response for debugging
  useEffect(() => {
    if (userId && selectedDateRange.start && selectedDateRange.end) {
      console.log("Query params:", {
        userId,
        startDate: formatDateString(selectedDateRange.start),
        endDate: formatDateString(selectedDateRange.end),
        startDateObj: selectedDateRange.start,
        endDateObj: selectedDateRange.end,
      });
    }
    
    if (forecastDataFromAPI) {
      console.log("RAW forecastDataFromAPI:", JSON.stringify(forecastDataFromAPI, null, 2));
      
      // Parse and log date details if data is an array
      if (Array.isArray(forecastDataFromAPI)) {
        const dateDetails = forecastDataFromAPI.map(day => ({
          date: day.date,
          parsedDate: parseISODate(day.date).toLocaleDateString(),
          dayOfWeek: parseISODate(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
          emotionScore: day.emotionScore,
          isPast: day.isPast,
          isFuture: day.isFuture,
        }));
        console.log("Parsed forecast dates:", dateDetails);
      }
    }
  }, [forecastDataFromAPI, userId, selectedDateRange]);

  // Fetch historical logs for the selected date range
  const historicalLogs = useQuery(
    dailyApi.dailyLogs.getLogsByDateRange,
    userId && selectedDateRange.start && selectedDateRange.end
      ? {
          userId,
          startDate: formatDateString(selectedDateRange.start),
          endDate: formatDateString(selectedDateRange.end),
        }
      : "skip"
  ) as { date: string; emotionScore: number; description?: string; details?: string }[] | undefined;

  const forecastData = useMemo(() => {
    if (!forecastDataFromAPI || !Array.isArray(forecastDataFromAPI)) return [];
    return forecastDataFromAPI.map((day, idx) => {
      const dateObj = parseISODate(day.date);
      return {
        ...day,
        day: getDayName(dateObj),
        shortDay: getShortDayName(dateObj),
        formattedDate: getFormattedMonthDay(dateObj),
      };
    });
  }, [forecastDataFromAPI]);

  // Generate test forecast mutation
  const generateForecast = useAction(api.forecast.generateForecast);

  const handleGenerateForecast = async () => {
    if (!userId || !selectedDateRange.start || !selectedDateRange.end) {
      setForecastError("Please select a valid date range and ensure you're logged in");
      return;
    }

    setIsGeneratingForecast(true);
    setForecastError(null);
    // Clear stale synthetic data / cache
    const key = getRangeKey(selectedDateRange.start, selectedDateRange.end);
    const map = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
    delete map[key];
    localStorage.setItem('forecastGeneratedMap', JSON.stringify(map));
    localStorage.removeItem(`forecast_attempt_${key}`);

    // Format dates for API
    const startDateStr = formatDateString(selectedDateRange.start);
    const endDateStr = formatDateString(selectedDateRange.end);
    
    try {
      // Generate forecast with standard parameters
      console.log(`Generating forecast for range: ${startDateStr} to ${endDateStr}`);
      
      // First, attempt to force refresh by clearing localStorage cache for this range
      // (Already cleared above)
      
      // If we've tried before and got a missing logs error, we'll generate mock data
      let attemptCount = parseInt(localStorage.getItem(`forecast_attempt_${key}`) || '0');
      attemptCount++;
      localStorage.setItem(`forecast_attempt_${key}`, attemptCount.toString());
      
      // First try normal generation
      const result = await generateForecast({
        userId: userId as string,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      
      if (!result.success) {
        console.error("Forecast generation failed:", result.error);
        
        // If we have missing logs error and tried multiple times, let's create synthetic data
        if (result.error && result.error.includes("Missing logs") && attemptCount >= 2) {
          console.log("Creating synthetic forecast data after multiple attempts");
          
          // Create complete synthetic forecast data
          const today = new Date(selectedDateRange.start);
          const syntheticData = [];
          
          // Generate 7 days of data starting from selected start date
          for (let i = 0; i < 7; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const isFuture = i >= 4;
            
            syntheticData.push({
              date: formatDateString(currentDate),
              day: getDayName(currentDate),
              shortDay: getShortDayName(currentDate),
              formattedDate: getFormattedMonthDay(currentDate),
              emotionScore: isFuture ? 50 : null,
              isFuture: isFuture,
              isPast: !isFuture,
              isToday: i === 0,
              description: isFuture ? "Forecasted Day" : "Historical Data",
              details: isFuture ? 
                "Test forecast with synthetic data" : 
                "Historical emotion data (synthetic)",
              trend: Math.random() > 0.5 ? "up" : "down",
              confidence: isFuture ? 75 : undefined
            });
          }
          
          // Use the synthetic data instead of API data
          console.log("Using synthetic data:", syntheticData);
          
          // Update state and local storage
          setForecastGenerated(true);
          const localStorageMap = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
          localStorage.setItem('forecastGeneratedMap', JSON.stringify({...localStorageMap, [key]: true}));
          
          // Set a special flag for synthetic data
          localStorage.setItem(`synthetic_data_${key}`, JSON.stringify(syntheticData));
          
          setForecastError(null);
          setIsGeneratingForecast(false);
          return;
        }
        
        setForecastError(result.error || "Failed to generate forecast");
        
        // If the error mentions missing logs, let's update the error message
        if (result.error && result.error.includes("Missing logs")) {
          setForecastError(
            "It looks like logs exist but aren't being recognized. Please try regenerating the forecast."
          );
        }
      } else {
        console.log("Forecast generated successfully");
        setForecastGenerated(true);
        // Persist this range as generated
        const key = getRangeKey(selectedDateRange.start, selectedDateRange.end);
        const map = JSON.parse(localStorage.getItem('forecastGeneratedMap') || '{}');
        map[key] = true;
        localStorage.setItem('forecastGeneratedMap', JSON.stringify(map));
      }
    } catch (error) {
      console.error("Error generating forecast:", error);
      setForecastError(error instanceof Error ? error.message : "Failed to generate forecast");
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  // Replace the displayData function to use dates directly from API without manipulation
  const displayData = useMemo(() => {
    if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) {
      return [];
    }
    
    // Simply use the data directly from the API, which has the correct dates
    console.log("Using direct API data:", forecastData.map(d => d.date)); 
    return forecastData;
  }, [forecastData]);

  // Ensure date formatting is preserved
  const formattedDisplayData = useMemo(() => {
    if (!Array.isArray(displayData)) return [];
    
    return displayData.map(day => {
      // Parse the date directly from the API date string
      // Fix: using helper function for consistent date parsing
      const dateObj = parseISODate(day.date);
      
      return {
        ...day,
        // Ensure day and date attributes are present
        day: day.day || getDayName(dateObj),
        shortDay: day.shortDay || getShortDayName(dateObj),
        formattedDate: day.formattedDate || getFormattedMonthDay(dateObj)
      };
    });
  }, [displayData]);

  // Calculate average score safely
  const averageScore = useMemo(() => {
    if (!displayData || !Array.isArray(displayData)) return null;
    const scores = displayData
      .filter((day) => day.emotionScore !== null)
      .map((day) => day.emotionScore as number);
    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  }, [displayData]);

  // Effect to set default selected day
  useEffect(() => {
    if (Array.isArray(displayData) && displayData.length > 0) {
      const todayIndex = displayData.findIndex(day => day.isToday);
      const defaultIndex = todayIndex !== -1 ? todayIndex : Math.min(3, displayData.length - 1);
      setSelectedDayIndex(defaultIndex);
    }
    // Only run when forecastData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayData]);

  // Navigation handlers
  const navigatePrevDay = () => setSelectedDayIndex(prev => Math.max(0, prev - 1));
  const navigateNextDay = () => {
    const maxIndex = Array.isArray(displayData) ? displayData.length - 1 : 0;
    setSelectedDayIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Fetch feedback for the forecast dates
  const feedbackMap = useQuery(
    api.forecast.getForecastFeedback,
    userId && displayData && Array.isArray(displayData)
      ? {
          userId: userId!, // non-null assertion since we guard for userId elsewhere
          forecastDates: displayData
            .filter((day) => day.isFuture)
            .map((day) => day.date),
        }
      : "skip"
  );

  // Update feedback state when feedback map changes
  useEffect(() => {
    if (feedbackMap) {
      setFeedbackState(feedbackMap);
    }
  }, [feedbackMap]);

  // Submit feedback handler
  const submitFeedback = useMutation(api.forecast.submitForecastFeedback);
  const handleFeedback = (date: string, feedback: "up" | "down") => {
    if (!userId) {
      setForecastError("Please ensure you're logged in to submit feedback");
      return;
    }
    submitFeedback({ userId: userId!, forecastDate: date, feedback });
    setFeedbackState((prev) => ({ ...prev, [date]: feedback }));
  };

  // Check if we need forecasts (only if data is an array)
  const needsForecasts = Array.isArray(displayData) && displayData.some(day => 
    day.isFuture &&
    (day.emotionScore === 0 || 
     day.emotionScore === null || 
     day.emotionScore === undefined ||
     day.description === "Forecast Needed" ||
     day.description === "Forecast needed" ||
     !day.description)
  );

  // Loading guard for user
  if (userLoading || !userId) {
    return <LoadingState message="Loading user…" />;
  }

  // Wait for forecast data
  if (forecastData === undefined) {
    return <LoadingState message="Loading forecast data..." />;
  }

  // Handle empty data case - but don't block on authentication
  if (forecastData === null) {
    return <EmptyState
            title="Test Forecast Not Available"
            description="Error retrieving test forecast data."
            onGenerate={() => handleGenerateForecast()}
            isGenerating={isGeneratingForecast}
            error={forecastError} />;
  }

  if (Array.isArray(forecastData) && forecastData.length === 0) {
    return <EmptyState
            title="No Test Forecast Data Available"
            description="You need to generate a test forecast."
            onGenerate={() => handleGenerateForecast()}
            isGenerating={isGeneratingForecast}
            error={forecastError} />;
  }

  // --- Main Render - Only proceeds if userId exists and forecastData is a non-empty array ---
  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-4 px-4 flex flex-col h-full max-w-5xl">
          <div className="flex flex-col gap-4 pb-4">
            <Navigation
              onGenerateForecast={handleGenerateForecast}
            />
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">7-Day Test Forecast</CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    {selectedDateRange.start && selectedDateRange.end ? (
                      `Testing forecast for ${selectedDateRange.start.toLocaleDateString()} - ${selectedDateRange.end.toLocaleDateString()}`
                    ) : (
                      "Select a date range to test forecast accuracy"
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                    Test Mode
                  </Badge>
                  <Badge variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                    Avg: {averageScore !== null ? averageScore.toFixed(1) : "N/A"}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Testing environment for forecast functionality</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Display any forecast generation errors */}
              {forecastError && (
                <div className="mb-3 p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm rounded-md">
                  {forecastError === "Not enough data for forecast"
                    ? "You need to have daily logs for all 4 days in the selected range to generate a forecast. Please add logs for the missing days."
                    : forecastError.includes("Missing logs")
                    ? <>
                        <p className="font-medium mb-1">Missing Logs Error</p>
                        <p>{forecastError}</p>
                        <p className="mt-2">Try these steps:</p>
                        <ol className="list-decimal list-inside mt-1 ml-1 space-y-0.5">
                          <li>Click &quot;Generate Forecast&quot; again</li>
                          <li>Try selecting a different date range</li>
                          <li>Check that logs exist for the selected dates</li>
                        </ol>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            onClick={() => window.location.reload()} 
                            variant="outline" 
                            size="sm" 
                            className="h-7"
                          >
                            Refresh Page
                          </Button>
                        </div>
                      </>
                    : `Error: ${forecastError}`}
                </div>
              )}
              
              {/* 7-Day Forecast Strip */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1 mb-2">
                {[...Array(7)].map((_, idx) => {
                  const day = formattedDisplayData[idx];
                  if (!day) {
                    // Render placeholder for missing day
                    return (
                      <div key={idx} className="flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-md border aspect-square bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 opacity-60">
                        <div className="text-xs font-medium text-center text-zinc-400">—</div>
                        <span className="text-lg sm:text-2xl font-bold text-zinc-400">?</span>
                      </div>
                    );
                  }
                  const score = day.emotionScore;
                  const colorClass = getColorClass(score);
                  const borderColorClass = getBorderColorClass(score);
                  const textColorClass = getTextColorClass(score);
                  const isFutureDay = day.isFuture;
                  const needsGen = isFutureDay && 
                    ((score === null || score === 0 || score === undefined) || 
                    (day.description === "Forecast Needed" || day.description === "Forecast needed"));
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <div
                      key={day.date || idx}
                      title={`Date: ${day.date}, Score: ${score ?? 'N/A'}`}
                      className={`
                        flex flex-col items-center justify-between p-1 sm:p-1.5 rounded-md cursor-pointer border aspect-square
                        ${colorClass} ${borderColorClass}
                        ${isSelected ? 'ring-2 ring-offset-1 ring-offset-zinc-900 dark:ring-offset-black ring-indigo-400' : ''}
                        ${day.isPast ? 'opacity-80 hover:opacity-100' : ''}
                        ${day.isToday ? 'relative ring-1 ring-inset ring-white/50' : ''}
                        ${isFutureDay && !needsGen ? 'opacity-85 hover:opacity-100' : ''}
                        ${needsGen ? 'border-dashed border-zinc-500 bg-zinc-800/30 hover:bg-zinc-700/40' : ''}
                        transition-all duration-150 ease-in-out
                      `}
                      onClick={() => setSelectedDayIndex(idx)}
                    >
                      <div className="text-xs font-medium text-center">
                        <div className={`${needsGen ? 'text-zinc-400' : textColorClass} text-[10px] sm:text-xs font-semibold`}>
                          {day.shortDay || format(parseISODate(day.date), 'EEE')}
                        </div>
                        <div className={`text-[10px] ${needsGen ? 'text-zinc-500' : textColorClass} opacity-80 hidden sm:block`}>
                          {day.formattedDate || format(parseISODate(day.date), 'MMM d')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-auto">
                        {isFutureDay && !needsGen ? (
                          <span className={`text-lg sm:text-2xl font-bold px-2 py-1 rounded-full ${colorClass} ${textColorClass}`} style={{ minWidth: 32, display: 'inline-block', textAlign: 'center' }}>
                            {score !== null && score !== undefined ? score : '?'}
                          </span>
                        ) : (
                          <span className={`text-lg sm:text-2xl font-bold ${needsGen ? 'text-zinc-400' : textColorClass}`}>
                            {score !== null && score !== undefined && score > 0 ? score : (needsGen ? '?' : '—')}
                          </span>
                        )}
                        {score !== null && score > 0 && !needsGen && day.trend &&
                          <TrendIcon trend={day.trend} />
                        }
                      </div>
                      {day.isToday && <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white/80"></div>}
                    </div>
                  );
                })}
              </div>
              {/* Minimal, subtle message if all 7 are placeholders */}
              {formattedDisplayData.filter(Boolean).length === 0 && (
                <div className="text-center text-xs text-zinc-400 mt-2">Submit a log to start your forecast.</div>
              )}

              {/* Feedback Row for Forecasted Days */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {formattedDisplayData.length < 7 ? (
                  <div className="col-span-7"></div>
                ) : (
                  formattedDisplayData.map((day, idx) => {
                    const isFutureDay = day.isFuture;
                    const feedback = feedbackState[day.date];
                    return (
                      <div key={day.date || idx} className="flex justify-center items-center min-h-[32px]">
                        {isFutureDay && (
                          <div className="flex gap-2">
                            <button
                              className="p-1"
                              onClick={() => handleFeedback(day.date, "up")}
                              aria-label="Forecast was correct"
                              type="button"
                            >
                              <ThumbsUp
                                className={`h-5 w-5 transition-colors ${feedback === "up" ? "text-green-600" : "text-zinc-400"}`}
                              />
                            </button>
                            <button
                              className="p-1"
                              onClick={() => handleFeedback(day.date, "down")}
                              aria-label="Forecast was incorrect"
                              type="button"
                            >
                              <ThumbsDown
                                className={`h-5 w-5 transition-colors ${feedback === "down" ? "text-red-600" : "text-zinc-400"}`}
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Separator, Navigation, and Details only if selected day is valid */}
              {selectedDayIndex >= 0 && selectedDayIndex < formattedDisplayData.length && formattedDisplayData[selectedDayIndex] && (
                <>
                  <Separator className="my-3 bg-zinc-200 dark:bg-zinc-800" />

                  {/* Selected Day Navigation */}
                  <div className="flex items-center justify-between mb-2">
                    <Button variant="ghost" size="sm" disabled={selectedDayIndex === 0} onClick={navigatePrevDay} className="h-8 px-2 text-zinc-600 dark:text-zinc-300">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <h3 className="text-base font-medium text-center text-zinc-900 dark:text-zinc-50">
                      {formattedDisplayData[selectedDayIndex]?.day || getDayName(parseISODate(formattedDisplayData[selectedDayIndex]?.date || ''))} - {formattedDisplayData[selectedDayIndex]?.formattedDate || getFormattedMonthDay(parseISODate(formattedDisplayData[selectedDayIndex]?.date || ''))}
                    </h3>
                    <Button variant="ghost" size="sm" disabled={selectedDayIndex >= formattedDisplayData.length - 1} onClick={navigateNextDay} className="h-8 px-2 text-zinc-600 dark:text-zinc-300">
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {/* Selected Day Details */}
                  {(() => { // Immediately invoked function expression for easier variable access
                    const selectedDay = formattedDisplayData[selectedDayIndex];
                    if (!selectedDay) return null; // Should not happen due to outer check, but safe

                    const score = selectedDay.emotionScore;
                    const isFutureDay = selectedDay.isFuture;
                    const needsGen = isFutureDay && (score === 0 || score === null || selectedDay.description === "Forecast Needed");

                    return (
                      <div className="flex flex-col sm:flex-row gap-4 p-3 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/30 dark:bg-zinc-900/30">
                        {/* Score Box */}
                        <div className={`
                          flex-shrink-0 w-full sm:w-28 h-28 rounded-md flex flex-col items-center justify-center border
                          ${getColorClass(score)}
                          ${getBorderColorClass(score)}
                          ${needsGen ? 'border-dashed border-zinc-500' : ''}
                         `}>
                          <span className={`text-4xl font-bold ${needsGen ? 'text-zinc-400' : getTextColorClass(score)}`}>
                            {score !== null ? (needsGen ? '?' : score) : '—'}
                          </span>
                          <div className="flex items-center mt-1">
                             {/* Only show trend icon if score exists, it's not needing generation, and trend is present */}
                            {score !== null && score > 0 && !needsGen && selectedDay.trend && (
                               <>
                                <TrendIcon trend={selectedDay.trend} />
                                <span className={`text-xs ml-1 ${needsGen ? 'text-zinc-400' : getTextColorClass(score)} opacity-90`}>
                                  {selectedDay.trend === "up" ? "Rising" : selectedDay.trend === "down" ? "Falling" : "Stable"}
                                </span>
                               </>
                            )}
                             {/* Placeholder if no trend */}
                             {!(score !== null && score > 0 && !needsGen && selectedDay.trend) && !needsGen && (
                                <span className={`text-xs ml-1 ${getTextColorClass(score)} opacity-70`}>-</span>
                             )}
                             {needsGen && (
                                <span className={`text-xs ml-1 text-zinc-400 opacity-70`}>Forecast</span>
                             )}
                          </div>
                        </div>
                        {/* Text Details */}
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                            {selectedDay.description || "No description"}
                          </h3>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-3 min-h-[3em]">
                            {selectedDay.details || (needsGen ? "Generate forecast for details." : "No details available.")}
                            {needsGen && (
                              <div className="mt-1 text-blue-500 dark:text-blue-400">
                                Click &quot;{needsForecasts ? "Generate Forecast" : "Update Forecast"}&quot; above to create predictions.
                              </div>
                            )}
                          </div>
                          {/* Recommendation */}
                          {(selectedDay.recommendation && selectedDay.recommendation !== "Check back later for recommendations") && (
                            <div className="bg-zinc-100 dark:bg-zinc-800/70 p-2 rounded-md">
                              <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1 flex items-center">
                                <Sparkles className="h-4 w-4 mr-1.5 text-blue-500" />
                                Recommendation:
                              </h4>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {selectedDay.recommendation}
                              </p>
                            </div>
                          )}
                          {/* Confidence */}
                          {isFutureDay && 'confidence' in selectedDay && selectedDay.confidence != null && selectedDay.confidence > 0 && (
                            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                              <Info className="h-3 w-3 mr-1 inline-block" />
                              Forecast confidence: {selectedDay.confidence}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()} {/* End IIFE */}
                </>
              )} {/* End conditional render for details */}

            </CardContent>
          </Card>

          {/* Weekly Pattern and Key Insights Cards (Using Mock Data for now) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-zinc-900 dark:text-zinc-50">Weekly Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(formattedDisplayData) && formattedDisplayData.length > 0 ? (
                  <WeeklyPatterns data={formattedDisplayData} />
                ) : (
                  <div className="text-center text-zinc-500 py-10">No data available</div>
                )}
              </CardContent>
            </Card>
            <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-zinc-900 dark:text-zinc-50">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

        </div> {/* End container */}
      </div> {/* End scrollable area */}
    </div> // End main wrapper
  );
}