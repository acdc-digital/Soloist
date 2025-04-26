// USERS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/convex/users.ts

import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";

/* ────────────────────────────────────────────────────────── */
/*  queries                                                   */
/* ────────────────────────────────────────────────────────── */

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", userId.split("|")[0]))
      .first();
  },
});

export const getUser = query({
  args: { id: v.string() },
  handler: async ({ db }, { id }) => {
    if (!id) return null;
    return db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", id))
      .first();
  },
});

/* ────────────────────────────────────────────────────────── */
/*  mutation: upsertUser                                      */
/* ────────────────────────────────────────────────────────── */

export const upsertUser = mutation({
  args: {
    authId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async ({ db }, { authId, name, email, image }) => {
    /* 1️⃣ Guard against empty IDs */
    if (!authId || authId.trim() === "") {
      console.log("[upsertUser] aborted – missing authId");
      return null;
    }

    const stableAuthId = authId.split("|")[0];

    /* 2️⃣ Lookup by stable authId */
    let existingUser: Doc<"users"> | null = await db
      .query("users")
      .withIndex("byAuthId", (q) => q.eq("authId", stableAuthId))
      .first();

    /* 3️⃣ Fallback lookup by e-mail */
    if (!existingUser && email) {
      existingUser = await db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .first();
    }

    /* 4️⃣ NEW – check for an orphan row whose _id === stableAuthId */
    if (!existingUser) {
      try {
        const orphan = await db.get(stableAuthId as Id<"users">);
        if (orphan) existingUser = orphan;
      } catch {
        /* nothing at that _id – safe to ignore */
      }
    }

    /* 5️⃣ Patch or insert */
    if (existingUser) {
      const patch: Partial<Doc<"users">> = {};

      if (existingUser.authId !== stableAuthId) patch.authId = stableAuthId;
      if (name !== undefined && name !== existingUser.name) patch.name = name;
      if (email !== undefined && email !== existingUser.email) patch.email = email;
      if (image !== undefined && image !== existingUser.image) patch.image = image;

      if (Object.keys(patch).length) {
        await db.patch(existingUser._id, patch);
        existingUser = await db.get(existingUser._id);
      }
      return existingUser;
    }

    /* — insert new — */
    const newUserId: Id<"users"> = await db.insert("users", {
      authId: stableAuthId,
      name,
      email,
      image,
    });
    return await db.get(newUserId);
  },
});