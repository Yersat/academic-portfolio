"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { Doc } from "./_generated/dataModel";
import crypto from "crypto";

function md5(str: string): string {
  return crypto.createHash("md5").update(str, "utf8").digest("hex");
}

export const initiatePdfCheckout = action({
  args: {
    bookId: v.id("books"),
    email: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ redirectUrl: string; orderId: string; message: string }> => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Некорректный email адрес");
    }

    // Get book
    const book: Doc<"books"> | null = await ctx.runQuery(
      internal.books.getByIdInternal,
      {
        id: args.bookId,
      }
    );
    if (!book) {
      throw new Error("Книга не найдена");
    }
    if (!book.isPublished) {
      throw new Error("Книга недоступна для покупки");
    }
    if (!book.pdfPrice || book.pdfPrice <= 0) {
      throw new Error("PDF версия недоступна для покупки");
    }
    if (!book.pdfStorageId) {
      throw new Error("PDF файл не загружен");
    }

    // Get next invoice ID (atomic)
    const invId: number = await ctx.runMutation(
      internal.orders.getNextInvoiceId,
      {}
    );

    // Create order
    const orderId: Id<"orders"> = await ctx.runMutation(
      internal.orders.createOrder,
      {
        bookId: args.bookId,
        email: args.email,
        amount: book.pdfPrice,
        currency: book.pdfCurrency,
        robokassaInvoiceId: invId,
      }
    );

    // Generate Robokassa payment URL
    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN!;
    const password1 = process.env.ROBOKASSA_PASSWORD1!;
    const testMode = process.env.ROBOKASSA_TEST_MODE === "1";
    const baseUrl =
      process.env.ROBOKASSA_BASE_URL ||
      "https://auth.robokassa.ru/Merchant/Index.aspx";

    const outSum = book.pdfPrice.toFixed(2);
    const shpString = `Shp_orderId=${orderId}`;
    const signatureBase = `${merchantLogin}:${outSum}:${invId}:${password1}:${shpString}`;
    const signature = md5(signatureBase);

    const url = new URL(baseUrl);
    url.searchParams.set("MerchantLogin", merchantLogin);
    url.searchParams.set("OutSum", outSum);
    url.searchParams.set("InvId", invId.toString());
    url.searchParams.set(
      "Description",
      `Покупка PDF: ${book.title}`.substring(0, 100)
    );
    url.searchParams.set("SignatureValue", signature);
    url.searchParams.set("Email", args.email);
    url.searchParams.set("Shp_orderId", orderId);
    if (testMode) url.searchParams.set("IsTest", "1");

    // Log payment initiation
    await ctx.runMutation(internal.orders.createOrderEvent, {
      orderId,
      eventType: "PAYMENT_INITIATED",
      details: JSON.stringify({ invId, redirectUrl: url.toString() }),
    });

    return {
      redirectUrl: url.toString(),
      orderId,
      message: "Перенаправление на страницу оплаты...",
    };
  },
});
