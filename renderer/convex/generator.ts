// convex/generator.ts

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server"; // Use internalAction

// Define the expected structure from OpenAI response choices
interface OpenAIChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Helper function (optional, can be kept here or moved)
const getISODateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};


// --- Internal Action to Generate Forecast using OpenAI ---
export const generateForecast = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log("[Action generateForecast] called for userId:", args.userId);

    // MODIFIED: Allow empty user IDs to match our query behavior
    // Instead of rejecting empty IDs, we'll use them as-is
    // if (!args.userId || args.userId.trim() === "") {
    //    console.error("[Action generateForecast] Error: Received empty or invalid userId.");
    //    return { success: false, error: "Backend Error: User ID was missing or empty." };
    // }

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