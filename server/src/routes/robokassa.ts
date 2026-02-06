import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { verifyResultSignature, verifySuccessSignature } from '../lib/robokassa.js';
import { sendPdfDownloadEmail } from '../lib/email.js';

const router = Router();

/**
 * Extract Shp_* custom params from request
 */
function extractShpParams(query: Record<string, unknown>): Record<string, string> {
    const shpParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
        if (key.startsWith('Shp_') && typeof value === 'string') {
            shpParams[key] = value;
        }
    }
    return shpParams;
}

/**
 * Generate secure download token
 */
function generateDownloadToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * POST/GET /api/robokassa/result
 * Server-to-server callback from Robokassa (ResultURL)
 * Must return "OK{InvId}" on success
 */
router.all('/result', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const params = { ...req.query, ...req.body };

        console.log('Robokassa ResultURL callback:', params);

        const {
            OutSum,
            InvId,
            SignatureValue
        } = params;

        if (!OutSum || !InvId || !SignatureValue) {
            console.error('Missing required params');
            return res.status(400).send('ERROR: Missing params');
        }

        const shpParams = extractShpParams(params);
        const orderId = shpParams.Shp_orderId;

        if (!orderId) {
            console.error('Missing Shp_orderId');
            return res.status(400).send('ERROR: Missing order ID');
        }

        // Log callback received
        await prisma.orderEvent.create({
            data: {
                orderId,
                eventType: 'CALLBACK_RECEIVED',
                details: JSON.stringify(params)
            }
        });

        // Verify signature using password #2
        const isValid = verifyResultSignature(
            OutSum as string,
            InvId as string,
            SignatureValue as string,
            shpParams
        );

        if (!isValid) {
            console.error('Invalid signature');
            await prisma.orderEvent.create({
                data: {
                    orderId,
                    eventType: 'PAYMENT_FAILED',
                    details: JSON.stringify({ reason: 'Invalid signature' })
                }
            });
            return res.status(400).send('ERROR: Invalid signature');
        }

        // Get order
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                robokassaInvoiceId: parseInt(InvId as string)
            },
            include: { book: true }
        });

        if (!order) {
            console.error('Order not found:', orderId);
            return res.status(404).send('ERROR: Order not found');
        }

        // Idempotency check - if already paid, just return OK
        if (order.status === 'PAID') {
            console.log('Order already paid, returning OK');
            return res.send(`OK${InvId}`);
        }

        // Generate download token
        const downloadToken = generateDownloadToken();
        const downloadTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update order status
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                robokassaSignature: SignatureValue as string,
                downloadToken,
                downloadTokenExpiry
            }
        });

        await prisma.orderEvent.create({
            data: {
                orderId: order.id,
                eventType: 'PAYMENT_SUCCESS',
                details: JSON.stringify({
                    invId: InvId,
                    outSum: OutSum,
                    downloadTokenExpiry
                })
            }
        });

        // Build download URL
        const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        const serverOrigin = `http://localhost:${process.env.SERVER_PORT || 4000}`;
        const downloadUrl = `${serverOrigin}/api/orders/${order.id}/download?token=${downloadToken}`;

        // Send email with download link
        const emailSent = await sendPdfDownloadEmail(
            { ...order, book: order.book },
            downloadUrl
        );

        if (emailSent) {
            await prisma.orderEvent.create({
                data: {
                    orderId: order.id,
                    eventType: 'EMAIL_SENT',
                    details: JSON.stringify({ email: order.email, downloadUrl })
                }
            });
        }

        // Return success response  
        console.log(`Payment successful for order ${order.id}`);
        res.send(`OK${InvId}`);

    } catch (error) {
        console.error('Robokassa result error:', error);
        res.status(500).send('ERROR: Internal error');
    }
});

/**
 * GET /api/robokassa/success
 * User redirect after successful payment (SuccessURL)
 */
router.get('/success', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const params = req.query;

        console.log('Robokassa SuccessURL redirect:', params);

        const { OutSum, InvId, SignatureValue } = params;
        const shpParams = extractShpParams(params as Record<string, unknown>);
        const orderId = shpParams.Shp_orderId;

        // Verify signature (optional for success page, but good practice)
        if (SignatureValue && OutSum && InvId) {
            const isValid = verifySuccessSignature(
                OutSum as string,
                InvId as string,
                SignatureValue as string,
                shpParams
            );

            if (!isValid) {
                console.warn('Invalid success signature, but proceeding with redirect');
            }
        }

        // Redirect to frontend success page
        const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        const redirectUrl = orderId
            ? `${frontendOrigin}/payment/success?orderId=${orderId}`
            : `${frontendOrigin}/payment/success`;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Robokassa success error:', error);
        const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendOrigin}/payment/success`);
    }
});

/**
 * GET /api/robokassa/fail
 * User redirect after failed/cancelled payment (FailURL)
 */
router.get('/fail', async (req: Request, res: Response) => {
    try {
        const prisma: PrismaClient = req.app.locals.prisma;
        const params = req.query;

        console.log('Robokassa FailURL redirect:', params);

        const shpParams = extractShpParams(params as Record<string, unknown>);
        const orderId = shpParams.Shp_orderId;
        const invId = params.InvId;

        if (orderId) {
            // Update order status
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'FAILED' }
            });

            await prisma.orderEvent.create({
                data: {
                    orderId,
                    eventType: 'PAYMENT_FAILED',
                    details: JSON.stringify({ reason: 'User cancelled or payment failed' })
                }
            });
        }

        // Redirect to frontend fail page
        const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendOrigin}/payment/fail?orderId=${orderId || ''}`);

    } catch (error) {
        console.error('Robokassa fail error:', error);
        const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendOrigin}/payment/fail`);
    }
});

export default router;
