import { Router, Request, Response } from 'express';
import { createSuccessResponse, AppError, asyncHandler } from '../utils';
import PrismaService from '../services/prisma';
import { authenticateUser, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Get all settings
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const settings = await PrismaService.getInstance().setting.findMany();
    return res.json(createSuccessResponse('Settings retrieved successfully', settings));
}));


// Get a specific setting by key
router.get('/:key', asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await PrismaService.getInstance().setting.findUnique({
        where: { key }
    });

    if (!setting) {
        throw new AppError('Setting not found', 404);
    }

    return res.json(createSuccessResponse('Setting retrieved successfully', setting));
}));


// Create or update a setting (Admin only)
router.post('/', authenticateUser, authorizeAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { key, value } = req.body;

    if (!key || value === undefined) {
        throw new AppError('Key and value are required', 400);
    }

    const setting = await PrismaService.getInstance().setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    });

    return res.json(createSuccessResponse('Setting updated successfully', setting));
}));


// Specific route for WhatsApp number update (Admin only)
router.put('/whatsapp', authenticateUser, authorizeAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { number } = req.body;

    if (!number) {
        throw new AppError('WhatsApp number is required', 400);
    }

    // Standardize key to 'whatsapp_number'
    const setting = await PrismaService.getInstance().setting.upsert({
        where: { key: 'whatsapp_number' },
        update: { value: number },
        create: { key: 'whatsapp_number', value: number }
    });

    return res.json(createSuccessResponse('WhatsApp number updated successfully', setting));
}));


export default router;
