import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * GET /api/orders/:orderId/download
 * Secure PDF download with token validation
 */
router.get('/:orderId/download', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const { orderId } = req.params;
        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Токен загрузки отсутствует' });
        }

        // Find order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { book: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        // Verify order is paid
        if (order.status !== 'PAID') {
            return res.status(403).json({ error: 'Заказ не оплачен' });
        }

        // Verify token
        if (order.downloadToken !== token) {
            return res.status(403).json({ error: 'Неверный токен загрузки' });
        }

        // Check token expiry
        if (order.downloadTokenExpiry && new Date() > order.downloadTokenExpiry) {
            return res.status(410).json({
                error: 'Ссылка на скачивание истекла. Свяжитесь с поддержкой.'
            });
        }

        // Get PDF file path
        const pdfPath = order.book.pdfFilePath;
        if (!pdfPath) {
            return res.status(404).json({ error: 'PDF файл не найден' });
        }

        // Resolve file path (relative to server/uploads or absolute)
        let absolutePath: string;
        if (path.isAbsolute(pdfPath)) {
            absolutePath = pdfPath;
        } else {
            absolutePath = path.join(process.cwd(), 'uploads', pdfPath);
        }

        // Check if file exists
        if (!fs.existsSync(absolutePath)) {
            console.error('PDF file not found:', absolutePath);
            return res.status(404).json({ error: 'PDF файл не найден на сервере' });
        }

        // Log download
        await prisma.order.update({
            where: { id: orderId },
            data: { downloadCount: { increment: 1 } }
        });

        await prisma.orderEvent.create({
            data: {
                orderId,
                eventType: 'DOWNLOAD',
                details: JSON.stringify({
                    downloadCount: order.downloadCount + 1,
                    ip: req.ip
                })
            }
        });

        // Send file
        const fileName = `${order.book.title.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g, '')}.pdf`;
        res.download(absolutePath, fileName, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Ошибка при скачивании файла' });
                }
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Ошибка при скачивании' });
    }
});

export default router;
