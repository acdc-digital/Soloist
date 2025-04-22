// USERS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/convex/users.ts

import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { DatabaseWriter } from "./_generated/server"; 

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return ctx.db.query("users").filter((q) => q.eq(q.field("authId"), userId)).first();
  },
});

export const getUser = query({
  args: { id: v.string() },
  handler: async ({ db }, { id }) => {
    if (!id) {
      return null;
    }
    return db.query("users").filter((q) => q.eq(q.field("authId"), id)).first();
  },
});

export const upsertUser = mutation({
    args: {
      authId: v.string(),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
    },
    handler: async ({ db }, { authId, name, email, image }) => {
      console.log("--- upsertUser MUTATION EXECUTING ---");
      console.log("Arguments received:", { authId, name, email, image });
  
      // First check by authId (most reliable way to find existing user)
      let existingUser: Doc<"users"> | null = await db.query("users")
        .withIndex("byAuthId", (q) => q.eq("authId", authId))
        .first();
      
      // If not found by authId, and we have an email, try that as fallback
      if (!existingUser && email) {
        existingUser = await db.query("users")
          .withIndex("byEmail", (q) => q.eq("email", email))
          .first();
      }
  
      if (existingUser) {
        console.log("User found, patching:", existingUser._id);
        // Patch existing user, explicitly setting authId and other fields
        const patchPayload: Partial<Doc<"users">> = {}; // Only update what's provided
        
        // Only include fields that need updating
        if (authId !== existingUser.authId) patchPayload.authId = authId;
        if (name !== undefined && name !== existingUser.name) patchPayload.name = name;
        if (email !== undefined && email !== existingUser.email) patchPayload.email = email;
        if (image !== undefined && image !== existingUser.image) patchPayload.image = image;
  
        // Only update if there are changes
        if (Object.keys(patchPayload).length > 0) {
          console.log("Patching user with payload:", patchPayload);
          await db.patch(existingUser._id, patchPayload);
          const updatedUser = await db.get(existingUser._id);
          console.log("Updated user after patch:", updatedUser);
          return updatedUser;
        } else {
          console.log("No changes to user, returning existing user");
          return existingUser;
        }
      } else {
        console.log("No existing user found, creating new user with authId:", authId);
        const newUser: { authId: string; name?: string; email?: string; image?: string } = {
          authId,
        };
        if (name !== undefined) {
          newUser.name = name;
        }
        if (email !== undefined) {
          newUser.email = email;
        }
        if (image !== undefined) {
          newUser.image = image;
        }
  
        console.log("Inserting new user:", newUser);
        const newUserId: Id<"users"> = await db.insert("users", newUser);
        const insertedUser = await db.get(newUserId);
        console.log("Inserted user:", insertedUser);
        return insertedUser;
      }
    },
  });

// Utility to fix users missing authId (if needed)
export const fixMissingAuthId = mutation({
    args: {},
    handler: async ({ db }: { db: DatabaseWriter }) => {
      const usersWithoutAuthId = await db.query("users")
        .filter((q) => q.eq(q.field("authId"), undefined))
        .collect();
  
      for (const user of usersWithoutAuthId) {
        const newAuthId = (db as any).generateId("users");
        await db.patch(user._id, { authId: newAuthId });
        console.log(`Updated user ${user._id} with authId: ${newAuthId}`);
      }
      if (usersWithoutAuthId.length === 0) {
        console.log("No users found missing authId.");
      }
    },
  });