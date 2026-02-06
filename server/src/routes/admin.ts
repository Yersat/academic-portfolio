import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

const router = Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `book-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Только PDF файлы разрешены'));
        }
    }
});

// Validation schemas
const bookUpdateSchema = z.object({
    title: z.string().optional(),
    year: z.string().optional(),
    publisher: z.string().optional(),
    isbn: z.string().optional(),
    coverImage: z.string().optional(),
    description: z.string().optional(),
    abstract: z.string().optional(),
    toc: z.array(z.string()).optional(),
    status: z.enum(['published', 'draft']).optional(),
    litresUrl: z.string().url().optional().nullable(),
    pdfPrice: z.number().positive().optional().nullable(),
    pdfCurrency: z.enum(['KZT', 'RUB']).optional(),
    pdfFilePath: z.string().optional().nullable(),
    isPublished: z.boolean().optional()
});

const bookCreateSchema = z.object({
    title: z.string().min(1),
    year: z.string().min(1),
    publisher: z.string().min(1),
    isbn: z.string().min(1),
    coverImage: z.string().url(),
    description: z.string().min(1),
    abstract: z.string().min(1),
    toc: z.array(z.string()).optional(),
    status: z.enum(['published', 'draft']).default('draft'),
    litresUrl: z.string().url().optional().nullable(),
    pdfPrice: z.number().positive().optional().nullable(),
    pdfCurrency: z.enum(['KZT', 'RUB']).default('KZT'),
    pdfFilePath: z.string().optional().nullable(),
    isPublished: z.boolean().default(true)
});

/**
 * GET /api/admin/books
 * Get all books (including drafts) for admin
 */
router.get('/books', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;

        const books = await prisma.book.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const booksWithParsedToc = books.map(book => ({
            ...book,
            toc: book.toc ? JSON.parse(book.toc) : []
        }));

        res.json(booksWithParsedToc);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Ошибка при загрузке книг' });
    }
});

/**
 * POST /api/admin/books
 * Create a new book
 */
router.post('/books', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;

        const validation = bookCreateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: validation.error.errors[0].message
            });
        }

        const data = validation.data;

        const book = await prisma.book.create({
            data: {
                ...data,
                toc: data.toc ? JSON.stringify(data.toc) : null
            }
        });

        res.status(201).json({
            ...book,
            toc: book.toc ? JSON.parse(book.toc) : []
        });
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Ошибка при создании книги' });
    }
});

/**
 * PUT /api/admin/books/:id
 * Update a book
 */
router.put('/books/:id', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const { id } = req.params;

        const validation = bookUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: validation.error.errors[0].message
            });
        }

        const data = validation.data;

        const book = await prisma.book.update({
            where: { id },
            data: {
                ...data,
                toc: data.toc ? JSON.stringify(data.toc) : undefined
            }
        });

        res.json({
            ...book,
            toc: book.toc ? JSON.parse(book.toc) : []
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Ошибка при обновлении книги' });
    }
});

/**
 * DELETE /api/admin/books/:id
 * Delete a book
 */
router.delete('/books/:id', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const { id } = req.params;

        await prisma.book.delete({
            where: { id }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Ошибка при удалении книги' });
    }
});

/**
 * POST /api/admin/books/:id/upload-pdf
 * Upload PDF file for a book
 */
router.post('/books/:id/upload-pdf', upload.single('pdf'), async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'PDF файл не загружен' });
        }

        // Store relative path
        const pdfFilePath = `pdfs/${req.file.filename}`;

        const book = await prisma.book.update({
            where: { id },
            data: { pdfFilePath }
        });

        res.json({
            success: true,
            pdfFilePath,
            message: 'PDF файл успешно загружен'
        });
    } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ error: 'Ошибка при загрузке PDF' });
    }
});

/**
 * GET /api/admin/orders
 * Get all orders for admin
 */
router.get('/orders', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;

        const orders = await prisma.order.findMany({
            include: {
                book: {
                    select: { id: true, title: true }
                },
                events: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Ошибка при загрузке заказов' });
    }
});

/**
 * POST /api/admin/seed
 * Seed database with initial books (development only)
 */
router.post('/seed', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;

        // Check if books already exist
        const existingCount = await prisma.book.count();
        if (existingCount > 0) {
            return res.json({ message: 'Данные уже существуют', count: existingCount });
        }

        // Create sample books
        const books = await prisma.book.createMany({
            data: [
                {
                    title: 'The Architecture of Syntax',
                    year: '2021',
                    publisher: 'Oxford University Press',
                    isbn: '978-0198812345',
                    coverImage: 'https://picsum.photos/seed/book1/400/600',
                    description: 'A comprehensive look at minimalist program developments.',
                    abstract: 'This monograph explores the evolution of the minimalist program over the last decade, proposing a new model for phase-theoretic derivations that accounts for cross-linguistic variations in word order.',
                    toc: JSON.stringify(['Preliminaries: The Internal System of Meaning', 'Recursive Structures and Functional Heads', 'A New Model for Phase Inheritance', 'Empirical Evidence from Romance Dialects', 'Concluding Remarks on Biolinguistics']),
                    status: 'published',
                    isPublished: true,
                    litresUrl: 'https://www.litres.ru/',
                    pdfPrice: 2990,
                    pdfCurrency: 'KZT'
                },
                {
                    title: 'Meaning in Motion',
                    year: '2018',
                    publisher: 'MIT Press',
                    isbn: '978-0262534567',
                    coverImage: 'https://picsum.photos/seed/book2/400/600',
                    description: 'Dynamic semantics and the evolution of language.',
                    abstract: 'Meaning in Motion challenges static views of semantics, arguing for a fluid interpretative process that mirrors biological cognitive growth.',
                    toc: JSON.stringify(['Introduction to Dynamic Semantics', 'Historical Perspectives', 'Cognitive Mechanisms', 'Modern Applications']),
                    status: 'published',
                    isPublished: true,
                    pdfPrice: 3500,
                    pdfCurrency: 'KZT'
                }
            ]
        });

        // Initialize invoice counter
        await prisma.invoiceCounter.upsert({
            where: { id: 'invoice_counter' },
            create: { id: 'invoice_counter', value: 0 },
            update: {}
        });

        res.json({ message: 'Данные успешно добавлены', count: books.count });
    } catch (error) {
        console.error('Error seeding data:', error);
        res.status(500).json({ error: 'Ошибка при добавлении данных' });
    }
});

export default router;
