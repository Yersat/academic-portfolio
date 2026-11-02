import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const incrementDownloadCount = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;

    await ctx.db.patch(args.orderId, {
      downloadCount: order.downloadCount + 1,
    });

    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      eventType: "DOWNLOAD",
      details: JSON.stringify({ downloadCount: order.downloadCount + 1 }),
    });
  },
});

export const getOrderForDownload = internalQuery({
  args: {
    orderId: v.id("orders"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Verify token
    if (order.downloadToken !== args.token) return null;

    // Verify expiry
    if (!order.downloadTokenExpiry || order.downloadTokenExpiry < Date.now()) {
      return null;
    }

    // Verify paid
    if (order.status !== "PAID") return null;

    return order;
  },
});

export const listOrders = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session || session.expiresAt < Date.now()) return [];

    const orders = await ctx.db.query("orders").order("desc").collect();

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const book = await ctx.db.get(order.bookId);
        const events = await ctx.db
          .query("orderEvents")
          .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
          .order("desc")
          .take(5);
        return { ...order, book, events };
      })
    );

    return enriched;
  },
});
