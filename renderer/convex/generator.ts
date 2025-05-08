// convex/generator.ts
// /convex/generator.ts
import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Define the expected structure from OpenAI response choices
interface OpenAIChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Define types for our forecast
interface PastLog {
  date: string;
  score: number;
  activities?: string[];
  notes?: string;
}

interface GeneratedForecast {
  date: string;
  emotionScore: number;
  description: string;
  trend: "up" | "down" | "stable";
  details: string;
  recommendation: string;
  confidence: number;
}

// Helper function (optional, can be kept here or moved)
const getISODateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// --- Internal Action to Generate Forecast using AI ---
export const generateForecastWithAI = internalAction({
  args: {
    userId: v.string(),
    pastLogs: v.array(v.object({
      date: v.string(),
      score: v.number(),
      activities: v.optional(v.array(v.string())),
      notes: v.optional(v.string())
    })),
    targetDates: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const { userId, pastLogs, targetDates } = args;
    
    console.log(`[Action generateForecastWithAI] Generating forecasts for user ${userId} for dates:`, targetDates);
    console.log(`[Action generateForecastWithAI] Using ${pastLogs.length} past logs as training data`);

    // In a real implementation, this would call OpenAI or another AI service
    // For now, we'll generate mock forecasts as a placeholder
    
    try {
      // Simulate AI processing time (only in development)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a forecast for each target date
      const forecasts: GeneratedForecast[] = targetDates.map((date, index) => {
        // Get the last log's score as reference
        const sortedLogs = [...pastLogs].sort((a, b) => a.date.localeCompare(b.date));
        const lastLog = sortedLogs[sortedLogs.length - 1];
        const lastScore = lastLog?.score || 50;
        
        // Generate a score with some variation
        // First day slight change, second day more change, third day even more
        const variation = (Math.random() * 20 - 10) * (index + 1) * 0.5;
        let predictedScore = Math.round(Math.max(0, Math.min(100, lastScore + variation)));
        
        // Determine trend
        let trend: "up" | "down" | "stable"; 
        if (predictedScore > lastScore + 5) trend = "up";
        else if (predictedScore < lastScore - 5) trend = "down";
        else trend = "stable";
        
        // Calculate confidence (decreases with distance)
        const confidence = Math.round(90 - (index * 15));
        
        return {
          date,
          emotionScore: predictedScore,
          description: getDescriptionFromScore(predictedScore),
          trend,
          details: generateDetails(predictedScore, trend, index),
          recommendation: generateRecommendation(predictedScore),
          confidence
        };
      });
      
      console.log(`[Action generateForecastWithAI] Successfully generated ${forecasts.length} forecasts`);
      return forecasts;
      
    } catch (error: any) {
      console.error("[Action generateForecastWithAI] Error generating forecasts:", error);
      throw new Error(`AI forecast generation failed: ${error.message}`);
    }
  }
});

