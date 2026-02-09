import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("books")
      .withIndex("by_isPublished", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdInternal = internalQuery({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPreviewPages = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query("bookPreviewPages")
      .withIndex("by_bookId", (q) => q.eq("bookId", args.bookId))
      .collect();

    const sorted = pages.sort((a, b) => a.sortOrder - b.sortOrder);

    const pagesWithUrls = await Promise.all(
      sorted.map(async (page) => ({
        _id: page._id,
        sortOrder: page.sortOrder,
        imageUrl: await ctx.storage.getUrl(page.imageStorageId),
      }))
    );

    return pagesWithUrls;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("books").order("desc").collect();
  },
});
