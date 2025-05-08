// FORECAST
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/convex/forecast.ts

import { v } from "convex/values";
import { format } from "date-fns";
// --- Import necessary types ---
import {
  query,
  action,
  internalMutation,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { isSameDay, differenceInCalendarDays, subDays } from 'date-fns';

// Helper function to get ISO date string (YYYY-MM-DD) for a given Date
const getISODateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- Queries (Keep as they are) ---
export const testDatabaseConnection = query({
  args: {},
  handler: async (ctx) => {
    return { success: true, message: "Database connection working!" };
  },
});

// Query to get recent logs (needed by the action)
// You might already have this in logs.ts - if so, adjust the runQuery call below
export const getLogsForUser = query({
  args: {
    userId: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(
      `[Query getLogsForUser] Fetching logs for ${args.userId} up to ${args.endDate}`
    );
    // Fetch logs using the index, order by date descending
    return await ctx.db
      .query("logs")
      .withIndex("byUserDate", (q) =>
        q.eq("userId", args.userId).lte("date", args.endDate)
      )
      .order("desc") // Get most recent first to easily slice later
      .collect();
  },
});

// Query to get logs for a user in a date range (inclusive)
export const getLogsForUserInRange = query({
  args: {
    userId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch logs as before
    const logs = await ctx.db
      .query("logs")
      .withIndex("byUserDate", (q) =>
        q.eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    // Optionally normalize dates here if needed
    return logs.map(log => ({ ...log, date: log.date.split('T')[0] }));
  },
});

// Query to get logs for a user in a date range (inclusive, simple version for frontend existence check)
export const getLogsForUserInRangeSimple = query({
  args: {
    userId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch logs as before, but only return date
    const logs = await ctx.db
      .query("logs")
      .withIndex("byUserDate", (q) =>
        q.eq("userId", args.userId)
          .gte("date", args.startDate)
          .lte("date", args.endDate)
      )
      .collect();
    return logs.map(log => ({ date: log.date }));
  },
});

// Get the 7-day forecast data (UI query - keep as is)
export const getSevenDayForecast = query({
  args: {
    userId: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    today: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, startDate, endDate, today } = args;
    
    // Use the passed-in today, or fallback to server date
    const todayString = today || format(new Date(), 'yyyy-MM-dd');
    const todayLocal = new Date(todayString + 'T00:00:00');
    console.log("[getSevenDayForecast] Today string:", todayString);
    console.log("[getSevenDayForecast] Today local:", todayLocal);
    
    // Always use same structure: 3 days before today, today, 3 days after today
    const rangeStart = addDays(todayLocal, -3); // 3 days before today
    const rangeEnd = todayLocal; // today
    const forecastStart = addDays(todayLocal, 1); // tomorrow
    const forecastEnd = addDays(todayLocal, 3); // 3 days after today
    
    console.log("[getSevenDayForecast] Date ranges:", {
      rangeStart: getISODateString(rangeStart),
      rangeEnd: getISODateString(rangeEnd),
      forecastStart: getISODateString(forecastStart),
      forecastEnd: getISODateString(forecastEnd)
    });

    // Fetch logs for the selected range (3 days before today + today)
    const allPastLogs = await ctx.db
      .query("logs")
      .withIndex("byUserDate", (q) =>
        q.eq("userId", userId)
         .gte("date", getISODateString(rangeStart))
         .lte("date", getISODateString(rangeEnd))
      )
      .order("asc")
      .collect();
    
    console.log("[getSevenDayForecast] Past logs count:", allPastLogs.length);
    console.log("[getSevenDayForecast] Past logs dates:", allPastLogs.map((log: any) => log.date));

    // Fetch existing forecasts for the forecast range (3 days after today)
    const existingForecasts = await ctx.db
      .query("forecast")
      .withIndex("byUserDate", (q) =>
        q.eq("userId", userId)
          .gte("date", getISODateString(forecastStart))
          .lte("date", getISODateString(forecastEnd))
      )
      .collect();
    
    console.log("[getSevenDayForecast] Existing forecasts count:", existingForecasts.length);
    console.log("[getSevenDayForecast] Existing forecast dates:", existingForecasts.map((f: any) => f.date));

    // Format logs
    const formattedPastLogs = allPastLogs.map((log: any) => {
      const logDate = new Date(log.date);
      const isToday = isSameDay(logDate, todayLocal);
      return {
        date: log.date,
        day: getDisplayDay(logDate, todayLocal),
        shortDay: getShortDay(logDate),
        formattedDate: formatMonthDay(logDate),
        emotionScore: log.score ?? null,
        description: getDescriptionFromScore(log.score),
        trend: calculateTrend(log, allPastLogs),
        details: `Entry from ${log.date}`,
        recommendation: generateRecommendation(log),
        isPast: !isToday,
        isToday: isToday,
        isFuture: false,
        canGenerateForecast: allPastLogs.length >= 4,
        _id: log._id,
        answers: log.answers,
      };
    });

    // Prepare forecast days
    const forecastDays = [];
    for (let i = 0; i < 3; i++) {
      const forecastDate = addDays(rangeEnd, i + 1);
      const forecastDateISO = getISODateString(forecastDate);
      const existingForecast = existingForecasts.find(f => f.date === forecastDateISO);
      forecastDays.push(existingForecast ? {
        date: existingForecast.date,
        day: getDisplayDay(forecastDate, todayLocal),
        shortDay: getShortDay(forecastDate),
        formattedDate: formatMonthDay(forecastDate),
        emotionScore: existingForecast.emotionScore,
        description: existingForecast.description,
        trend: existingForecast.trend,
        details: existingForecast.details,
        recommendation: existingForecast.recommendation,
        isPast: false, isToday: false, isFuture: true,
        confidence: existingForecast.confidence,
      } : {
        date: forecastDateISO,
        day: getDisplayDay(forecastDate, todayLocal),
        shortDay: getShortDay(forecastDate),
        formattedDate: formatMonthDay(forecastDate),
        emotionScore: 0,
        description: "Forecast Needed",
        trend: "stable",
        details: "Forecast data will be generated soon.",
        recommendation: "Click 'Generate Forecast' to see prediction.",
        isPast: false, isToday: false, isFuture: true,
        confidence: 0,
      });
    }

    // Combine logs and forecast days
    return [...formattedPastLogs, ...forecastDays];
  }
});


// --- ACTION: Generate forecast for a user ---
export const generateForecast = action({
  args: {
    userId: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, startDate: providedStartDate, endDate: providedEndDate } = args;
    
    // Get today's date if not provided
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // Use provided dates or default to today and 3 days prior
    const endDate = providedEndDate || todayStr;
    const startDate = providedStartDate || format(subDays(new Date(endDate), 3), 'yyyy-MM-dd');
    
    console.log("[generateForecast] Using date range:", { startDate, endDate, today: todayStr });
    
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    
    // Build all dates in the range (inclusive)
    const allDates = [];
    for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      allDates.push(getISODateString(d));
    }
    
    // Fetch all logs for the user in the range using runQuery
    const logs = await ctx.runQuery(internal.forecast.getLogsForUserInRange, {
      userId,
      startDate: getISODateString(rangeStart),
      endDate: getISODateString(rangeEnd),
    });
    
    // Print raw log dates
    console.log("[generateForecast] Fetched logs (raw):", logs.map((log: { date: string }) => log.date));
    
    // Normalize log dates to YYYY-MM-DD
    const logDates = logs.map((log: { date: string }) => log.date.split('T')[0]);
    console.log("[generateForecast] Normalized logDates:", logDates);
    
    // Check if all required dates have logs
    const missingDates = allDates.filter(date => !logDates.includes(date));
    console.log("[generateForecast] Checked dates:", allDates);
    console.log("[generateForecast] Found log dates:", logDates);
    console.log("[generateForecast] Missing log dates:", missingDates);
    
    if (missingDates.length > 0) {
      return { success: false, error: `Missing logs for: ${missingDates.join(", ")}` };
    }
    
    // Use only the logs in the selected range, sorted by date ascending
    const sortedLogs = logs.sort((a: any, b: any) => a.date.localeCompare(b.date));
    
    // Generate target dates (next 3 days after endDate/today)
    const forecastEnd = new Date(endDate);
    const targetDates = Array.from({ length: 3 }, (_, i) => {
      const date = new Date(forecastEnd);
      date.setDate(date.getDate() + i + 1);
      return getISODateString(date);
    });
    
    console.log("[generateForecast] Generating forecasts for target dates:", targetDates);
    
    // Map logs to only include allowed fields for the generator
    const simplifiedLogs = sortedLogs.map((log: any) => ({
      date: log.date,
      score: log.score ?? 0,
      activities: (typeof log.answers === 'object' && log.answers?.activities) ? log.answers.activities : [],
      notes: typeof log.answers === 'string' ? log.answers : JSON.stringify(log.answers ?? {}),
    }));
    
    const forecasts = await ctx.runAction(internal.generator.generateForecastWithAI, {
      userId,
      pastLogs: simplifiedLogs,
      targetDates,
    });
    
    console.log("[generateForecast] Generated forecasts:", forecasts.length);
    
    // Save forecasts
    for (const forecast of forecasts) {
      await ctx.runMutation(internal.forecast.deleteExistingForecast, {
        userId,
        date: forecast.date,
      });
      await ctx.runMutation(internal.forecast.insertForecast, {
        userId,
        date: forecast.date,
        emotionScore: forecast.emotionScore,
        description: forecast.description || "N/A",
        trend: forecast.trend || "stable",
        details: typeof forecast.details === 'string' ? forecast.details : "",
        recommendation: forecast.recommendation || "",
        confidence: forecast.confidence || 0,
        basedOnDays: sortedLogs.map((log: any) => log.date),
      });
    }
    
    console.log("[generateForecast] Successfully saved forecasts for days:", targetDates);
    return { success: true, forecastDates: targetDates };
  }
});


