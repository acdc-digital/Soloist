// DAILY LOGS
// /Users/matthewsimon/Documents/Github/solo-heatMaps/soloist/convex/dailyLogs.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * 1) listDailyLogs query:
 * Fetch all logs for a given user and year (e.g. "2025").
 * We assume `date` is stored as "YYYY-MM-DD" strings.
 */
export const listDailyLogs = query({
  args: { userId: v.string(), year: v.string() },
  handler: async ({ db }, { userId, year }) => {
    const start = `${year}-01-01`;
    const end   = `${year}-12-31`;
    return await db
      .query("logs")
      .filter(q => q.eq(q.field("userId"), userId))
      .filter(q => q.gte(q.field("date"), start))
      .filter(q => q.lte(q.field("date"), end))
      .collect();
  },
});

/**
 * 2) getDailyLog query:
 * Fetch a single daily log for a given user + date (YYYY-MM-DD).
 * Returns null if none is found.
 */
export const getDailyLog = query({
  args: {
    userId: v.string(),
    date: v.string(),
  },
  handler: async ({ db }, { userId, date }) => {
    // Use the byUserDate index for more efficient lookup
    return await db
      .query("logs")
      .withIndex("byUserDate", (q) => q.eq("userId", userId).eq("date", date))
      .first();
  },
});

/**
 * 3) getLogsByDateRange query:
 * Fetch all daily logs for a user between two ISO dates (inclusive).
 */
export const getLogsByDateRange = query({
  args: {
    userId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async ({ db }, { userId, startDate, endDate }) => {
    return await db
      .query("logs")
      .filter(q => q.eq(q.field("userId"), userId))
      .filter(q => q.gte(q.field("date"), startDate))
      .filter(q => q.lte(q.field("date"), endDate))
      .collect();
  },
});

/**
 * 4) dailyLog mutation:
 * Upserts a daily log record. If a log with (userId, date)
 * already exists, patch it; otherwise insert a new record.
 */
export const dailyLog = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    answers: v.any(),
    score: v.optional(v.number()),
  },
  handler: async ({ db }, { userId, date, answers, score }) => {
    // Try to find an existing log for this user + date
    const existingLog = await db
      .query("logs")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("date"), date))
      .first();

    let logDoc;
    if (existingLog) {
      // Patch the existing log
      await db.patch(existingLog._id, {
        answers,
        score,
        updatedAt: Date.now(),
      });
      logDoc = await db.get(existingLog._id);
    } else {
      // Insert a new log
      const newLogId = await db.insert("logs", {
        userId,
        date,
        answers,
        score,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      logDoc = await db.get(newLogId);
    }

    // --- Trigger forecast generation automatically ---
    // (Removed: db.runAction, as this is not supported in Convex mutations)
    return logDoc;
  },
});

// Helper query to get log count for a user
export const getLogCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("logs")
      .withIndex("byUserDate", (q) => q.eq("userId", args.userId))
      .collect();
    
    return logs.length;
  },
});

export const listScores = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return db
      .query("logs")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect()
      .then((docs) =>
        docs.map((d) => ({
          date: d.date,                 // must be "YYYY-MM-DD"
          score: d.score ?? null,
        }))
      );
  },
});

// Debugging helper: Show all logs for a user
export const listAllUserLogs = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const logs = await db
      .query("logs")
      .withIndex("byUserDate", (q) => q.eq("userId", userId))
      .collect();
    
    return logs.map(log => ({
      _id: log._id,
      userId: log.userId,
      date: log.date,
      createdAt: new Date(log.createdAt).toISOString(),
    }));
  },
});

// Debugging helper: Get log details by ID
export const getLogById = query({
  args: { logId: v.string() },
  handler: async ({ db }, { logId }) => {
    try {
      // Try to convert to a valid ID
      // Assuming logId might or might not be a full Id string like "logs/abcdef"
      // If it's just "abcdef", db.get might need it to be prefixed or it might handle it.
      // However, the core issue is the type, Id<"logs"> is correct.
      const id = logId as Id<"logs">; // Directly cast to Id<"logs">
      return await db.get(id);
    } catch (err) {
      console.error("Error getting log by ID:", err);
      // It's possible the ID string format is incorrect or document doesn't exist.
      // Returning null is a reasonable way to handle this.
      return null;
    }
  },
});