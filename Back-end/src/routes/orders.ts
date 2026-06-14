import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createSuccessResponse,
  createErrorResponse,
  AppError,
  asyncHandler,
  verifyToken,
  generateOrderNumber,
  getPaginationParams,
  calculatePagination
} from '../utils';
import PrismaService from '../services/prisma';
import ERPService from '../services/erp';
import { sendWhatsAppConfirmation } from '../services/whatsapp';
import { AuthenticatedRequest } from '../types';
import { MOROCCAN_REGIONS } from '../types';

const router = Router();

// Validation middleware
const createOrderValidation = [
  body('addressId').isUUID().withMessage('Valid address ID is required'),
  body('paymentMethod').isIn(['CARD', 'CASH_ON_DELIVERY', 'BANK_TRANSFER', 'STRIPE']).withMessage('Invalid payment method'),
  body('shippingMethod').optional().isString().withMessage('Shipping method must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('items').isArray({ min: 1 }).withMessage('Cart items are required and cannot be empty'),
  body('items.*.productId').isString().notEmpty().withMessage('Each item must have a product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const guestOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Cart items are required'),
  body('items.*.productId').isString().withMessage('Each item must have a product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingInfo.email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
  body('shippingInfo.firstName').isString().notEmpty().withMessage('First name is required'),
  body('shippingInfo.lastName').isString().notEmpty().withMessage('Last name is required'),
  body('shippingInfo.phone')
    .isString()
    .customSanitizer(val => val ? val.replace(/\s+/g, '') : val)
    .matches(/^(\+212|0)[5-7][0-9]{8}$/).withMessage('Invalid Moroccan phone number'),
  body('shippingInfo.address1').isString().notEmpty().withMessage('Address is required'),
  body('shippingInfo.city').isString().notEmpty().withMessage('City is required'),
  body('shippingInfo.region').optional({ checkFalsy: true }).isIn(MOROCCAN_REGIONS).withMessage('Invalid region'),
  body('shippingInfo.postalCode').optional({ checkFalsy: true }).isString().matches(/^[0-9]{5}$/).withMessage('Postal code must be 5 digits'),
  body('paymentMethod').isIn(['CARD', 'CASH_ON_DELIVERY', 'BANK_TRANSFER', 'STRIPE']).withMessage('Invalid payment method'),
];

// Helper function to check validation errors
const checkValidationErrors = (req: Request, res: Response, next: Function): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(`[Validation Failed] ${req.method} ${req.originalUrl}:`, JSON.stringify(errors.array(), null, 2));
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
 * @route   GET /api/v1/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { page, limit } = getPaginationParams(req.query.page as string, req.query.limit as string);
  const { status } = req.query;

  const where: any = { userId };

  if (status) {
    where.status = status;
  }

  // Get total count for pagination
  const total = await PrismaService.getInstance().order.count({ where });

  const orders = await PrismaService.getInstance().order.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      address: true,
      items: {
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
      }
    }
  });

  const pagination = calculatePagination(page, limit, total);

  return res.json(createSuccessResponse('Orders retrieved successfully', orders, pagination));
}));


/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const order = await PrismaService.getInstance().order.findFirst({
    where: {
      id,
      userId
    },
    include: {
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              images: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return res.json(createSuccessResponse('Order retrieved successfully', order));
}));


/**
 * @route   POST /api/v1/orders
 * @desc    Create a new order from cart
 * @access  Private
 */
