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
import { AuthenticatedRequest, MOROCCAN_REGIONS } from '../types';

const router = Router();

// Validation middleware
const addressValidation = [
  body('firstName').isString().trim().isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),
  body('lastName').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),
  body('phone')
    .isString()
    .customSanitizer(val => val ? val.replace(/\s+/g, '') : val)
    .matches(/^(\+212|0)[5-7][0-9]{8}$/).withMessage('Numéro de téléphone marocain invalide (+212 ou 0 suivi de 9 chiffres)'),
  body('address1').isString().trim().isLength({ min: 2, max: 255 }).withMessage('Address line 1 must be between 2 and 255 characters'),
  body('address2').optional().isString().trim().isLength({ max: 255 }).withMessage('Address line 2 must be max 255 characters'),
  body('city').isString().trim().isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('region').isIn(MOROCCAN_REGIONS).withMessage('Invalid region selected'),
  body('postalCode').optional().isString().matches(/^[0-9]{5}$/).withMessage('Postal code must be exactly 5 digits'),
  body('email').optional().isEmail().withMessage('Invalid email address format'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be true or false'),
];

const updateAddressValidation = [
  body('firstName').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),
  body('lastName').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isString()
    .customSanitizer(val => val ? val.replace(/\s+/g, '') : val)
    .matches(/^(\+212|0)[5-7][0-9]{8}$/).withMessage('Numéro de téléphone marocain invalide (+212 ou 0 suivi de 9 chiffres)'),
  body('address1').optional().isString().trim().isLength({ min: 2, max: 255 }).withMessage('Address line 1 must be between 2 and 255 characters'),
  body('address2').optional().isString().trim().isLength({ max: 255 }).withMessage('Address line 2 must be max 255 characters'),
  body('city').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('region').optional().isIn(MOROCCAN_REGIONS).withMessage('Invalid region selected'),
  body('postalCode').optional().isString().matches(/^[0-9]{5}$/).withMessage('Postal code must be exactly 5 digits'),
  body('email').optional().isEmail().withMessage('Invalid email address format'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be true or false'),
];

const checkValidationErrors = (req: Request, res: Response, next: Function): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arr = errors.array();
    const firstErrorMessage = arr.length > 0 && arr[0].msg ? arr[0].msg : 'Validation failed';
    console.error(`[Validation Failed] ${req.method} ${req.originalUrl}:`, JSON.stringify(arr, null, 2));
    res.status(400).json(createErrorResponse(firstErrorMessage, JSON.stringify(arr)));
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
 * @route   GET /api/v1/addresses/default
 * @desc    Get user's default address
 * @access  Private
 */
router.get('/default', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const address = await PrismaService.getInstance().address.findFirst({
    where: { userId, isDefault: true }
  });

  if (!address) {
    return res.json(createSuccessResponse('No default address found', null));
  }


  return res.json(createSuccessResponse('Default address retrieved successfully', address));
}));


/**
 * @route   GET /api/v1/addresses
 * @desc    Get user's addresses
 * @access  Private
 */
router.get('/', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const addresses = await PrismaService.getInstance().address.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return res.json(createSuccessResponse('Addresses retrieved successfully', addresses));
}));


/**
 * @route   GET /api/v1/addresses/:id
 * @desc    Get single address by ID
 * @access  Private
 */
router.get('/:id', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const address = await PrismaService.getInstance().address.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  return res.json(createSuccessResponse('Address retrieved successfully', address));
}));


/**
 * @route   POST /api/v1/addresses
 * @desc    Create a new address
 * @access  Private
 */
router.post('/', authenticateUser, addressValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log('\n--- [Address Creation] Started ---');
  console.log('[Address Creation] Request body:', JSON.stringify(req.body, null, 2));

  const userId = req.user!.id;
  const { firstName, lastName, phone, address1, address2, city, region, postalCode, email, isDefault = false } = req.body;

  // If this is set as default, unset other default addresses
  if (isDefault) {
    await PrismaService.getInstance().address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });
  }

  // If this is the first address, make it default
  const addressCount = await PrismaService.getInstance().address.count({
    where: { userId }
  });

  const shouldBeDefault = isDefault || addressCount === 0;

  const address = await PrismaService.getInstance().address.create({
    data: {
      userId,
      firstName,
      lastName,
      phone,
      address1,
      address2,
      city,
      region,
      postalCode,
      email,
      isDefault: shouldBeDefault,
    }
  });

  return res.status(201).json(createSuccessResponse('Address created successfully', address));
}));


/**
 * @route   PUT /api/v1/addresses/:id
 * @desc    Update an address
 * @access  Private
 */
router.put('/:id', authenticateUser, updateAddressValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { firstName, lastName, phone, address1, address2, city, region, postalCode, email, isDefault } = req.body;

  const address = await PrismaService.getInstance().address.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // If setting as default, unset other default addresses
  if (isDefault === true) {
    await PrismaService.getInstance().address.updateMany({
      where: {
        userId,
        id: { not: id }
      },
      data: { isDefault: false }
    });
  }

  const updatedAddress = await PrismaService.getInstance().address.update({
    where: { id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone && { phone }),
      ...(address1 && { address1 }),
      ...(address2 !== undefined && { address2 }),
      ...(city && { city }),
      ...(region && { region }),
      ...(postalCode && { postalCode }),
      ...(email !== undefined && { email }),
      ...(isDefault !== undefined && { isDefault }),
      updatedAt: new Date(),
    }
  });

  return res.json(createSuccessResponse('Address updated successfully', updatedAddress));
}));


/**
 * @route   DELETE /api/v1/addresses/:id
 * @desc    Delete an address
 * @access  Private
 */
router.delete('/:id', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const address = await PrismaService.getInstance().address.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Check if this address is being used in any pending orders
  const ordersUsingAddress = await PrismaService.getInstance().order.count({
    where: {
      addressId: id,
      status: {
        in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED']
      }
    }
  });

  if (ordersUsingAddress > 0) {
    throw new AppError('Cannot delete address that is being used in active orders', 400);
  }

  await PrismaService.getInstance().address.delete({
    where: { id }
  });

  // If this was the default address, set another address as default
  if (address.isDefault) {
    const nextAddress = await PrismaService.getInstance().address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (nextAddress) {
      await PrismaService.getInstance().address.update({
        where: { id: nextAddress.id },
        data: { isDefault: true }
      });
    }
  }

  return res.json(createSuccessResponse('Address deleted successfully', null));
}));


/**
 * @route   PUT /api/v1/addresses/:id/default
 * @desc    Set an address as default
 * @access  Private
 */
router.put('/:id/default', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const address = await PrismaService.getInstance().address.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Unset all other default addresses and set this one as default
  await PrismaService.getInstance().$transaction([
    PrismaService.getInstance().address.updateMany({
      where: { userId },
      data: { isDefault: false }
    }),
    PrismaService.getInstance().address.update({
      where: { id },
      data: { isDefault: true }
    })
  ]);

  const updatedAddress = await PrismaService.getInstance().address.findUnique({
    where: { id }
  });

  return res.json(createSuccessResponse('Default address updated successfully', updatedAddress));
}));


/**
 * @route   GET /api/v1/addresses/regions
 * @desc    Get list of Moroccan regions
 * @access  Public
 */
router.get('/regions', asyncHandler(async (req: Request, res: Response) => {
  return res.json(createSuccessResponse('Regions retrieved successfully', MOROCCAN_REGIONS));
}));


export default router;