// --- Helper Functions ---
function getDescriptionFromScore(score: number): string {
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

function generateDetails(score: number, trend: string, dayIndex: number): string {
  const dayTerms = ["tomorrow", "the day after tomorrow", "in two days"];
  const dayTerm = dayTerms[dayIndex] || "in the coming days";
  
  if (score >= 80) {
    return `Based on your patterns, you're likely to have an excellent day ${dayTerm}. Your recent positive momentum suggests high emotional wellbeing will continue.`;
  } else if (score >= 60) {
    return `Your forecast shows a good day ${dayTerm}. You tend to maintain positive emotions in similar circumstances, which should continue.`;
  } else if (score >= 40) {
    return `Expecting a balanced day ${dayTerm}. Your emotional patterns suggest you'll experience both challenges and rewards in moderate amounts.`;
  } else if (score >= 20) {
    return `You may face some challenges ${dayTerm}. Your patterns suggest this could be a somewhat difficult period, but temporary.`;
  } else {
    return `Your forecast indicates significant challenges ${dayTerm}. Based on your patterns, this may be a difficult day emotionally, but remember that these periods are temporary.`;
  }
}

function generateRecommendation(score: number): string {
  if (score >= 80) {
    return "Continue your current activities and consider ways to share your positive energy with others.";
  } else if (score >= 60) {
    return "Maintain your healthy routines and consider planning something enjoyable to further boost your wellbeing.";
  } else if (score >= 40) {
    return "Focus on balanced self-care and set reasonable expectations for your tasks and interactions.";
  } else if (score >= 20) {
    return "Prioritize rest and self-compassion. Consider reducing commitments if possible and focus on activities that have improved your mood in the past.";
  } else {
    return "This is a time to be especially gentle with yourself. Reach out to supportive people, minimize stressors, and focus on basic self-care like rest and nourishment.";
  }
}

// --- Action: Generate Daily Consultation using fetch ---
export const generateDailyConsultation = action({
  args: {
    userId: v.string(),
    selectedDayData: v.object({
      date: v.string(),
      dayName: v.string(),
      emotionScore: v.optional(v.number()),
      notesForSelectedDay: v.optional(v.string()),
      isFuture: v.optional(v.boolean()),
    }),
    sevenDayContextData: v.array(
      v.object({
        date: v.string(),
        score: v.optional(v.number()),
        notes: v.optional(v.string()),
        isFuture: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, selectedDayData, sevenDayContextData } = args;

    console.log(
      `[Action generateDailyConsultation] User: ${userId}, Day: ${selectedDayData.date} (${selectedDayData.dayName}), isFuture: ${selectedDayData.isFuture}`
    );
    
    // --- Get OpenAI API Key ---
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("[Action generateDailyConsultation] OPENAI_API_KEY environment variable not set.");
        return { success: false, error: "AI service configuration error. Please contact support."};
    }

    // --- Construct the Prompt ---
    const contextString = sevenDayContextData
      .map(day =>
        `  - Date: ${day.date}, Score: ${day.score ?? 'N/A'}, ${day.isFuture ? 'Type: Forecast' : 'Type: Log'}, Notes: ${day.notes ?? 'None'}`
      )
      .join('\n');
      
    const prompt = `
You are an empathetic AI emotional wellness assistant providing a brief daily details summary.
The user is looking at their data for: ${selectedDayData.dayName}, ${selectedDayData.date}.
This day ${selectedDayData.isFuture ? 'is a future forecast' : 'has passed or is today'}.
Emotion score for this day: ${selectedDayData.emotionScore ?? 'Not recorded'}.
Specific notes/details logged for this day: ${selectedDayData.notesForSelectedDay ?? 'None'}.

Here is the context for the surrounding 7-day period:
${contextString}

Please provide a personalized daily details summary in a SINGLE, concise paragraph (around 2-4 sentences).
Focus on the selected day (${selectedDayData.dayName}), acknowledging its score and any notes.
Briefly connect it to the weekly context if relevant (e.g., how it compares to the average, or if it aligns with/diverges from a forecast).
Keep the tone supportive and insightful. Directly output the paragraph text only, without any greetings, closings, markdown formatting, or extra conversational text.
`;

    console.log("[Action generateDailyConsultation] Sending prompt to OpenAI via fetch.");

    // --- Call OpenAI API using fetch ---
    try {
      const requestBody = {
        model: "gpt-3.5-turbo", // Or your preferred model
        messages: [
          { role: "system", content: "You are an empathetic AI emotional wellness assistant providing a brief daily summary." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150, 
        temperature: 0.6, 
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Action generateDailyConsultation] OpenAI fetch error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`AI service request failed: ${response.statusText} - ${errorText}`);
      }

      const completion: OpenAIChatCompletion = await response.json();
      const consultationText = completion.choices?.[0]?.message?.content?.trim();

      if (!consultationText) {
        console.error("[Action generateDailyConsultation] OpenAI fetch response content is empty.", completion);
        return { success: false, error: "AI service returned an empty response." };
      }

      console.log("[Action generateDailyConsultation] Received consultation via fetch:", consultationText);
      return { success: true, consultationText };

    } catch (error: any) {
      console.error("[Action generateDailyConsultation] Error calling OpenAI API via fetch:", error);
      let errorMessage = "Failed to generate details due to an AI service error.";
      // Include the specific error message if available
      if (error instanceof Error && error.message) {
         errorMessage += ` Details: ${error.message}`;
      }
      return { success: false, error: errorMessage };
    }
  },
});

// --- Action: Generate Weekly Insights using fetch ---
export const generateWeeklyInsights = action({
  args: {
    userId: v.string(),
    sevenDayContextData: v.array(
      v.object({
        date: v.string(),
        score: v.optional(v.number()),
        isFuture: v.optional(v.boolean()),
        description: v.optional(v.string()),
        details: v.optional(v.string()),
        trend: v.optional(v.string()),
        // any other fields from DayDataItem that might be useful for context
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, sevenDayContextData } = args;

    console.log(
      `[Action generateWeeklyInsights] User: ${userId}, generating insights for a 7-day period.`
    );

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[Action generateWeeklyInsights] OPENAI_API_KEY environment variable not set.");
      return { success: false, error: "AI service configuration error. Please contact support." };
    }

    const formattedSevenDayData = sevenDayContextData
      .map(day => {
        let daySummary = `  - Date: ${day.date}, Emotion Score: ${day.score ?? 'N/A'}`;
        daySummary += `, Type: ${day.isFuture ? 'Forecast' : 'Log'}`;
        if (day.description) daySummary += `, Description: ${day.description}`;
        if (day.details && !day.isFuture) daySummary += `, Details: ${day.details}`;
        if (day.trend) daySummary += `, Trend: ${day.trend}`;
        return daySummary;
      })
      .join('\n');

    const prompt = `
You are an insightful and empathetic AI emotional wellness assistant.
Based on the following 7-day emotional data, please provide 3-4 concise bullet-point key insights about observed patterns, notable trends, or significant emotional shifts.
Focus on actionable or reflective takeaways for the user.
The data includes past logged emotion scores and future forecasted scores.

7-Day Emotional Data:
\`\`\`
${formattedSevenDayData}
\`\`\`

Please return your response STRICTLY as a JSON object with a single key "insights" which holds an array of strings. Each string in the array should be a distinct insight.
For example:
{
  "insights": [
    "Emotional scores tend to be higher on weekends based on the provided data.",
    "There was a notable dip in emotion mid-week, followed by a recovery.",
    "The forecast suggests a stable emotional outlook for the next few days."
  ]
}
`;

    console.log("[Action generateWeeklyInsights] Sending prompt to OpenAI via fetch.");

    // --- Call OpenAI API using fetch ---
    try {
      const requestBody = {
        model: "gpt-3.5-turbo-1106", // Or your preferred model that supports JSON mode
        messages: [
          { role: "system", content: "You are an AI assistant that provides emotional wellness insights based on 7-day data. You always respond in the specified JSON format." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5, // Adjust for creativity vs. predictability
        max_tokens: 250,  // Generous enough for 3-4 insights
        response_format: { type: "json_object" }, // Enable JSON mode
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Action generateWeeklyInsights] OpenAI API error: ${response.status} ${response.statusText}`, errorBody);
        return { success: false, error: `AI service error: ${response.statusText}. Details: ${errorBody}` };
      }

      const jsonResponse = await response.json() as OpenAIChatCompletion; // Using existing OpenAIChatCompletion type

      if (jsonResponse.choices && jsonResponse.choices[0] && jsonResponse.choices[0].message && jsonResponse.choices[0].message.content) {
        const content = jsonResponse.choices[0].message.content;
        console.log("[Action generateWeeklyInsights] Raw AI response content:", content);
        
        try {
          const parsedContent = JSON.parse(content);
          if (parsedContent && Array.isArray(parsedContent.insights)) {
            const insightsArray = parsedContent.insights.filter((item: any) => typeof item === 'string');
            console.log("[Action generateWeeklyInsights] Successfully parsed insights:", insightsArray);
            return { success: true, insights: insightsArray };
          } else {
            console.error("[Action generateWeeklyInsights] Parsed content is not in the expected format (missing 'insights' array):", parsedContent);
            return { success: false, error: "AI response format error. Insights array not found." };
          }
        } catch (e: any) {
          console.error("[Action generateWeeklyInsights] Error parsing AI response content:", e.message, "Raw content:", content);
          return { success: false, error: "AI response format error. Could not parse insights." };
        }
      } else {
        console.error("[Action generateWeeklyInsights] Unexpected OpenAI response structure:", jsonResponse);
        return { success: false, error: "AI service returned an unexpected response structure." };
      }
    } catch (e: any) {
      console.error(`[Action generateWeeklyInsights] Error calling OpenAI: ${e.message}`);
      return { success: false, error: `Failed to generate insights: ${e.message}` };
    }
  }
});