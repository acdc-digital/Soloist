<<<<<<< HEAD
// convex/forecast.ts
=======
// FORECAST
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/convex/forecast.ts
>>>>>>> 56bd30b (Updated Authentication Flow)

import { v } from "convex/values";
// --- Import necessary types ---
import {
  query,
  action,
  internalMutation, // Use internalMutation for helpers called by actions
  internalAction, // Although generator is separate, good practice if only called internally
} from "./_generated/server";
import { internal, api } from "./_generated/api"; // Need full api and internal

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

// --- Constants ---
const FORECAST_DAYS = 3; // Number of days to forecast
const MIN_LOGS_FOR_FORECAST = 4; // Minimum number of logs needed

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

// Get the 7-day forecast data (UI query - keep as is)
export const getSevenDayForecast = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("[Query getSevenDayForecast] called for userId:", args.userId);
    const today = new Date();
    const todayISO = getISODateString(today);

    // --- Fetch Logs ---
    // Use the dedicated query - keeps logic consistent
    const allPastLogs = await ctx.db // Okay to use ctx.db in query
      .query("logs")
      .withIndex("byUserDate", (q) =>
        q.eq("userId", args.userId).lte("date", todayISO)
      )
      .order("desc")
      .collect();
    console.log("[Query getSevenDayForecast] Past logs found:", allPastLogs.length);


    // --- Fetch Existing Forecasts ---
    const existingForecasts = await ctx.db // Okay to use ctx.db in query
      .query("forecast")
      .withIndex("byUserDate", (q) =>
        q
          .eq("userId", args.userId)
          .gte("date", getISODateString(addDays(today, 1)))
          .lte("date", getISODateString(addDays(today, FORECAST_DAYS)))
      )
      .collect();
    console.log("[Query getSevenDayForecast] Existing forecasts found:", existingForecasts.length);


    // --- Format Logs ---
    const formattedPastLogs = allPastLogs.map((log) => {
      const logDate = new Date(log.date); // Consider timezone if critical
      return {
        date: log.date,
        day: getDisplayDay(logDate, today),
        shortDay: getShortDay(logDate),
        formattedDate: formatMonthDay(logDate),
        emotionScore: log.score ?? null, // Use ?? for null/undefined score
        description: getDescriptionFromScore(log.score),
        trend: calculateTrend(log, allPastLogs), // Pass all logs for trend calculation
        details: log.details || `Entry from ${log.date}`, // Example detail fallback
        recommendation: generateRecommendation(log),
        isPast: log.date !== todayISO,
        isToday: log.date === todayISO,
        isFuture: false,
        // Add other necessary fields returned by the log query
        _id: log._id, // Pass ID if needed
        answers: log.answers, // Pass answers if needed
      };
    });

    // --- Prepare Forecast Days ---
    const forecastDays: any[] = []; // Use a more specific type if possible
    const hasEnoughData = allPastLogs.length >= MIN_LOGS_FOR_FORECAST;

    for (let i = 1; i <= FORECAST_DAYS; i++) {
      const forecastDate = addDays(today, i);
      const forecastDateISO = getISODateString(forecastDate);
      const existingForecast = existingForecasts.find(f => f.date === forecastDateISO);

      if (existingForecast) {
        forecastDays.push({
          date: existingForecast.date,
          day: getDisplayDay(forecastDate, today),
          shortDay: getShortDay(forecastDate),
          formattedDate: formatMonthDay(forecastDate),
          emotionScore: existingForecast.emotionScore,
          description: existingForecast.description,
          trend: existingForecast.trend,
          details: existingForecast.details,
          recommendation: existingForecast.recommendation,
          isPast: false, isToday: false, isFuture: true,
          confidence: existingForecast.confidence,
        });
      } else if (hasEnoughData) {
        // Need forecast placeholder
        forecastDays.push({
          date: forecastDateISO,
          day: getDisplayDay(forecastDate, today),
          shortDay: getShortDay(forecastDate),
          formattedDate: formatMonthDay(forecastDate),
          emotionScore: 0, // Or null, depending on how 'needs forecast' is displayed
          description: "Forecast Needed",
          trend: "stable",
          details: "Forecast data will be generated soon.",
          recommendation: "Click 'Generate Forecast' to see prediction.",
          isPast: false, isToday: false, isFuture: true,
          confidence: 0,
        });
      } else {
        // Not enough data placeholder
        forecastDays.push({
          date: forecastDateISO,
          day: getDisplayDay(forecastDate, today),
          shortDay: getShortDay(forecastDate),
          formattedDate: formatMonthDay(forecastDate),
          emotionScore: null,
          description: "Need More Data",
          trend: "stable",
          details: `Complete at least ${MIN_LOGS_FOR_FORECAST} daily logs to see your forecast.`,
          recommendation: "Continue logging your daily experiences.",
          isPast: false, isToday: false, isFuture: true,
          confidence: 0,
        });
      }
    }

    // --- Combine and Finalize Days ---
    // Take relevant past days (e.g., last 3 + today = 4)
    const relevantPastDays = formattedPastLogs
      .sort((a, b) => a.date.localeCompare(b.date)) // Sort oldest to newest
      .slice(-4); // Get the last 4 entries (adjust if needed)

    // Combine with forecast days
    let allDays = [...relevantPastDays, ...forecastDays];

    // Ensure exactly 7 days if necessary, adding missing past placeholders
    const expectedDays = 7;
    if (allDays.length < expectedDays) {
      const missingPastCount = expectedDays - allDays.length;
      const firstDateInList = new Date(allDays[0]?.date || todayISO); // Use earliest date or today
      for (let i = 1; i <= missingPastCount; i++) {
        const missingDate = addDays(firstDateInList, -i); // Go back from earliest known date
        allDays.unshift({
          date: getISODateString(missingDate),
          day: getDisplayDay(missingDate, today),
          shortDay: getShortDay(missingDate),
          formattedDate: formatMonthDay(missingDate),
          emotionScore: null, description: "No Data", trend: "stable",
          details: "No log entry found for this day.",
          recommendation: "Add a log entry to see insights.",
          isPast: true, isToday: false, isFuture: false,
        });
      }
    }

    // Ensure the final array has exactly 7 days, taking the most recent
    const finalDays = allDays.slice(-expectedDays);

    console.log("[Query getSevenDayForecast] Final days to return:", finalDays.length);
    // console.log("[Query getSevenDayForecast] Sample day data:", finalDays[0]);

    return finalDays;
  }
});


