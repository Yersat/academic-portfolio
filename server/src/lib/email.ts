import nodemailer from 'nodemailer';
import { Order, Book } from '@prisma/client';

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
}

function getConfig(): EmailConfig {
    return {
        host: process.env.SMTP_HOST || 'smtp.mail.ru',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_PORT === '465',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || 'Bilig <no-reply@bilig.kz>'
    };
}

function createTransporter() {
    const config = getConfig();

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass
        }
    });
}

interface OrderWithBook extends Order {
    book: Book;
}

/**
 * Send PDF download link email to customer
 */
export async function sendPdfDownloadEmail(
    order: OrderWithBook,
    downloadUrl: string
): Promise<boolean> {
    const config = getConfig();

    // In development, just log the email
    if (!config.user || !config.pass) {
        console.log('📧 [DEV] Email would be sent:');
        console.log(`   To: ${order.email}`);
        console.log(`   Subject: Ваш PDF: ${order.book.title}`);
        console.log(`   Download URL: ${downloadUrl}`);
        return true;
    }

    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: config.from,
            to: order.email,
            subject: `Ваш PDF: ${order.book.title}`,
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
    
    <p class="book-title"><strong>"${order.book.title}"</strong></p>
    
    <p>Нажмите на кнопку ниже, чтобы скачать вашу книгу:</p>
    
    <a href="${downloadUrl}" class="button">Скачать PDF</a>
    
    <p class="warning">Ссылка действительна 24 часа. Если ссылка истекла, свяжитесь с нами.</p>
    
    <div class="footer">
      <p>С уважением,<br>Команда Bilig</p>
      <p>Номер заказа: ${order.id}</p>
    </div>
  </div>
</body>
</html>
      `,
            text: `
Спасибо за покупку!

Ваш заказ успешно оплачен. Вы приобрели PDF-версию книги "${order.book.title}".

Скачать PDF: ${downloadUrl}

Ссылка действительна 24 часа.

С уважением,
Команда Bilig

Номер заказа: ${order.id}
      `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${order.email}`);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

export default {
    sendPdfDownloadEmail
};
