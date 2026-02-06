import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const robokassaResult = httpAction(async (ctx, request) => {
  // Parse params from both URL query and body
  const url = new URL(request.url);
  const bodyText = await request.text();
  const bodyParams = new URLSearchParams(bodyText);

  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  bodyParams.forEach((v, k) => {
    params[k] = v;
  });

  const { OutSum, InvId, SignatureValue, Shp_orderId } = params;

  if (!OutSum || !InvId || !SignatureValue || !Shp_orderId) {
    return new Response("ERROR: Missing params", { status: 400 });
  }

  const orderId = Shp_orderId as Id<"orders">;

  // Log callback received
  await ctx.runMutation(internal.orders.createOrderEvent, {
    orderId,
    eventType: "CALLBACK_RECEIVED",
    details: JSON.stringify(params),
  });

  // Verify signature using Password2 (runs in Node.js runtime)
  const isValid = await ctx.runAction(internal.crypto.verifyRobokassaSignature, {
    outSum: OutSum,
    invId: InvId,
    signatureValue: SignatureValue,
    shpOrderId: Shp_orderId,
  });

  if (!isValid) {
    await ctx.runMutation(internal.orders.createOrderEvent, {
      orderId,
      eventType: "PAYMENT_FAILED",
      details: JSON.stringify({ reason: "Invalid signature" }),
    });
    return new Response("ERROR: Invalid signature", { status: 400 });
  }

  // Process payment
  const result = await ctx.runMutation(internal.orders.processPayment, {
    orderId,
    invId: parseInt(InvId),
    signature: SignatureValue,
  });

  if (result.alreadyPaid) {
    return new Response(`OK${InvId}`, { status: 200 });
  }

  // Send email with download link
  await ctx.runAction(internal.email.sendDownloadEmail, {
    orderId,
  });

  return new Response(`OK${InvId}`, { status: 200 });
});

export const robokassaSuccess = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("Shp_orderId") || "";
  const frontendOrigin =
    process.env.FRONTEND_ORIGIN || "http://localhost:3000";

  const redirectUrl = orderId
    ? `${frontendOrigin}/#/payment/success?orderId=${orderId}`
    : `${frontendOrigin}/#/payment/success`;

  return Response.redirect(redirectUrl, 302);
});

export const robokassaFail = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("Shp_orderId") || "";
  const frontendOrigin =
    process.env.FRONTEND_ORIGIN || "http://localhost:3000";

  if (orderId) {
    try {
      await ctx.runMutation(internal.orders.markFailed, {
        orderId: orderId as Id<"orders">,
      });
    } catch {
      // Order might not exist, continue with redirect
    }
  }

  return Response.redirect(
    `${frontendOrigin}/#/payment/fail?orderId=${orderId}`,
    302
  );
});

export const serveDownload = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const token = url.searchParams.get("token");

  if (!orderId || !token) {
    return new Response("Отсутствуют необходимые параметры", { status: 400 });
  }

  // Verify download token
  const order = await ctx.runQuery(internal.orders.getOrderForDownload, {
    orderId: orderId as Id<"orders">,
    token,
  });

  if (!order) {
    return new Response(
      "Ссылка для скачивания недействительна или истекла",
      { status: 403 }
    );
  }

  // Get book to find storageId
  const book = await ctx.runQuery(internal.books.getByIdInternal, {
    id: order.bookId,
  });

  if (!book?.pdfStorageId) {
    return new Response("Файл не найден", { status: 404 });
  }

  // Get signed storage URL and redirect
  const fileUrl = await ctx.storage.getUrl(book.pdfStorageId);
  if (!fileUrl) {
    return new Response("Файл недоступен", { status: 404 });
  }

  // Increment download count
  await ctx.runMutation(internal.orders.incrementDownloadCount, {
    orderId: orderId as Id<"orders">,
  });

  // Redirect to signed storage URL
  return Response.redirect(fileUrl, 302);
});