// --- Internal Helper Mutations ---

export const deleteExistingForecast = internalMutation({
   args: { userId: v.string(), date: v.string() },
   handler: async (ctx, args) => {
      const existing = await ctx.db.query("forecast")
         .withIndex("byUserDate", q => q.eq("userId", args.userId).eq("date", args.date))
         .collect();

      let deleteCount = 0;
      for (const forecast of existing) {
         await ctx.db.delete(forecast._id);
         deleteCount++;
      }
      if (deleteCount > 0) {
        console.log(`[Internal Mutation deleteExistingForecast] Deleted ${deleteCount} existing forecast(s) for user ${args.userId}, date ${args.date}`);
      }
   }
});

export const insertForecast = internalMutation({
   args: {
      userId: v.string(),
      date: v.string(),
      emotionScore: v.number(),
      description: v.string(),
      trend: v.string(),
      details: v.string(),
      recommendation: v.string(),
      confidence: v.number(),
      basedOnDays: v.array(v.string()),
   },
   handler: async (ctx, args) => {
      const forecastId = await ctx.db.insert("forecast", {
         ...args,
         createdAt: Date.now(),
      });
      console.log(`[Internal Mutation insertForecast] Inserted forecast ${forecastId} for user ${args.userId}, date ${args.date}`);
      return forecastId; // Return the new ID
   }
});


