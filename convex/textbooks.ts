import { query } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const textbooks = await ctx.db
      .query("textbooks")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return textbooks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const textbooks = await ctx.db.query("textbooks").collect();
    return textbooks.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});