router.post('/', authenticateUser, createOrderValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log('\n--- [Order Creation] Started ---');
  console.log('[Order Creation] Request body:', JSON.stringify(req.body, null, 2));

  const userId = req.user!.id;
  const { addressId, paymentMethod, shippingMethod = 'STANDARD', notes, items: bodyItems } = req.body;

  // Verify address belongs to user
  const address = await PrismaService.getInstance().address.findFirst({
    where: {
      id: addressId,
      userId
    }
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Get items (either from body or from database)
  let itemsToProcess: any[] = [];

  if (bodyItems && Array.isArray(bodyItems) && bodyItems.length > 0) {
    // If items provided in body, we need to fetch their current prices from DB
    const productIds = bodyItems.map(i => i.productId);
    let dbProducts = await PrismaService.getInstance().product.findMany({
      where: { id: { in: productIds } }
    });

    // Check if any products are missing
    const missingIds = productIds.filter(id => !dbProducts.find(p => p.id === id));
    if (missingIds.length > 0) {
      throw new AppError(`Products not found: ${missingIds.join(', ')}`, 404);
    }

    itemsToProcess = bodyItems.map(item => {
      const dbProd = dbProducts.find(p => p.id === item.productId);
      if (!dbProd) throw new AppError(`Product ${item.productId} not found`, 404);
      return {
        productId: item.productId,
        quantity: item.quantity,
        product: dbProd
      };
    });
  } else {
    // Fallback to DB cart
    const cartItems = await PrismaService.getInstance().cartItem.findMany({
      where: { userId },
      include: {
        product: true
      }
    });
    itemsToProcess = cartItems;
  }

  if (itemsToProcess.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Validate items and calculate totals
  let subtotal = 0;
  const orderItems: Array<{
    productId: string;
    quantity: number;
    price: any;
    total: number;
    selectedSize: string | null;
    selectedColor: string | null;
  }> = [];

  for (const item of itemsToProcess) {
    if (!item.product.isActive) {
      throw new AppError(`Product ${item.product.name} is no longer available`, 400);
    }

    if (item.product.trackQuantity && item.product.quantity < item.quantity) {
      throw new AppError(`Only ${item.product.quantity} items of ${item.product.name} available in stock`, 400);
    }

    const itemTotal = Number(item.product.price) * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      total: itemTotal,
      selectedSize: item.selectedSize || null,
      selectedColor: item.selectedColor || null,
    });
  }

  // Calculate shipping and tax
  const shippingAmount = Number(shippingMethod === 'EXPRESS' ? 50 : 40); // MAD
  const taxAmount = 0; // No tax applied for this B2C flow
  const totalAmount = Number(subtotal + shippingAmount);

  // Generate unique order number (verify collision)
  let orderNumber = generateOrderNumber();
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const existing = await PrismaService.getInstance().order.findUnique({
      where: { orderNumber }
    });
    if (!existing) {
      isUnique = true;
    } else {
      orderNumber = generateOrderNumber();
      attempts++;
    }
  }

  if (!isUnique) {
    throw new AppError('Could not generate a unique order number. Please try again.', 500);
  }

  // Create order in transaction
  const order = await PrismaService.getInstance().$transaction(async (prisma) => {
    // Create order
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        currency: 'MAD',
        notes,
        shippingMethod,
        items: {
          create: orderItems
        }
      },
      include: {
        address: true,
        items: {
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
        }
      }
    });

    // Update product quantities if tracking is enabled
    for (const item of itemsToProcess) {
      if (item.product.trackQuantity) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    // Clear cart (in DB)
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    return newOrder;
  });

  // ERP Synchronization - Disabled in favor of frontend hybrid sync
  /*
  try {
    await ERPService.syncOrder(order.id);
  } catch (err) {
    console.error('[ERP-Sync-Warning] Order saved locally but failed to reach ERP:', err);
  }
  */

  // Trigger WhatsApp bot confirmation message
  if (address.phone) {
    const fullName = `${req.user!.firstName} ${req.user!.lastName}`.trim();
    await sendWhatsAppConfirmation(address.phone, order.orderNumber, fullName || 'Client');
  }

  return res.status(201).json(createSuccessResponse('Order created successfully', order));
}));


/**
 * @route   POST /api/v1/orders/guest
 * @desc    Create a new order for guests (with shipping info)
 * @access  Public
 */
