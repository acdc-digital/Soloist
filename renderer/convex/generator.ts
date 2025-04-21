// convex/generator.ts

import { v } from "convex/values";
import { internalAction } from "./_generated/server"; // Use internalAction

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
export const generateForecastWithAI = internalAction({
  args: {
    userId: v.string(), // Keep userId for potential context in prompts
    pastLogs: v.array(
      v.object({ // Structure of logs passed from the calling action
        date: v.string(),
        score: v.number(),
        activities: v.optional(v.array(v.string())),
        notes: v.optional(v.string()),
      })
    ),
    targetDates: v.array(v.string()), // Dates to forecast (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    // Log entry point and arguments
    console.log("[Internal Action generateForecastWithAI] called", {
      userId: args.userId,
      pastLogsCount: args.pastLogs.length,
      targetDates: args.targetDates,
    });

    const { userId, pastLogs, targetDates } = args;

    // Sort logs chronologically for the prompt context
    const sortedLogs = [...pastLogs].sort((a, b) => a.date.localeCompare(b.date));
    console.log("[Internal Action generateForecastWithAI] Sorted logs count:", sortedLogs.length);

    // --- System Prompt: Defines the AI's role and desired output format ---
    const systemPrompt = `
      You are Solomon, an AI emotion forecasting system for the Soloist app. Your task is to predict the user's emotional state for the next three days based on their past emotional logs.

      Input: A list of past logs (date, score, optional notes) and target dates.
      Output: A JSON object containing a single key "forecasts". The value associated with this key MUST be a JSON array of forecast objects for the target dates. Each object in the array must contain:
      - date (string, "YYYY-MM-DD")
      - emotionScore (number, 0-100)
      - description (string, short, e.g., "Positive Outlook")
      - trend (string, "up", "down", or "stable" relative to previous day/last log)
      - details (string, 1-2 sentences analysis)
      - recommendation (string, 1 sentence action)

      Example Output Structure:
      {
        "forecasts": [
          {
            "date": "2025-04-22",
            "emotionScore": 75,
            "description": "Good Momentum",
            "trend": "up",
            "details": "Building on recent positive trends, expect continued good energy. Potential minor dip in the afternoon.",
            "recommendation": "Capitalize on morning focus for important tasks."
          },
          {
            "date": "2025-04-23",
            // ... other fields ...
          },
          {
            "date": "2025-04-24",
            // ... other fields ...
          }
        ]
      }

      Analyze patterns in the provided logs (scores, any notes if available) to make predictions.
      Ensure your entire response is ONLY the valid JSON object as specified. Do not include any introductory text, explanations, or markdown formatting outside the JSON structure.
    `.trim();

    // --- User Prompt: Provides the specific data for this forecast ---
    const userPrompt = `
      User ID (for context, do not include in output): ${userId}
      Past Logs:
      ${sortedLogs.map(log => `- ${log.date}: Score ${log.score}${log.notes ? `, Notes: ${log.notes}` : ''}`).join('\n')}

      Generate forecasts for these dates: ${targetDates.join(', ')}
      Respond ONLY with the JSON object containing the "forecasts" array.
    `.trim();

    // --- API Key Check ---
    const openAiApiKey = process.env.OPENAI_API_KEY;
    if (!openAiApiKey) {
      console.error("[Internal Action generateForecastWithAI] Missing OPENAI_API_KEY");
      throw new Error("Missing OPENAI_API_KEY in environment!");
    }

    // --- OpenAI Request Body ---
    const body = {
      model: "gpt-4-turbo", // Specify the model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6, // Controls randomness (lower for more deterministic)
      max_tokens: 1000, // Max length of the generated response
      response_format: { type: "json_object" }, // Crucial for requesting JSON output
    };

    // --- Main Try/Catch block for the entire operation ---
    try {
      console.log("[Internal Action generateForecastWithAI] Sending request to OpenAI...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify(body),
      });
      console.log("[Internal Action generateForecastWithAI] OpenAI response status:", response.status);

      // --- Handle API Errors ---
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Internal Action generateForecastWithAI] OpenAI error response text:", errorText);
        throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
      }

      // --- Extract Content ---
      const completion: OpenAIChatCompletion = await response.json();
      const content = completion.choices?.[0]?.message?.content?.trim();

      if (!content) {
        console.error("[Internal Action generateForecastWithAI] Empty content response from OpenAI");
        throw new Error("Empty response content from OpenAI");
      }
      console.log("[Internal Action generateForecastWithAI] Raw response content:", content);

      // --- Parse and Extract Forecast Array ---
      let forecasts: any[]; // Declare with let to allow assignment

      try {
        const parsedResponse = JSON.parse(content);

        // --- ADDED DEBUG LOG ---
        // Log the actual structure received before attempting extraction
        console.log("[DEBUG] OpenAI Parsed Response Structure:", JSON.stringify(parsedResponse, null, 2));
        // ---

        console.log("[Internal Action generateForecastWithAI] Successfully parsed JSON response.");

        // Check if the expected structure { "forecasts": [...] } exists
        if (typeof parsedResponse === 'object' && parsedResponse !== null && Array.isArray(parsedResponse.forecasts)) {
           console.log("[Internal Action generateForecastWithAI] Found 'forecasts' array directly.");
           forecasts = parsedResponse.forecasts; // Assign the nested array
        }
        // Fallback: Check if the response *itself* is the array (less likely with json_object format)
        else if (Array.isArray(parsedResponse)) {
           console.warn("[Internal Action generateForecastWithAI] Parsed response was directly an array, expected object with 'forecasts' key.");
           forecasts = parsedResponse;
        }
        // Fallback: Search for *any* array key if the primary structure isn't found
        else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
            console.warn("[Internal Action generateForecastWithAI] Expected 'forecasts' key not found. Searching for any array key...");
            const anyArrayKey = Object.keys(parsedResponse).find(key => Array.isArray(parsedResponse[key]));
            if (anyArrayKey) {
                console.warn(`[Internal Action generateForecastWithAI] Found array nested under unexpected key: "${anyArrayKey}". Using this array.`);
                forecasts = parsedResponse[anyArrayKey];
            } else {
                 console.error("[Internal Action generateForecastWithAI] Parsed response is object but no array key found:", parsedResponse);
                 throw new Error(`OpenAI response was valid JSON object but did not contain the expected 'forecasts' array or any other array. Object received: ${JSON.stringify(parsedResponse)}`);
            }
        }
         else {
           console.error("[Internal Action generateForecastWithAI] Parsed response is not an array or suitable object:", parsedResponse);
           throw new Error("OpenAI response was not the expected array or object structure.");
        }

      } catch (e: any) {
        console.error("[Internal Action generateForecastWithAI] JSON parse error:", e);
        console.error("[Internal Action generateForecastWithAI] Raw content causing error:", content);
        // Include raw content in error for better debugging
        throw new Error(`Failed to parse OpenAI response as valid JSON: ${e.message}. Raw content: ${content}`);
      }

      // --- Validate Array ---
      if (!Array.isArray(forecasts)) {
           console.error("[Internal Action generateForecastWithAI] Forecasts variable is not an array after processing:", forecasts);
           throw new Error("Failed to extract a valid forecast array from the response.");
      }

      console.log("[Internal Action generateForecastWithAI] Final forecasts array count:", forecasts.length);
      if (forecasts.length > 0) console.log("[Internal Action generateForecastWithAI] Sample forecast:", forecasts[0]);

      // --- Process Forecasts (Add defaults, confidence) ---
      const finalForecasts = forecasts.map((forecast: any, index: number) => {
        // Validate individual forecast object structure if needed before accessing properties
        if (!forecast || typeof forecast !== 'object') {
           console.warn("[Internal Action generateForecastWithAI] Skipping invalid item in forecasts array:", forecast);
           // Return a placeholder or skip - returning placeholder for now
           return {
             date: targetDates[index] || getISODateString(new Date()), // Need a date
             emotionScore: 0, description: "Invalid Data Received", trend: "stable",
             details: "Received invalid forecast structure from AI.", recommendation: "Please try again.", confidence: 0
           };
        }
        return {
          // Spread potentially valid fields first
          ...forecast,
          // Apply defaults/overrides for mandatory fields
          date: forecast.date || targetDates[index] || getISODateString(new Date()), // Robust date fallback
          emotionScore: typeof forecast.emotionScore === 'number' ? forecast.emotionScore : 0,
          description: forecast.description || "Forecast unavailable",
          trend: forecast.trend || "stable",
          details: forecast.details || "",
          recommendation: forecast.recommendation || "",
          // Calculate confidence score
          confidence: Math.max(30, Math.min(95, 50 + (pastLogs.length * 2) - (index * 5))),
        };
      });

      console.log("[Internal Action generateForecastWithAI] Returning final forecasts");
      return finalForecasts; // Return the processed array

    } catch (error: any) {
      // Catch errors from API call, parsing, or processing
      console.error("[Internal Action generateForecastWithAI] Error in handler:", error);
      // Re-throw the error so the calling action receives it
      throw new Error(`Failed during forecast generation: ${error.message}`);
    }
  },
}); // End internalAction