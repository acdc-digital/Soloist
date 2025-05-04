import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAttributes = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return await db
      .query("userAttributes")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const setAttributes = mutation({
  args: { userId: v.string(), attributes: v.any() },
  handler: async ({ db }, { userId, attributes }) => {
    const existing = await db
      .query("userAttributes")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await db.patch(existing._id, { attributes, updatedAt: Date.now() });
    } else {
      await db.insert("userAttributes", { userId, attributes, updatedAt: Date.now() });
    }
  },
});