router.post('/guest', guestOrderValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { shippingInfo, paymentMethod, shippingMethod = 'STANDARD', notes, items: bodyItems } = req.body;

  // 1. Fetch products and check availability
  const productIds = bodyItems.map((i: any) => i.productId);
  const dbProducts = await PrismaService.getInstance().product.findMany({
    where: { id: { in: productIds } }
  });

  if (dbProducts.length !== productIds.length) {
    throw new AppError('Some products in your cart were not found', 404);
  }

  let subtotal = 0;
  const orderItemsData: any[] = [];

  for (const item of bodyItems) {
    const p = dbProducts.find(prod => prod.id === item.productId)!;
    if (!p.isActive) throw new AppError(`Product ${p.name} is not available`, 400);
    if (p.trackQuantity && p.quantity < item.quantity) {
      throw new AppError(`Only ${p.quantity} units of ${p.name} remaining`, 400);
    }
    const itemTotal = Number(p.price) * item.quantity;
    subtotal += itemTotal;
    orderItemsData.push({
      productId: p.id,
      quantity: item.quantity,
      price: p.price,
      total: itemTotal,
      selectedSize: item.selectedSize || null,
      selectedColor: item.selectedColor || null,
    });
  }

  // 2. Create guest address record (system user for guest grouping?)
  // We can create an address without a userId if we modify address schema too, 
  // or we just embed it. But the current Order model links to Address via addressId.
  // Let's create a "placeholder" address or modify the Order model again?
  // Actually, I should probably allow Address to have nullable userId too if needed,
  // or create a standard guest address flow.

  // For now, let's create a standalone address entry. 
  // (Assuming I might need to make userId nullable in Address model too if it's strictly required)
  // Let's check schema for Address.

  // Calculate totals
  const shippingAmount = Number(shippingMethod === 'EXPRESS' ? 50 : 40);
  const taxAmount = 0; // No tax applied for this B2C flow
  const totalAmount = Number(subtotal + shippingAmount);

  // Generate unique order number (verify collision)
  let orderNumber = generateOrderNumber();
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 5) {
    const existing = await PrismaService.getInstance().order.findUnique({
      where: { orderNumber }
    });
    if (!existing) {
      isUnique = true;
    } else {
      orderNumber = generateOrderNumber();
      attempts++;
    }
  }

  if (!isUnique) {
    throw new AppError('Could not generate a unique order number. Please try again.', 500);
  }

  const order = await PrismaService.getInstance().$transaction(async (prisma) => {
    // We need an address entry. 
    // If Address requires userId, we have a problem. 
    // CHECK: model Address { ... userId String ... user User @relation(...) }
    // I might need to make Address.userId nullable too.

    // Let's create the order with guest fields.
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        guestEmail: shippingInfo.email,
        guestFirstName: shippingInfo.firstName,
        guestLastName: shippingInfo.lastName,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod,
        subtotal: Number(subtotal),
        taxAmount,
        shippingAmount,
        totalAmount,
        currency: 'MAD',
        notes,
        shippingMethod,
        items: {
          create: orderItemsData
        },
        // We'll create the address linked to the order directly if possible, 
        // but Address model currently requires a userId.
        // I will update Address userId to be optional as well.
        address: {
          create: {
            ...shippingInfo,
            region: shippingInfo.region || 'Non Spécifiée',
            postalCode: shippingInfo.postalCode || '00000',
            country: 'Morocco'
          }
        }
      },
      include: {
        address: true,
        items: { include: { product: true } }
      }
    });

    // Update quantities
    for (const item of bodyItems) {
      const p = dbProducts.find(prod => prod.id === item.productId)!;
      if (p.trackQuantity) {
        await prisma.product.update({
          where: { id: p.id },
          data: { quantity: { decrement: item.quantity } }
        });
      }
    }

    return newOrder;
  });

  // ERP Synchronization - Disabled in favor of frontend hybrid sync
  /*
  try {
    await ERPService.syncOrder(order.id);
  } catch (err) {
    console.error('[ERP-Sync-Warning] Guest Order saved locally but failed to reach ERP:', err);
  }
  */

  // Trigger WhatsApp bot confirmation message
  if (shippingInfo.phone) {
    const fullName = `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim() || 'Client(e)';
    await sendWhatsAppConfirmation(shippingInfo.phone, order.orderNumber, fullName);
  }

  return res.status(201).json(createSuccessResponse('Order created successfully', order));
}));


/**
 * @route   PUT /api/v1/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.put('/:id/cancel', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const order = await PrismaService.getInstance().order.findFirst({
    where: {
      id,
      userId
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              trackQuantity: true,
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  // Update order and restore product quantities in transaction
  const updatedOrder = await PrismaService.getInstance().$transaction(async (prisma) => {
    // Update order status
    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED'
      },
      include: {
        address: true,
        items: {
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
        }
      }
    });

    // Restore product quantities
    for (const item of order.items) {
      if (item.product.trackQuantity) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }
    }

    return cancelledOrder;
  });

  return res.json(createSuccessResponse('Order cancelled successfully', updatedOrder));
}));


/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get user's order statistics
 * @access  Private
 */
router.get('/stats', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const stats = await PrismaService.getInstance().order.groupBy({
    by: ['status'],
    where: { userId },
    _count: {
      status: true
    },
    _sum: {
      totalAmount: true
    }
  });

  const totalOrders = await PrismaService.getInstance().order.count({
    where: { userId }
  });

  const totalSpent = await PrismaService.getInstance().order.aggregate({
    where: {
      userId,
      status: {
        in: ['DELIVERED', 'SHIPPED', 'PROCESSING']
      }
    },
    _sum: {
      totalAmount: true
    }
  });

  const orderStats = {
    totalOrders,
    totalSpent: Number(totalSpent._sum.totalAmount || 0),
    statusBreakdown: stats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.status,
        totalAmount: Number(stat._sum.totalAmount || 0)
      };
      return acc;
    }, {} as any)
  };

  return res.json(createSuccessResponse('Order statistics retrieved successfully', orderStats));
}));


export default router;