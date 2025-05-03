// FEED
// /Users/matthewsimon/Documents/Github/solo-heatMaps/soloist/convex/feed.ts

import { query, action, mutation } from "./_generated/server";
import { v } from "convex/values"; // Fixed import for v
import { api } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

/**
 * The shape of data returned by the LLM's chat completion API.
 * We define a minimal type for TypeScript.
 */
interface OpenAIChatCompletion {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/**
 * 1) listFeedMessages query:
 *    Fetch all feed messages for a given user.
 *    (Optionally, you could also filter by date or do ordering here.)
 */
export const listFeedMessages = query({
  args: {
    userId: v.optional(v.string()), // Must match the string stored in `feed.userId`
  },
  // Return type is an array of feed docs
  handler: async ({ db }, { userId }): Promise<Doc<"feed">[]> => {
    // We assume your `feed` table has fields: userId, date, message, createdAt
    return await db
      .query("feed")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc") // or "asc", whichever you prefer
      .collect();
  },
});

/**
 * 2) generateFeedForDailyLog action:
 *    - Calls getDailyLog to fetch the user's daily log
 *    - Calls OpenAI to get a short summary or encouragement text
 *    - Inserts that text into the "feed" table
 *
 *    Returns { reply: string }
 */
export const generateFeedForDailyLog = action({
  args: {
    userId: v.string(), // The doc ID or authId for logs
    date: v.string(),   // "YYYY-MM-DD"
  },
  handler: async (ctx, { userId, date }): Promise<{ reply: string }> => {
    // 1) Fetch the daily log from DB by calling your dailyLogs.getDailyLog query
    const dailyLog = await ctx.runQuery(api.dailyLogs.getDailyLog, {
      userId,
      date,
    });
    if (!dailyLog) {
      throw new Error(`No daily log found for userId=${userId}, date=${date}`);
    }

    // 2) Build prompts for the LLM
    const systemPrompt = `
      You are Solomon, an insightful, compassionate AI companion for the Soloist heatMaps daily logging application.
      
      About Soloist heatMaps:
      - Users log their daily experiences, goals, and reflections
      - Each day receives a score (0-100) corresponding to one of six color categories
      - Your role is to provide meaningful insights and personalized guidance
      
      Color Categories and Psychological States:
      1. DEEP RED (0-16): Severe distress or crisis
         - Provide gentle, supportive validation
         - Offer concrete coping strategies
         - Suggest professional resources if appropriate
         - Focus on small steps forward
      
      2. RED (17-33): Significant struggle
         - Acknowledge difficulties with empathy
         - Highlight any small positive aspects
         - Offer practical suggestions for self-care
         - Encourage reaching out for support
      
      3. ORANGE (34-50): Challenging day with some difficulties
         - Balance recognition of challenges with hope
         - Identify potential learning opportunities
         - Suggest specific coping mechanisms
         - Encourage small positive actions for tomorrow
      
      4. YELLOW (51-67): Balanced day with ups and downs
         - Acknowledge the mix of experiences
         - Reinforce positive coping strategies used
         - Suggest ways to build on positive moments
         - Offer balanced perspective
      
      5. GREEN (68-84): Generally positive day
         - Celebrate successes and positive choices
         - Connect achievements to user's values/goals
         - Suggest ways to maintain momentum
         - Offer insights for continued growth
      
      6. DEEP GREEN (85-100): Exceptional day
         - Express genuine celebration of high points
         - Help identify what made the day exceptional
         - Connect to user's broader life journey
         - Suggest how to carry positive elements forward
      
      Your response should:
      - Begin with a personalized greeting
      - Offer 2-3 sentences of specific, thoughtful insights based on their log
      - Provide 1-2 actionable suggestions tailored to their situation
      - Use a warm, genuine tone that matches their emotional state
      - Be concise (100-150 words maximum)
      
      Avoid:
      - Generic platitudes or clichés
      - Overwhelming them with too many suggestions
      - Minimizing their challenges or emotions
      - Excessive positivity for difficult days
    `.trim();

    // Convert dailyLog.answers to JSON for the LLM
    const userContent = JSON.stringify(dailyLog.answers, null, 2);

    // 3) Make sure your OpenAI key is available
    const openAiApiKey = process.env.OPENAI_API_KEY;
    if (!openAiApiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment!");
    }

    // 4) Call OpenAI's Chat Completion
    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the user's daily log in JSON:\n${userContent}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    };

    const response: Response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI error: ${text}`);
    }

    const completion: OpenAIChatCompletion = await response.json();
    const assistantReply: string =
      completion.choices?.[0]?.message?.content?.trim() || "(No response)";

    // 5) Store the LLM response in the "feed" table
    await ctx.runMutation(api.feed.storeFeedMessage, {
      userId,
      date,
      message: assistantReply,
    });

    return { reply: assistantReply };
  },
});

/**
 * 3) storeFeedMessage mutation:
 *    Saves a single feed "message" in your "feed" table.
 */
export const storeFeedMessage = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    message: v.string(),
  },
  handler: async ({ db }, { userId, date, message }) => {
    // Insert into "feed" table (defined in your schema)
    return db.insert("feed", {
      userId,
      date,
      message,
      createdAt: Date.now(),
    });
  },
});

/**
 * Add a comment directly to a feed document
 */
export const addComment = mutation({
  args: {
    feedId: v.id("feed"),
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { feedId, userId, userName, userImage, content } = args;
    
    // Get the feed document
    const feed = await ctx.db.get(feedId);
    
    // If feed doesn't exist, throw error
    if (!feed) {
      throw new Error("Feed not found");
    }
    
    // Create the new comment object
    const newComment = {
      userId,
      userName,
      userImage,
      content,
      createdAt: Date.now(),
    };
    
    // Append to existing comments array or create a new array
    const comments = feed.comments || [];
    
    // Update the feed document with the new comment
    await ctx.db.patch(feedId, {
      comments: [...comments, newComment],
    });
    
    return true;
  },
});

/**
 * Get all comments for a specific feed document
 */
export const getComments = query({
  args: {
    feedId: v.id("feed"),
  },
  handler: async (ctx, args) => {
    const feed = await ctx.db.get(args.feedId);
    
    if (!feed || !feed.comments) {
      return [];
    }
    
    return feed.comments;
  },
});