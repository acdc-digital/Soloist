// FORECASTS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/convex/forecast.ts

import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// 1) listForecasts: get the 7‑day forecast for a user, ordered by date asc
export const listForecasts = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("forecast")
      .filter(q => q.eq(q.field("userId"), userId))
      .order("asc")
      .collect();
  },
});

// 2) getForecast: fetch a single day’s forecast
export const getForecast = query({
  args: { userId: v.string(), date: v.string() },
  handler: async ({ db }, { userId, date }) => {
    return await db
      .query("forecast")
      .filter(q =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("date"), date)
        )
      )
      .first();
  },
});

// 3) storeForecast: low‑level mutation for inserting or upserting
export const storeForecast = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    emotionScore: v.number(),
    trend: v.string(),
    description: v.string(),
    recommendation: v.string(),
  },
  handler: async ({ db }, data) => {
    // upsert style: delete existing, then insert
    await db
      .query("forecast")
      .filter(q =>
        q.and(
          q.eq(q.field("userId"), data.userId),
          q.eq(q.field("date"), data.date)
        )
      )
      .delete();
    return db.insert("forecast", {
      ...data,
      createdAt: Date.now(),
    });
  },
});

// 4) generateForecast: core action that pulls logs, computes forecast, and stores it
export const generateForecast = action({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const db = ctx.db;
    // 1) fetch the last 8 days of logs (we need 7‑day forecast: today + 6 future days)
    //    but for algorithm, pull last N entries (e.g. 14) to compute trend/inertia.
    const rawLogs = await db
      .query("logs")
      .filter(q => q.eq(q.field("userId"), userId))
      .order("desc")
      .limit(14)
      .collect();

    // require at least 7 days of history before forecasting
    if (rawLogs.length < 7) return;

    // normalize and sort ascending by date
    const logs = rawLogs
      .filter((l) => typeof l.score === "number")
      .map((l) => ({ date: l.date, score: l.score! }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // helper: compute weighted avg with recency bias
    function weightedAverage(scores: number[]) {
      const n = scores.length;
      // weight[i] = (i+1)/sum(1..n) so most recent has highest weight
      const total = (n * (n + 1)) / 2;
      return scores.reduce((sum, s, i) => sum + s * (i + 1) / total, 0);
    }

    // compute base forecast (for next day) from last 7 scores
    const last7 = logs.slice(-7).map((l) => l.score);
    const base = Math.round(weightedAverage(last7));

    // compute trend: compare avg of last 3 vs previous 3
    const recent3 = logs.slice(-3).map((l) => l.score);
    const prev3 = logs.slice(-6, -3).map((l) => l.score);
    const avgRecent3 = recent3.reduce((a,b)=>a+b,0)/3;
    const avgPrev3 = prev3.reduce((a,b)=>a+b,0)/3;
    const trend = avgRecent3 > avgPrev3 + 2
      ? "up"
      : avgRecent3 < avgPrev3 - 2
      ? "down"
      : "stable";

    // description & recommendation templates by bucket
    const buckets = [
      { min: 90, desc: "Exceptional Day", rec: "Keep riding this high energy—plan something meaningful!" },
      { min: 75, desc: "Positive Outlook", rec: "Great momentum—tackle your biggest priority with confidence." },
      { min: 50, desc: "Balanced & Productive", rec: "Stay steady—mix focused work with short breaks." },
      { min: 25, desc: "Challenging Day Ahead", rec: "Plan buffer time and a relaxing activity this afternoon." },
      { min: 0,  desc: "Tough Day Expected", rec: "Lean on self‑care: try journaling or take a brief walk." },
    ];
    const { description, recommendation } =
      buckets.find(b => base >= b.min)!;

    // prepare 7‑day dates from today
    const today = new Date();
    const dates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10); // YYYY‑MM‑DD
    });

    // 5) store a forecast row for each of the 7 days (we keep same base for simplicity)
    for (const date of dates) {
      await ctx.runMutation(api.forecast.storeForecast, {
        userId,
        date,
        emotionScore: base,
        trend,
        description,
        recommendation,
      });
    }
  },
});