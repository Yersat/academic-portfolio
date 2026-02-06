import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generatePaymentUrl } from '../lib/robokassa.js';

const router = Router();

// Validation schema
const checkoutSchema = z.object({
    bookId: z.string().min(1, 'ID книги обязателен'),
    email: z.string().email('Неверный формат email')
});

/**
 * POST /api/checkout/pdf
 * Create order and redirect to Robokassa
 */
router.post('/pdf', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;

        // Validate input
        const validation = checkoutSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: validation.error.errors[0].message
            });
        }

        const { bookId, email } = validation.data;

        // Get book
        const book = await prisma.book.findUnique({
            where: { id: bookId }
        });

        if (!book) {
            return res.status(404).json({ error: 'Книга не найдена' });
        }

        if (!book.isPublished) {
            return res.status(400).json({ error: 'Книга недоступна для покупки' });
        }

        if (!book.pdfPrice || book.pdfPrice <= 0) {
            return res.status(400).json({ error: 'PDF версия недоступна для этой книги' });
        }

        if (!book.pdfFilePath) {
            return res.status(400).json({ error: 'PDF файл не загружен' });
        }

        // Generate unique invoice ID (Robokassa requires numeric)
        const counter = await prisma.invoiceCounter.upsert({
            where: { id: 'invoice_counter' },
            create: { id: 'invoice_counter', value: 1 },
            update: { value: { increment: 1 } }
        });

        const invId = counter.value;

        // Create order
        const order = await prisma.order.create({
            data: {
                bookId: book.id,
                email,
                amount: book.pdfPrice,
                currency: book.pdfCurrency,
                status: 'PENDING',
                robokassaInvoiceId: invId,
                events: {
                    create: {
                        eventType: 'CREATED',
                        details: JSON.stringify({ email, bookTitle: book.title })
                    }
                }
            }
        });

        // Generate Robokassa payment URL
        const redirectUrl = generatePaymentUrl({
            outSum: book.pdfPrice,
            invId,
            description: `Покупка PDF: ${book.title}`.substring(0, 100),
            email,
            customParams: {
                Shp_orderId: order.id
            }
        });

        // Log payment initiation
        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                eventType: 'PAYMENT_INITIATED',
                details: JSON.stringify({ invId, redirectUrl })
            }
        });

        res.json({
            redirectUrl,
            orderId: order.id,
            message: 'Перенаправление на страницу оплаты...'
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Ошибка при создании заказа' });
    }
});

export default router;
