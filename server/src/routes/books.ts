import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get all published books
router.get('/', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;

        const books = await prisma.book.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' }
        });

        // Parse toc from JSON string
        const booksWithParsedToc = books.map(book => ({
            ...book,
            toc: book.toc ? JSON.parse(book.toc) : []
        }));

        res.json(booksWithParsedToc);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Не удалось загрузить книги' });
    }
});

// Get single book by id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const { id } = req.params;

        const book = await prisma.book.findUnique({
            where: { id }
        });

        if (!book) {
            return res.status(404).json({ error: 'Книга не найдена' });
        }

        // Parse toc from JSON string
        const bookWithParsedToc = {
            ...book,
            toc: book.toc ? JSON.parse(book.toc) : []
        };

        res.json(bookWithParsedToc);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Не удалось загрузить книгу' });
    }
});

export default router;
