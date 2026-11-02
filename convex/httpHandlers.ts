import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
