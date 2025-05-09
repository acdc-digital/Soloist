import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Define the expected structure of the LLM's output for type safety
interface GeneratedLogData {
  overallMood: number;
  workSatisfaction: number;
  personalLifeSatisfaction: number;
  balanceRating: number;
  sleep: number;
  exercise: boolean;
  highlights: string;
  challenges: string;
  tomorrowGoal: string;
}

/**
 * The shape of data returned by the LLM's chat completion API.
 */
interface OpenAIChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/**
 * Save user instructions for random log generation
 */
export const saveInstructions = mutation({
  args: {
    userId: v.string(),
    instructions: v.string(),
  },
  handler: async (ctx, { userId, instructions }) => {
    const existingInstructions = await ctx.db
      .query("randomizer")
      .withIndex("byUserId", q => q.eq("userId", userId))
      .first();

    const now = Date.now();
    
    if (existingInstructions) {
      // Update existing instructions
      return await ctx.db.patch(existingInstructions._id, {
        instructions,
        updatedAt: now,
      });
    } else {
      // Insert new instructions
      return await ctx.db.insert("randomizer", {
        userId,
        instructions,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Get user instructions for random log generation
 */
export const getInstructions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const userInstructions = await ctx.db
      .query("randomizer")
      .withIndex("byUserId", q => q.eq("userId", userId))
      .first();
    
    return userInstructions?.instructions || null;
  },
});

export const generateRandomLog = action({
  args: {
    date: v.string(), // Expecting YYYY-MM-DD
    userId: v.optional(v.string()), // Optional userId to fetch custom instructions
  },
  handler: async (ctx, { date, userId }): Promise<GeneratedLogData> => {
    console.log("Executing generateRandomLog in new randomizer.ts file");
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY is not set. Random log generation will not work.");
      throw new Error("OpenAI API key is not configured in environment variables.");
    }

    // Get user's custom instructions if userId is provided
    let userInstructions = null;
    if (userId) {
      userInstructions = await ctx.runQuery(api.randomizer.getInstructions, { userId });
      console.log("Using custom instructions:", !!userInstructions);
    }

    // Build the system prompt, incorporating user instructions if available
    const userInstructionsBlock = userInstructions 
      ? `\nUser Context: ${userInstructions}\nUse the above context to personalize the generated log while still maintaining variety and realism.`
      : "";

    const systemPrompt = `
You are an AI assistant tasked with generating a fictional daily log entry.
The user wants to fill out a form for the date: ${date}.
Please provide a realistic and varied set of answers for their daily reflection.${userInstructionsBlock}

Your response MUST be a valid JSON object containing the following keys:
- "overallMood": A number (integer between 1 and 10, inclusive).
- "workSatisfaction": A number (integer between 1 and 10, inclusive).
- "personalLifeSatisfaction": A number (integer between 1 and 10, inclusive).
- "balanceRating": A number (integer between 1 and 10, inclusive).
- "sleep": A number (e.g., 7, 7.5, 8, between 0 and 24 inclusive, can have .5 increments).
- "exercise": A boolean value (true or false).
- "highlights": A short string (1-2 sentences) describing a positive event or highlight of the day.
- "challenges": A short string (1-2 sentences) describing a challenge faced during the day.
- "tomorrowGoal": A short string (1-2 sentences) describing a main goal or focus for the next day.

Example JSON structure:
{
  "overallMood": 7,
  "workSatisfaction": 8,
  "personalLifeSatisfaction": 6,
  "balanceRating": 5,
  "sleep": 7.5,
  "exercise": true,
  "highlights": "Had a very productive meeting with the team and cleared a major blocker.",
  "challenges": "Felt a bit overwhelmed by emails in the morning.",
  "tomorrowGoal": "Prepare the presentation for Friday's review."
}
Ensure the output is ONLY the JSON object itself, with no other surrounding text or explanations.
`;

    const requestBody = {
      model: "gpt-3.5-turbo-1106", // This model is good with JSON mode
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a daily log for ${date}.` },
      ],
      temperature: 0.7, // Add some creativity
    };

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error details:", errorText);
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }

      const completion = await response.json() as OpenAIChatCompletion;
      const responseContent = completion.choices?.[0]?.message?.content;

      if (!responseContent) {
        console.error("OpenAI response content is empty for date:", date, completion);
        throw new Error("OpenAI returned an empty or malformed response.");
      }

      // The model with json_object response_format should return valid JSON string.
      const generatedData = JSON.parse(responseContent) as GeneratedLogData;
      return generatedData;

    } catch (error) {
      console.error(`Error in generateRandomLog for date ${date}:`, error);
      // Ensure we throw an error that the client can handle
      if (error instanceof Error) {
        throw error; // Re-throw if it's already an Error object
      }
      throw new Error("Failed to generate random log content due to an unexpected internal error.");
    }
  },
}); 