import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

async function verifyAdmin(ctx: any, sessionToken: string) {
  const valid = await ctx.runQuery(internal.auth.verifySession, {
    sessionToken,
  });
  if (!valid) {
    throw new Error("Unauthorized");
  }
}

// ---- Books ----

export const createBook = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    year: v.string(),
    publisher: v.string(),
    isbn: v.string(),
    coverImage: v.string(),
    description: v.string(),
    abstract: v.string(),
    toc: v.optional(v.array(v.string())),
    status: v.union(v.literal("published"), v.literal("draft")),
    litresUrl: v.optional(v.string()),
    pdfPrice: v.optional(v.float64()),
    pdfCurrency: v.union(v.literal("KZT"), v.literal("RUB")),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("books")
      .withIndex("by_isbn", (q) => q.eq("isbn", args.isbn))
      .first();
    if (existing) {
      throw new Error("Книга с таким ISBN уже существует");
    }

    const { sessionToken, ...bookData } = args;
    return await ctx.db.insert("books", bookData);
  },
});

export const updateBook = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("books"),
    title: v.optional(v.string()),
    year: v.optional(v.string()),
    publisher: v.optional(v.string()),
    isbn: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    description: v.optional(v.string()),
    abstract: v.optional(v.string()),
    toc: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("published"), v.literal("draft"))),
    litresUrl: v.optional(v.string()),
    pdfPrice: v.optional(v.float64()),
    pdfCurrency: v.optional(v.union(v.literal("KZT"), v.literal("RUB"))),
    isPublished: v.optional(v.boolean()),
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

export const deleteBook = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("books"),
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

export const generateUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const attachPdf = mutation({
  args: {
    sessionToken: v.string(),
    bookId: v.id("books"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookId, { pdfStorageId: args.storageId });
  },
});

// ---- Book Preview Pages ----

export const createPreviewPage = mutation({
  args: {
    sessionToken: v.string(),
    bookId: v.id("books"),
    imageStorageId: v.id("_storage"),
    sortOrder: v.float64(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const { sessionToken, ...pageData } = args;
    return await ctx.db.insert("bookPreviewPages", pageData);
  },
});

export const deletePreviewPage = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("bookPreviewPages"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const page = await ctx.db.get(args.id);
    if (page) {
      await ctx.storage.delete(page.imageStorageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const reorderPreviewPages = mutation({
  args: {
    sessionToken: v.string(),
    pageIds: v.array(v.id("bookPreviewPages")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    for (let i = 0; i < args.pageIds.length; i++) {
      await ctx.db.patch(args.pageIds[i], { sortOrder: i });
    }
  },
});

// ---- Co-Authors ----

export const createCoAuthor = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    cvEntries: v.array(
      v.object({
        year: v.string(),
        role: v.string(),
        context: v.string(),
      })
    ),
    publications: v.optional(v.string()),
    researchDirections: v.optional(v.string()),
    indexingProfiles: v.optional(
      v.array(v.object({ name: v.string(), url: v.string() }))
    ),
    awards: v.optional(v.string()),
    sortOrder: v.float64(),
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

    const { sessionToken, ...data } = args;
    return await ctx.db.insert("coAuthors", data);
  },
});

export const updateCoAuthor = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("coAuthors"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    cvEntries: v.optional(
      v.array(
        v.object({
          year: v.string(),
          role: v.string(),
          context: v.string(),
        })
      )
    ),
    publications: v.optional(v.string()),
    researchDirections: v.optional(v.string()),
    indexingProfiles: v.optional(
      v.array(v.object({ name: v.string(), url: v.string() }))
    ),
    awards: v.optional(v.string()),
    sortOrder: v.optional(v.float64()),
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

export const deleteCoAuthor = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("coAuthors"),
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

// ---- Gallery Photos ----

export const createGalleryPhoto = mutation({
  args: {
    sessionToken: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageId: v.id("_storage"),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    sortOrder: v.float64(),
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

    const { sessionToken, ...data } = args;
    return await ctx.db.insert("galleryPhotos", data);
  },
});

export const updateGalleryPhoto = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("galleryPhotos"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    sortOrder: v.optional(v.float64()),
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

export const deleteGalleryPhoto = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("galleryPhotos"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    const photo = await ctx.db.get(args.id);
    if (photo) {
      await ctx.storage.delete(photo.imageStorageId);
    }
    await ctx.db.delete(args.id);
  },
});
