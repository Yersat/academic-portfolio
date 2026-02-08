import { query } from "./_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const photos = await ctx.db
      .query("galleryPhotos")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    const sorted = photos.sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(
      sorted.map(async (photo) => ({
        ...photo,
        imageUrl: await ctx.storage.getUrl(photo.imageStorageId),
      }))
    );
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const photos = await ctx.db.query("galleryPhotos").collect();
    const sorted = photos.sort((a, b) => a.sortOrder - b.sortOrder);
    return Promise.all(
      sorted.map(async (photo) => ({
        ...photo,
        imageUrl: await ctx.storage.getUrl(photo.imageStorageId),
      }))
    );
  },
});

export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
