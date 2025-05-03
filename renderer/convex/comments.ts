import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all comments for a specific feed
export const getByFeedId = query({
  args: { feedId: v.id("feed") },
  handler: async (ctx, args) => {
    // Get the feed document
    const feed = await ctx.db.get(args.feedId);
    
    // If feed doesn't exist or has no comments, return empty array
    if (!feed || !feed.comments) {
      return [];
    }
    
    // Return the comments array with IDs based on array index
    return feed.comments.map((comment, index) => ({
      ...comment,
      _id: `${args.feedId}_${index}`, // Create a synthetic ID
    }));
  },
});

// Create a new comment
export const create = mutation({
  args: {
    feedId: v.id("feed"),
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the user from the auth identity
    const identity = await ctx.auth.getUserIdentity();
    
    // Optional: verify that the user has permission to comment
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get the feed document
    const feed = await ctx.db.get(args.feedId);
    if (!feed) {
      throw new Error("Feed not found");
    }
    
    // Create the new comment object
    const newComment = {
      userId: args.userId,
      userName: args.userName,
      userImage: args.userImage,
      content: args.content,
      createdAt: Date.now(),
    };
    
    // Append to existing comments array or create a new array
    const updatedComments = feed.comments ? [...feed.comments, newComment] : [newComment];
    
    // Update the feed document with the new comments array
    await ctx.db.patch(args.feedId, {
      comments: updatedComments,
    });
    
    // Return a synthetic ID for the new comment
    return `${args.feedId}_${updatedComments.length - 1}`;
  },
});

// Delete a comment (optional)
export const remove = mutation({
  args: { 
    feedId: v.id("feed"),
    commentIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the user from the auth identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get the feed document
    const feed = await ctx.db.get(args.feedId);
    if (!feed || !feed.comments || !feed.comments[args.commentIndex]) {
      throw new Error("Comment not found");
    }
    
    // Get the comment
    const comment = feed.comments[args.commentIndex];
    
    // Make sure the user is authorized (either the comment author or an admin)
    if (identity.tokenIdentifier !== comment.userId) {
      throw new Error("Unauthorized");
    }
    
    // Create a new comments array without this comment
    const updatedComments = feed.comments.filter((_, index) => index !== args.commentIndex);
    
    // Update the feed document
    await ctx.db.patch(args.feedId, {
      comments: updatedComments,
    });
  },
});