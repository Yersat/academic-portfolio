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
    // Verify admin session
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Unauthorized");
    }

    // Enforce unique ISBN
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

    // Filter out undefined values
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