// --- Helper Functions (Keep as they are) ---
function calculateTrend(currentLog: any, allLogs: any[]) {
  const sortedLogs = [...allLogs].sort((a, b) => a.date.localeCompare(b.date));
  const currentIndex = sortedLogs.findIndex(log => log._id === currentLog._id);
  if (currentIndex <= 0 || !sortedLogs[currentIndex - 1]) return "stable";
  const previousLog = sortedLogs[currentIndex - 1];
  const difference = (currentLog.score ?? 0) - (previousLog.score ?? 0);
  if (difference >= 10) return "up";
  if (difference <= -10) return "down";
  return "stable";
}

function getDescriptionFromScore(score: number | null | undefined) {
  if (score == null) return "No Data"; // Handle null/undefined explicitly
  if (score >= 90) return "Exceptional Day";
  if (score >= 80) return "Excellent Day";
  if (score >= 70) return "Very Good Day";
  if (score >= 60) return "Good Day";
  if (score >= 50) return "Balanced Day";
  if (score >= 40) return "Mild Challenges";
  if (score >= 30) return "Challenging Day";
  if (score >= 20) return "Difficult Day";
  if (score >= 10) return "Very Challenging";
  return "Extremely Difficult";
}

function generateRecommendation(log: any) {
  if (log.score == null) return "Add a score to your log to see recommendations";
  if (log.score >= 80) return "Continue your current activities. Your emotional state is excellent.";
  if (log.score >= 60) return "Your emotional state is good. Consider activities that brought you joy recently.";
  if (log.score >= 40) return "Take some time for self-care today to maintain balance.";
  if (log.score >= 20) return "Prioritize rest and activities that have improved your mood in the past.";
  return "Focus on self-care and consider reaching out to a supportive friend.";
}

function getDisplayDay(date: Date, today: Date) {
  // Compare only the date part (local time)
  if (isSameDay(date, today)) return "Today";
  if (differenceInCalendarDays(date, today) === 1) return "Tomorrow";
  if (differenceInCalendarDays(date, today) === -1) return "Yesterday";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

function getShortDay(date: Date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function formatMonthDay(date: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// --- Forecast Feedback ---
export const submitForecastFeedback = mutation({
  args: {
    userId: v.string(),
    forecastDate: v.string(),
    feedback: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    // Upsert feedback for this user/date
    const existing = await ctx.db
      .query("forecastFeedback")
      .withIndex("byUserDate", q =>
        q.eq("userId", args.userId).eq("forecastDate", args.forecastDate)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        feedback: args.feedback,
        updatedAt: Date.now(),
      });
      return { updated: true };
    } else {
      await ctx.db.insert("forecastFeedback", {
        userId: args.userId,
        forecastDate: args.forecastDate,
        feedback: args.feedback,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { created: true };
    }
  },
});

export const getForecastFeedback = query({
  args: {
    userId: v.string(),
    forecastDates: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch all feedback for this user and the given dates
    const feedbacks = await ctx.db
      .query("forecastFeedback")
      .withIndex("byUserDate", q => q.eq("userId", args.userId))
      .collect();
    // Filter for only the requested dates
    const filtered = feedbacks.filter(fb => args.forecastDates.includes(fb.forecastDate));
    // Return as a map: { [date]: feedback }
    const feedbackMap: Record<string, "up" | "down"> = {};
    for (const fb of filtered) {
      feedbackMap[fb.forecastDate] = fb.feedback;
    }
    return feedbackMap;
  },
});