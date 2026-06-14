import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createSuccessResponse,
  createErrorResponse,
  AppError,
  asyncHandler,
  verifyToken,
  getPaginationParams,
  calculatePagination
} from '../utils';
import PrismaService from '../services/prisma';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Validation middleware
const createReviewValidation = [
  body('productId').isUUID().withMessage('Valid product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment must be a string with max 1000 characters'),
];

const updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().isLength({ max: 1000 }).withMessage('Comment must be a string with max 1000 characters'),
];

// Helper function to check validation errors
const checkValidationErrors = (req: Request, res: Response, next: Function): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json(createErrorResponse('Validation failed', JSON.stringify(errors.array())));
    return;
  }
  next();
};

// Authentication middleware
const authenticateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access token is required', 401);
  }

  const token = authHeader.substring(7);
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
});

/**
 * @route   GET /api/v1/reviews/product/:productId
 * @desc    Get reviews for a specific product
 * @access  Public
 */
router.get('/product/:productId', asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { page, limit } = getPaginationParams(req.query.page as string, req.query.limit as string);
  const { rating } = req.query;

  // Verify product exists
  const product = await PrismaService.getInstance().product.findUnique({
    where: { id: productId },
    select: { id: true }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const where: any = { productId };

  if (rating) {
    where.rating = parseInt(rating as string);
  }

  // Get total count for pagination
  const total = await PrismaService.getInstance().review.count({ where });

  const reviews = await PrismaService.getInstance().review.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });

  // Calculate rating statistics
  const ratingStats = await PrismaService.getInstance().review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: {
      rating: true
    }
  });

  const averageRating = await PrismaService.getInstance().review.aggregate({
    where: { productId },
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    }
  });

  const pagination = calculatePagination(page, limit, total);

  const reviewData = {
    reviews,
    statistics: {
      averageRating: Number(averageRating._avg.rating?.toFixed(1) || 0),
      totalReviews: averageRating._count.rating,
      ratingBreakdown: ratingStats.reduce((acc, stat) => {
        acc[stat.rating] = stat._count.rating;
        return acc;
      }, {} as Record<number, number>)
    }
  };

  return res.json(createSuccessResponse('Reviews retrieved successfully', reviewData, pagination));
}));


/**
 * @route   GET /api/v1/reviews/user
 * @desc    Get user's reviews
 * @access  Private
 */
router.get('/user', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page, limit } = getPaginationParams(req.query.page as string, req.query.limit as string);

  // Get total count for pagination
  const total = await PrismaService.getInstance().review.count({
    where: { userId }
  });

  const reviews = await PrismaService.getInstance().review.findMany({
    where: { userId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true
        }
      }
    }
  });

  const pagination = calculatePagination(page, limit, total);

  return res.json(createSuccessResponse('User reviews retrieved successfully', reviews, pagination));
}));


/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get single review by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await PrismaService.getInstance().review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    }
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  return res.json(createSuccessResponse('Review retrieved successfully', review));
}));


/**
 * @route   POST /api/v1/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', authenticateUser, createReviewValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId, rating, comment } = req.body;

  // Verify product exists
  const product = await PrismaService.getInstance().product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true }
  });

  if (!product || !product.isActive) {
    throw new AppError('Product not found or inactive', 404);
  }

  // Check if user has already reviewed this product
  const existingReview = await PrismaService.getInstance().review.findFirst({
    where: {
      userId,
      productId
    }
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Verify user has purchased this product
  const hasPurchased = await PrismaService.getInstance().orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: 'DELIVERED'
      }
    }
  });

  if (!hasPurchased) {
    throw new AppError('You can only review products you have purchased', 400);
  }

  const review = await PrismaService.getInstance().review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    }
  });

  return res.status(201).json(createSuccessResponse('Review created successfully', review));
}));


/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Update a review
 * @access  Private
 */
router.put('/:id', authenticateUser, updateReviewValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await PrismaService.getInstance().review.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const updatedReview = await PrismaService.getInstance().review.update({
    where: { id },
    data: {
      ...(rating && { rating }),
      ...(comment !== undefined && { comment }),
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    }
  });

  return res.json(createSuccessResponse('Review updated successfully', updatedReview));
}));


/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete a review
 * @access  Private
 */
router.delete('/:id', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const review = await PrismaService.getInstance().review.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  await PrismaService.getInstance().review.delete({
    where: { id }
  });

  return res.json(createSuccessResponse('Review deleted successfully', null));
}));


/**
 * @route   GET /api/v1/reviews/stats/product/:productId
 * @desc    Get review statistics for a product
 * @access  Public
 */
router.get('/stats/product/:productId', asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  // Verify product exists
  const product = await PrismaService.getInstance().product.findUnique({
    where: { id: productId },
    select: { id: true }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const ratingStats = await PrismaService.getInstance().review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: {
      rating: true
    }
  });

  const averageRating = await PrismaService.getInstance().review.aggregate({
    where: { productId },
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    }
  });

  const stats = {
    averageRating: Number(averageRating._avg.rating?.toFixed(1) || 0),
    totalReviews: averageRating._count.rating,
    ratingBreakdown: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      ...ratingStats.reduce((acc, stat) => {
        acc[stat.rating] = stat._count.rating;
        return acc;
      }, {} as Record<number, number>)
    }
  };

  return res.json(createSuccessResponse('Review statistics retrieved successfully', stats));
}));


export default router;