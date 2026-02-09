import { query } from "./_generated/server";
import { v } from "convex/values";

async function resolvePhotoUrl(ctx: any, coAuthor: any) {
  let resolvedPhotoUrl = coAuthor.photoUrl || null;
  if (coAuthor.photoStorageId) {
    const storageUrl = await ctx.storage.getUrl(coAuthor.photoStorageId);
    if (storageUrl) resolvedPhotoUrl = storageUrl;
  }
  return { ...coAuthor, photoUrl: resolvedPhotoUrl };
}

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const coAuthors = await ctx.db
      .query("coAuthors")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    const sorted = coAuthors.sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(sorted.map((ca) => resolvePhotoUrl(ctx, ca)));
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const coAuthors = await ctx.db.query("coAuthors").collect();
    const sorted = coAuthors.sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(sorted.map((ca) => resolvePhotoUrl(ctx, ca)));
  },
});

export const getById = query({
  args: { id: v.id("coAuthors") },
  handler: async (ctx, args) => {
    const coAuthor = await ctx.db.get(args.id);
    if (!coAuthor) return null;
    return resolvePhotoUrl(ctx, coAuthor);
  },
});
