import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Profile ----

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const profile = await ctx.db.query("profile").first();
    if (!profile) return null;
    let profilePhotoUrl = null;
    let coverPhotoUrl = null;
    if (profile.profilePhotoStorageId) {
      profilePhotoUrl = await ctx.storage.getUrl(profile.profilePhotoStorageId);
    }
    if (profile.coverPhotoStorageId) {
      coverPhotoUrl = await ctx.storage.getUrl(profile.coverPhotoStorageId);
    }
    return { ...profile, profilePhotoUrl, coverPhotoUrl };
  },
});

export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    extendedBio: v.optional(v.string()),
    researchInterests: v.optional(v.array(v.string())),
    university: v.optional(v.string()),
    email: v.optional(v.string()),
    location: v.optional(v.string()),
    cvUrl: v.optional(v.string()),
    publications: v.optional(v.string()),
    researchDirections: v.optional(v.string()),
    indexingProfiles: v.optional(
      v.array(v.object({ name: v.string(), url: v.string() }))
    ),
    awards: v.optional(v.string()),
    profilePhotoPosition: v.optional(v.string()),
    coverPhotoStorageId: v.optional(v.id("_storage")),
    profilePhotoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const { sessionToken, ...updates } = args;
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    const profile = await ctx.db.query("profile").first();
    if (profile) {
      await ctx.db.patch(profile._id, cleanUpdates);
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

export const getResearchById = query({
  args: { id: v.id("researchPapers") },
  handler: async (ctx, args) => {
    const paper = await ctx.db.get(args.id);
    if (!paper) return null;

    let fileUrl = null;
    if (paper.fileStorageId) {
      fileUrl = await ctx.storage.getUrl(paper.fileStorageId);
    }

    if (paper.contentBlocks) {
      const resolvedBlocks = await Promise.all(
        paper.contentBlocks.map(async (block) => {
          if (block.type === "image" && block.imageStorageId) {
            const imageUrl = await ctx.storage.getUrl(block.imageStorageId);
            return { ...block, imageUrl };
          }
          return block;
        })
      );
      return { ...paper, contentBlocks: resolvedBlocks, fileUrl };
    }

    return { ...paper, fileUrl };
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
    category: v.optional(
      v.union(
        v.literal("reviewed_journals"),
        v.literal("collections"),
        v.literal("conferences"),
        v.literal("media_interviews")
      )
    ),
    pages: v.optional(v.string()),
    issueNumber: v.optional(v.string()),
    contentBlocks: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("paragraph"),
            v.literal("heading"),
            v.literal("image"),
            v.literal("quote")
          ),
          text: v.optional(v.string()),
          imageStorageId: v.optional(v.id("_storage")),
          imageCaption: v.optional(v.string()),
          level: v.optional(v.float64()),
        })
      )
    ),
    coverImageStorageId: v.optional(v.id("_storage")),
    fileStorageId: v.optional(v.id("_storage")),
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
    category: v.optional(
      v.union(
        v.literal("reviewed_journals"),
        v.literal("collections"),
        v.literal("conferences"),
        v.literal("media_interviews")
      )
    ),
    pages: v.optional(v.string()),
    issueNumber: v.optional(v.string()),
    contentBlocks: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("paragraph"),
            v.literal("heading"),
            v.literal("image"),
            v.literal("quote")
          ),
          text: v.optional(v.string()),
          imageStorageId: v.optional(v.id("_storage")),
          imageCaption: v.optional(v.string()),
          level: v.optional(v.float64()),
        })
      )
    ),
    coverImageStorageId: v.optional(v.id("_storage")),
    fileStorageId: v.optional(v.id("_storage")),
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
