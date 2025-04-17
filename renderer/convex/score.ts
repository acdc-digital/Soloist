import { action, mutation } from "./_generated/server";
import { v } from "convex/values";

// Import your generated API so we can call runQuery(api.dailyLogs.getDailyLog,...)
import { api } from "./_generated/api";

/**
 * Action: scoreDailyLog
 * 1) Run a query to get the daily log from DB
 * 2) Call OpenAI to compute a 0-100 score
 * 3) Run a mutation to update that log's score
 */
export const scoreDailyLog = action({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, { userId, date }) => {
    // 1) Retrieve the daily log by calling your existing getDailyLog query
    const dailyLog = await ctx.runQuery(api.dailyLogs.getDailyLog, {
      userId,
      date,
    });

    if (!dailyLog) {
      throw new Error(`No daily log found for userId=${userId}, date=${date}`);
    }

    // 2) Build your system prompt for the LLM
    const systemPrompt = `
      You are Solomon, an empathetic AI that evaluates a person's daily logs.
      Your task is to assess their overall day and assign a score from 0 to 100.
      
      The score maps to one of ten color categories:
      
      1. INDIGO (90-100): Exceptional day with strong positive emotions, high energy, and significant achievements.
      2. BLUE (80-89): Very good day, predominantly positive experiences and successful coping.
      3. SKY (70-79): Good day, more positive than negative, manageable challenges.
      4. TEAL (60-69): Fairly positive, some moderate challenges with adequate coping.
      5. GREEN (50-59): Balanced day, mix of ups and downs but generally steady.
      6. LIME (40-49): Slightly below average, more challenges than successes.
      7. YELLOW (30-39): Difficult day with noticeable setbacks and stress.
      8. AMBER (20-29): Very challenging day with significant negative emotions.
      9. ORANGE (10-19): Extremely tough day, overwhelming stress or sadness.
      10. ROSE (0-9): Crisis level, severe distress and inability to function.
      
      Based solely on the content of the user's daily log JSON, respond with the integer score (0–100) only, without any additional text.
    `.trim();

    // JSONify the daily log's answers
    const userContent = JSON.stringify(dailyLog.answers, null, 2);

    // 3) Access your OpenAI API key from process.env
    // Make sure you set it with: npx convex secrets set OPENAI_API_KEY "..."
    const openAiApiKey = process.env.OPENAI_API_KEY;
    if (!openAiApiKey) {
      throw new Error("Missing OPENAI_API_KEY in environment!");
    }

    // Prepare the request body for OpenAI
    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the user's daily log in JSON:\n${userContent}`,
        },
      ],
      temperature: 0.0,
      max_tokens: 3,
    };

    // 4) Make the external HTTP request (only allowed in an action)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const completion = await response.json();
    let assistantMessage = completion.choices?.[0]?.message?.content?.trim() || "";
    let finalScore = parseInt(assistantMessage, 10);
    if (isNaN(finalScore)) {
      finalScore = 50; // default to 50 if invalid
    }

    // 5) Update the daily log's score via a mutation
    await ctx.runMutation(api.score.updateLogScore, {
      logId: dailyLog._id,
      newScore: finalScore,
    });

    return { score: finalScore };
  },
});

/**
 * Mutation: updateLogScore
 * - Directly patches the given log doc's `score`.
 */
export const updateLogScore = mutation({
  args: {
    logId: v.id("logs"),
    newScore: v.number(),
  },
  handler: async ({ db }, { logId, newScore }) => {
    await db.patch(logId, {
      score: newScore,
      updatedAt: Date.now(),
    });
    return db.get(logId);
  },
});