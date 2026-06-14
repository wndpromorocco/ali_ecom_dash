import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AppError, asyncHandler, verifyToken } from '../utils';
import PrismaService from '../services/prisma';

export const authenticateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Access token is required', 401);
    }

    const token = authHeader.substring(7);
    try {
        const decoded = verifyToken(token, 'access') as any;

        const user = await PrismaService.getInstance().user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        req.user = user as any;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Token expired', 401);
        }
        throw new AppError('Invalid token', 401);
    }
});

export const authorizeAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
        throw new AppError('Access forbidden: Admin rights required', 403);
    }
    next();
};
