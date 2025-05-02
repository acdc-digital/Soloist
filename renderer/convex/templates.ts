import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// Define a custom question interface
type CustomQuestion = {
  id: string;
  question: string;
  type: "text" | "scale" | "yesno";
  answer?: string;
};

// Save a template
export const saveTemplate = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        type: v.union(v.literal("text"), v.literal("scale"), v.literal("yesno")),
        answer: v.optional(v.string())
      })
    )
  },
  handler: async (ctx, args) => {
    // Validate
    if (!args.name.trim()) {
      throw new ConvexError("Template name cannot be empty");
    }

    // Check if a template with this name already exists for this user
    const existingTemplate = await ctx.db
      .query("templates")
      .withIndex("by_name_and_user", q => 
        q.eq("name", args.name).eq("userId", args.userId)
      )
      .first();

    if (existingTemplate) {
      // Update existing template
      return await ctx.db.patch(existingTemplate._id, {
        questions: args.questions,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new template
      return await ctx.db.insert("templates", {
        name: args.name,
        userId: args.userId,
        questions: args.questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }
});

// Get user templates
export const getUserTemplates = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  }
});

// Get a specific template by ID
export const getTemplateById = query({
  args: {
    templateId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.templateId);
  }
});

// Delete a template
export const deleteTemplate = mutation({
  args: {
    templateId: v.string(),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    
    // Check if template exists and belongs to the user
    if (!template || template.userId !== args.userId) {
      throw new ConvexError("Template not found or you don't have permission to delete it");
    }
    
    await ctx.db.delete(args.templateId);
    return true;
  }
});