import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createSuccessResponse,
  createErrorResponse,
  AppError,
  asyncHandler,
  verifyToken
} from '../utils';
import PrismaService from '../services/prisma';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Validation middleware
const addToCartValidation = [
  body('productId').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

const updateCartItemValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
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
 * @route   GET /api/v1/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const cartItems = await PrismaService.getInstance().cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          quantity: true,
          isActive: true,
          images: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate totals
  let totalItems = 0;
  let totalAmount = 0;

  const validCartItems = cartItems.filter(item => {
    if (!item.product.isActive) {
      return false;
    }
    totalItems += item.quantity;
    totalAmount += Number(item.product.price) * item.quantity;
    return true;
  });

  const cart = {
    items: validCartItems,
    totalItems,
    totalAmount: Number(totalAmount.toFixed(2)),
    currency: 'MAD'
  };

  return res.json(createSuccessResponse('Cart retrieved successfully', cart));
}));


/**
 * @route   POST /api/v1/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', authenticateUser, addToCartValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId, quantity } = req.body;

  // Check if product exists and is active
  const product = await PrismaService.getInstance().product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      price: true,
      quantity: true,
      isActive: true,
      trackQuantity: true,
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!product.isActive) {
    throw new AppError('Product is not available', 400);
  }

  // Check stock availability
  if (product.trackQuantity && product.quantity < quantity) {
    throw new AppError(`Only ${product.quantity} items available in stock`, 400);
  }

  // Check if item already exists in cart
  const existingCartItem = await PrismaService.getInstance().cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  let cartItem;

  if (existingCartItem) {
    // Update existing cart item
    const newQuantity = existingCartItem.quantity + quantity;

    // Check stock for new quantity
    if (product.trackQuantity && product.quantity < newQuantity) {
      throw new AppError(`Only ${product.quantity} items available in stock`, 400);
    }

    cartItem = await PrismaService.getInstance().cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      data: {
        quantity: newQuantity
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true
          }
        }
      }
    });
  } else {
    // Create new cart item
    cartItem = await PrismaService.getInstance().cartItem.create({
      data: {
        userId,
        productId,
        quantity
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true
          }
        }
      }
    });
  }

  return res.status(201).json(createSuccessResponse('Item added to cart successfully', cartItem));
}));


/**
 * @route   PUT /api/v1/cart/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/:itemId', authenticateUser, updateCartItemValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  // Check if cart item exists and belongs to user
  const cartItem = await PrismaService.getInstance().cartItem.findFirst({
    where: {
      id: itemId,
      userId
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          quantity: true,
          isActive: true,
          trackQuantity: true,
        }
      }
    }
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  if (!cartItem.product.isActive) {
    throw new AppError('Product is no longer available', 400);
  }

  // Check stock availability
  if (cartItem.product.trackQuantity && cartItem.product.quantity < quantity) {
    throw new AppError(`Only ${cartItem.product.quantity} items available in stock`, 400);
  }

  const updatedCartItem = await PrismaService.getInstance().cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true
        }
      }
    }
  });

  return res.json(createSuccessResponse('Cart item updated successfully', updatedCartItem));
}));


/**
 * @route   DELETE /api/v1/cart/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:itemId', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { itemId } = req.params;

  // Check if cart item exists and belongs to user
  const cartItem = await PrismaService.getInstance().cartItem.findFirst({
    where: {
      id: itemId,
      userId
    }
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  await PrismaService.getInstance().cartItem.delete({
    where: { id: itemId }
  });

  return res.json(createSuccessResponse('Item removed from cart successfully'));
}));


/**
 * @route   DELETE /api/v1/cart/clear
 * @desc    Clear all items from cart
 * @access  Private
 */
router.delete('/clear', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  await PrismaService.getInstance().cartItem.deleteMany({
    where: { userId }
  });

  return res.json(createSuccessResponse('Cart cleared successfully'));
}));


/**
 * @route   GET /api/v1/cart/count
 * @desc    Get cart items count
 * @access  Private
 */
router.get('/count', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const totalItems = await PrismaService.getInstance().cartItem.aggregate({
    where: {
      userId,
      product: {
        isActive: true
      }
    },
    _sum: {
      quantity: true
    }
  });

  const count = totalItems._sum.quantity || 0;

  return res.json(createSuccessResponse('Cart count retrieved successfully', { count }));
}));


export default router;