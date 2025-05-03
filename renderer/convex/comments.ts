import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all comments for a specific feed
export const getByFeedId = query({
  args: { feedId: v.id("feeds") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("feedId"), args.feedId))
      .order("desc")
      .collect();
      
    return comments;
  },
});

// Create a new comment
export const create = mutation({
  args: {
    feedId: v.id("feeds"),
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
    
    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      feedId: args.feedId,
      userId: args.userId,
      userName: args.userName,
      userImage: args.userImage,
      content: args.content,
    });
    
    return commentId;
  },
});

// Delete a comment (optional)
export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    // Get the user from the auth identity
    const identity = await ctx.auth.getUserIdentity();
    
    // Get the comment
    const comment = await ctx.db.get(args.id);
    
    // Make sure the comment exists
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    // Make sure the user is authorized (either the comment author or an admin)
    if (!identity || identity.tokenIdentifier !== comment.userId) {
      throw new Error("Unauthorized");
    }
    
    // Delete the comment
    await ctx.db.delete(args.id);
  },
});