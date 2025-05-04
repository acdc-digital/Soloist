// FEEDBACK
// /Users/matthewsimon/Documents/Github/electron-nextjs-1/renderer/convex/feedback.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit feedback (thumbs up/down) for a feed item
 */
export const submitFeedback = mutation({
  args: {
    feedId: v.id("feed"),
    userId: v.string(),
    isLiked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { feedId, userId, isLiked } = args;
    
    // Get the feed document
    const feed = await ctx.db.get(feedId);
    
    // If feed doesn't exist, throw error
    if (!feed) {
      throw new Error("Feed not found");
    }
    
    // Create new feedback object
    const newFeedback = {
      userId,
      isLiked,
      createdAt: Date.now(),
    };
    
    // Get existing feedback array or initialize empty
    const feedback = feed.feedback || [];
    
    // Check if user has already provided feedback
    const existingFeedbackIndex = feedback.findIndex(f => f.userId === userId);
    
    // Update or add feedback
    if (existingFeedbackIndex >= 0) {
      // Replace existing feedback from this user
      feedback[existingFeedbackIndex] = newFeedback;
      await ctx.db.patch(feedId, { feedback });
    } else {
      // Add new feedback
      await ctx.db.patch(feedId, { 
        feedback: [...feedback, newFeedback] 
      });
    }
    
    return true;
  },
});

/**
 * Get feedback for a specific feed item
 */
export const getFeedback = query({
  args: {
    feedId: v.id("feed"),
  },
  handler: async (ctx, args) => {
    const feed = await ctx.db.get(args.feedId);
    
    if (!feed || !feed.feedback) {
      return [];
    }
    
    return feed.feedback;
  },
});

/**
 * Get feedback for a specific feed item filtered by user
 */
export const getUserFeedback = query({
  args: {
    feedId: v.id("feed"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { feedId, userId } = args;
    const feed = await ctx.db.get(feedId);
    
    if (!feed || !feed.feedback) {
      return null;
    }
    
    // Find feedback from this specific user
    const userFeedback = feed.feedback.find(f => f.userId === userId);
    return userFeedback || null;
  },
});