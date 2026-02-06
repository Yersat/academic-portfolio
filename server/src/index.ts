import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import booksRouter from './routes/books.js';
import checkoutRouter from './routes/checkout.js';
import robokassaRouter from './routes/robokassa.js';
import downloadRouter from './routes/download.js';
import adminRouter from './routes/admin.js';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.SERVER_PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make prisma available to routes
app.locals.prisma = prisma;

// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        testMode: process.env.ROBOKASSA_TEST_MODE === '1'
    });
});

// Routes
app.use('/api/books', booksRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/robokassa', robokassaRouter);
app.use('/api/orders', downloadRouter);
app.use('/api/admin', adminRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing connections...');
    await prisma.$disconnect();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Robokassa test mode: ${process.env.ROBOKASSA_TEST_MODE === '1' ? 'ON' : 'OFF'}`);
});

export default app;
