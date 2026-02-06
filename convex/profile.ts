import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Profile ----

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("profile").first();
  },
});

export const getProfiles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("profile").collect();
  },
});

export const getProfileBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profile")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("profile"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    extendedBio: v.optional(v.string()),
    researchInterests: v.optional(v.array(v.string())),
    university: v.optional(v.string()),
    email: v.optional(v.string()),
    location: v.optional(v.string()),
    cvUrl: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const { sessionToken, id, ...updates } = args;
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(id, cleanUpdates);
    }
  },
});

// ---- Media Items ----

export const listMedia = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("mediaItems")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

export const listAllMedia = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mediaItems").order("desc").collect();
  },
});

export const createMedia = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    date: v.string(),
    type: v.union(
      v.literal("Lecture"),
      v.literal("Interview"),
      v.literal("Conference"),
      v.literal("Talk")
    ),
    description: v.string(),
    videoUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    status: v.union(v.literal("published"), v.literal("draft")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const { sessionToken, ...mediaData } = args;
    return await ctx.db.insert("mediaItems", mediaData);
  },
});

export const updateMedia = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("mediaItems"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Lecture"),
        v.literal("Interview"),
        v.literal("Conference"),
        v.literal("Talk")
      )
    ),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("published"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const { sessionToken, id, ...updates } = args;
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(id, cleanUpdates);
    }
  },
});

export const deleteMedia = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("mediaItems"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// ---- Research Papers ----

export const listResearch = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("researchPapers")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

export const listAllResearch = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("researchPapers").order("desc").collect();
  },
});

export const createResearch = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    year: v.string(),
    journal: v.optional(v.string()),
    authors: v.string(),
    pdfUrl: v.optional(v.string()),
    abstract: v.string(),
    status: v.union(v.literal("published"), v.literal("draft")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const { sessionToken, ...paperData } = args;
    return await ctx.db.insert("researchPapers", paperData);
  },
});

export const updateResearch = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("researchPapers"),
    title: v.optional(v.string()),
    year: v.optional(v.string()),
    journal: v.optional(v.string()),
    authors: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    abstract: v.optional(v.string()),
    status: v.optional(v.union(v.literal("published"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const { sessionToken, id, ...updates } = args;
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    if (Object.keys(cleanUpdates).length > 0) {
      await ctx.db.patch(id, cleanUpdates);
    }
  },
});

export const deleteResearch = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("researchPapers"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