// --- ACTION: Generate forecast for a user ---
export const generateForecast = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log("[Action generateForecast] called for userId:", args.userId);

    if (!args.userId || args.userId.trim() === "") {
       console.error("[Action generateForecast] Error: Received empty or invalid userId.");
       return { success: false, error: "Backend Error: User ID was missing or empty." };
    }

    const today = new Date();
    const todayISO = getISODateString(today);

    // 1. Fetch past logs using runQuery
    const pastLogs = await ctx.runQuery(api.forecast.getLogsForUser, { // Using the query in *this* file
       userId: args.userId,
       endDate: todayISO,
    });

    // Sort and limit in JavaScript (already sorted desc by query, just slice)
    const recentPastLogs = pastLogs.slice(0, 14); // Get up to 14 days for prediction model

    console.log(`[Action generateForecast] Found ${recentPastLogs.length} past logs for user ${args.userId}`);

    if (recentPastLogs.length < MIN_LOGS_FOR_FORECAST) {
      const errorMsg = `Not enough past data (${recentPastLogs.length}/${MIN_LOGS_FOR_FORECAST}) for forecast`;
      console.log(`[Action generateForecast] ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    // Prepare data for the generator action
    const simplifiedLogs = recentPastLogs.map(log => ({
      date: log.date,
      score: log.score ?? 0,
      // Ensure answers parsing is robust
      activities: (typeof log.answers === 'object' && log.answers?.activities) ? log.answers.activities : [],
      notes: typeof log.answers === 'string' ? log.answers : JSON.stringify(log.answers ?? {}) // Handle null answers
    }));

    // Generate target dates
    const targetDates = Array.from({ length: FORECAST_DAYS }, (_, i) => getISODateString(addDays(today, i + 1)));

    console.log("[Action generateForecast] Target dates for forecast:", targetDates);

    try {
      // 2. Call the generator action using ctx.runAction
      console.log(`[Action generateForecast] Calling generator.generateForecastWithAI for user ${args.userId}`);
      // Using internal.generator... assumes generateForecastWithAI is internalAction
      const forecasts = await ctx.runAction(internal.generator.generateForecastWithAI, {
        userId: args.userId,
        pastLogs: simplifiedLogs,
        targetDates
      });

      if (!Array.isArray(forecasts)) {
         console.error("[Action generateForecast] Generator did not return an array:", forecasts);
         throw new Error("Forecast generation returned invalid data.");
      }
      console.log(`[Action generateForecast] Received ${forecasts.length} forecasts from generator for user ${args.userId}`);


      // 3. Save forecasts to database using runMutation
      const savedForecasts = [];
      for (const forecast of forecasts) {
        // Basic validation
        if (!forecast || typeof forecast.date !== 'string' || typeof forecast.emotionScore !== 'number') {
           console.warn("[Action generateForecast] Skipping invalid forecast object from generator:", forecast);
           continue;
        }

        console.log(`[Action generateForecast] Saving forecast via mutation for date: ${forecast.date} for user ${args.userId}`);

        // Delete existing first (atomic within its mutation)
        await ctx.runMutation(internal.forecast.deleteExistingForecast, {
           userId: args.userId,
           date: forecast.date
        });

        // Insert new forecast (atomic within its mutation)
        const forecastId = await ctx.runMutation(internal.forecast.insertForecast, {
          userId: args.userId,
          date: forecast.date,
          emotionScore: forecast.emotionScore,
          description: forecast.description || "N/A",
          trend: forecast.trend || "stable",
          details: forecast.details || "",
          recommendation: forecast.recommendation || "",
          confidence: forecast.confidence || 0,
          basedOnDays: recentPastLogs.map(log => log.date), // Be mindful of size
        });

        console.log(`[Action generateForecast] Saved forecast ID ${forecastId} for user ${args.userId}`);
        if (forecastId) { // Check if ID was returned
           savedForecasts.push({
             _id: forecastId, // Use the ID returned by the mutation
             date: forecast.date,
             score: forecast.emotionScore
           });
        }
      }

      console.log(`[Action generateForecast] Successfully saved ${savedForecasts.length} forecasts for user ${args.userId}`);
      return { success: true, forecasts: savedForecasts };

    } catch (error: any) {
      console.error(`[Action generateForecast] Error during forecast generation/saving for user ${args.userId}:`, error);
      return {
        success: false,
        error: `Failed to generate forecast: ${error.message}`
      };
    }
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
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const compareDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((compareDateOnly.getTime() - todayDateOnly.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";
  if (dayDiff === -1) return "Yesterday";
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