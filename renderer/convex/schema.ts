// CONVEX SCHEMA
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
 
const schema = defineSchema({
  ...authTables,

  users: defineTable({
    authId: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    isAnonymous: v.optional(v.boolean()),
    githubId: v.optional(v.number()),
  })
  .index("email", ["email"])
  .index("byAuthId", ["authId"]),
  
  logs: defineTable({
    userId: v.string(),
    date: v.string(),
    answers: v.any(),
    score: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("byUserDate", ["userId", "date"]),

  feed: defineTable({
    userId: v.string(),
    date: v.string(),
    message: v.string(),
    createdAt: v.number(),
    comments: v.optional(v.array(v.object({
      userId: v.string(),
      userName: v.string(),
      userImage: v.optional(v.string()),
      content: v.string(),
      createdAt: v.number(),
    }))),
    feedback: v.optional(v.array(v.object({
      userId: v.string(),
      isLiked: v.boolean(),
      createdAt: v.number(),
    }))),
  }),

  forecast: defineTable({
    userId: v.string(),
    date: v.string(),
    emotionScore: v.number(),
    trend: v.string(),
    details: v.string(),
    description: v.string(),
    recommendation: v.string(),
    createdAt: v.number(),
    confidence: v.number(),
    basedOnDays: v.array(v.string()),
  })
  .index("byUserDate", ["userId", "date"]),

  userAttributes: defineTable({
    userId: v.string(),
    attributes: v.any(),
    updatedAt: v.number(),
  })
  .index("byUserId", ["userId"]),

  forecastFeedback: defineTable({
    userId: v.string(),
    forecastDate: v.string(),
    feedback: v.union(v.literal("up"), v.literal("down")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("byUserDate", ["userId", "forecastDate"]),

  // New table to store user instructions for random log generation
  randomizer: defineTable({
    userId: v.string(),
    instructions: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("byUserId", ["userId"]),

  // other tables...
});

export default schema;