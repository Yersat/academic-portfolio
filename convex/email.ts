"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const sendDownloadEmail = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.orders.getOrderWithBook, {
      orderId: args.orderId,
    });
    if (!order || !order.downloadToken) return;

    const convexSiteUrl = process.env.CONVEX_SITE_URL || "";
    const downloadUrl = `${convexSiteUrl}/download?orderId=${order._id}&token=${order.downloadToken}`;

    const smtpHost = process.env.SMTP_HOST || "smtp.mail.ru";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFrom = process.env.SMTP_FROM || "Bilig <no-reply@bilig.kz>";

    // In development, just log the email
    if (!smtpUser || !smtpPass) {
      console.log("📧 [DEV] Email would be sent:");
      console.log(`   To: ${order.email}`);
      console.log(`   Subject: Ваш PDF: ${order.bookTitle}`);
      console.log(`   Download URL: ${downloadUrl}`);

      await ctx.runMutation(internal.orders.createOrderEvent, {
        orderId: args.orderId,
        eventType: "EMAIL_SENT",
        details: JSON.stringify({ email: order.email, dev: true }),
      });
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: order.email,
        subject: `Ваш PDF: ${order.bookTitle}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; color: #000; margin: 0; }
    .book-title { font-style: italic; color: #555; }
    .button {
      display: inline-block;
      background: #000;
      color: #fff !important;
      padding: 12px 24px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
      letter-spacing: 0.5px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #888;
    }
    .warning { color: #e74c3c; font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Спасибо за покупку!</h1>
    </div>

    <p>Здравствуйте!</p>

    <p>Ваш заказ успешно оплачен. Вы приобрели PDF-версию книги:</p>

    <p class="book-title"><strong>"${order.bookTitle}"</strong></p>

    <p>Нажмите на кнопку ниже, чтобы скачать вашу книгу:</p>

    <a href="${downloadUrl}" class="button">Скачать PDF</a>

    <p class="warning">Ссылка действительна 24 часа. Если ссылка истекла, свяжитесь с нами.</p>

    <div class="footer">
      <p>С уважением,<br>Команда Bilig</p>
      <p>Номер заказа: ${order._id}</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `
Спасибо за покупку!

Ваш заказ успешно оплачен. Вы приобрели PDF-версию книги "${order.bookTitle}".

Скачать PDF: ${downloadUrl}

Ссылка действительна 24 часа.

С уважением,
Команда Bilig

Номер заказа: ${order._id}
        `,
      });

      console.log(`📧 Email sent to ${order.email}`);

      await ctx.runMutation(internal.orders.createOrderEvent, {
        orderId: args.orderId,
        eventType: "EMAIL_SENT",
        details: JSON.stringify({ email: order.email }),
      });
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  },
});
