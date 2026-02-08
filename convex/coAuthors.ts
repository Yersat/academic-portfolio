import { query } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const coAuthors = await ctx.db
      .query("coAuthors")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return coAuthors.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const coAuthors = await ctx.db.query("coAuthors").collect();
    return coAuthors.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getById = query({
  args: { id: v.id("coAuthors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
