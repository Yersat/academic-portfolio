import { query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getNextInvoiceId = internalMutation({
  args: {},
  handler: async (ctx) => {
    const counter = await ctx.db.query("invoiceCounter").first();
    if (!counter) {
      await ctx.db.insert("invoiceCounter", { value: 1 });
      return 1;
    }
    const nextValue = counter.value + 1;
    await ctx.db.patch(counter._id, { value: nextValue });
    return nextValue;
  },
});

export const createOrder = internalMutation({
  args: {
    bookId: v.id("books"),
    email: v.string(),
    amount: v.float64(),
    currency: v.union(v.literal("KZT"), v.literal("RUB")),
    robokassaInvoiceId: v.float64(),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      bookId: args.bookId,
      email: args.email,
      amount: args.amount,
      currency: args.currency,
      status: "PENDING",
      robokassaInvoiceId: args.robokassaInvoiceId,
      downloadCount: 0,
    });

    await ctx.db.insert("orderEvents", {
      orderId,
      eventType: "CREATED",
      details: JSON.stringify({
        bookId: args.bookId,
        email: args.email,
        amount: args.amount,
        currency: args.currency,
        invId: args.robokassaInvoiceId,
      }),
    });

    return orderId;
  },
});

export const processPayment = internalMutation({
  args: {
    orderId: v.id("orders"),
    invId: v.float64(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Idempotency: already paid
    if (order.status === "PAID") {
      return { alreadyPaid: true };
    }

    // Generate download token (32 hex chars)
    const tokenBytes = new Uint8Array(16);
    crypto.getRandomValues(tokenBytes);
    const downloadToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const downloadTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.patch(args.orderId, {
      status: "PAID",
      robokassaSignature: args.signature,
      downloadToken,
      downloadTokenExpiry,
    });

    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      eventType: "PAYMENT_SUCCESS",
      details: JSON.stringify({
        invId: args.invId,
        downloadToken,
        downloadTokenExpiry,
      }),
    });

    return { alreadyPaid: false };
  },
});

export const markFailed = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;

    // Don't overwrite PAID status
    if (order.status === "PAID") return;

    await ctx.db.patch(args.orderId, { status: "FAILED" });

    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      eventType: "PAYMENT_FAILED",
      details: JSON.stringify({ reason: "User cancelled or payment failed" }),
    });
  },
});

export const createOrderEvent = internalMutation({
  args: {
    orderId: v.id("orders"),
    eventType: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      eventType: args.eventType,
      details: args.details,
    });
  },
});

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

export const getOrderWithBook = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const book = await ctx.db.get(order.bookId);
    if (!book) return null;

    return { ...order, bookTitle: book.title };
  },
});

export const listOrders = query({
  args: {},
  handler: async (ctx) => {
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
