import { Router, Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createSuccessResponse,
  createErrorResponse,
  AppError,
  asyncHandler,
  getPaginationParams,
  calculatePagination,
  generateSlug
} from '../utils';
import PrismaService from '../services/prisma';
import { authenticateUser, authorizeAdmin } from '../middleware/auth';

const router = Router();

/**
 * Common select object for Product to ensure consistency
 */
const productSelect = {
  id: true,
  name: true,
  nameAr: true,
  slug: true,
  description: true,
  descriptionAr: true,
  shortDescription: true,
  shortDescriptionAr: true,
  sku: true,
  price: true,
  comparePrice: true,
  costPrice: true,
  trackQuantity: true,
  quantity: true,
  weight: true,
  dimensions: true,
  isActive: true,
  isFeatured: true,
  metaTitle: true,
  metaDescription: true,
  tags: true,
  images: true,
  colors: true,
  type: true,
  size: true,
  discountPrice: true,
  promoStart: true,
  promoEnd: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    }
  }
};

// Configure Multer for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

// Validation middleware
const createProductValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('nameAr').optional({ checkFalsy: true }).trim(),
  body('description').optional({ checkFalsy: true }).trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryId').isUUID().withMessage('Valid category ID is required'),
  body('quantity').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('sku').trim().isLength({ min: 1 }).withMessage('SKU is required'),
  body('tags').optional({ checkFalsy: true }).customSanitizer(val => typeof val === 'string' ? JSON.parse(val) : val).isArray(),
  body('colors').optional({ checkFalsy: true }).customSanitizer(val => typeof val === 'string' ? JSON.parse(val) : val).isArray(),
  body('images').optional({ checkFalsy: true }).customSanitizer(val => typeof val === 'string' ? JSON.parse(val) : val).isArray(),
  body('type').optional({ checkFalsy: true }).trim(),
  body('size').optional({ checkFalsy: true }).trim(),
  body('discountPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('promoStart').optional({ checkFalsy: true }).isISO8601(),
  body('promoEnd').optional({ checkFalsy: true }).isISO8601(),
];

const updateProductValidation = [
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 1 }),
  body('nameAr').optional({ checkFalsy: true }).trim(),
  body('description').optional({ checkFalsy: true }).trim(),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('categoryId').optional({ checkFalsy: true }).isUUID(),
  body('quantity').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  body('tags').optional({ checkFalsy: true }).customSanitizer(val => typeof val === 'string' ? JSON.parse(val) : val).isArray(),
  body('colors').optional({ checkFalsy: true }).customSanitizer(val => typeof val === 'string' ? JSON.parse(val) : val).isArray(),
  body('type').optional({ checkFalsy: true }).trim(),
  body('size').optional({ checkFalsy: true }).trim(),
  body('discountPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('promoStart').optional({ checkFalsy: true }).isISO8601(),
  body('promoEnd').optional({ checkFalsy: true }).isISO8601(),
];

const searchValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('categoryId').optional().isUUID().withMessage('Valid category ID is required'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
];

// Helper function to check validation errors
const checkValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(400).json(createErrorResponse(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, JSON.stringify({ errors: errors.array(), body: req.body })));
    return;
  }
  next();
};

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/', searchValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPaginationParams(req.query.page as string, req.query.limit as string);
  const { search, categoryId, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', lng, showInactive, onlyOutOfStock } = req.query;
  const targetLang = lng || req.headers['accept-language']?.split(',')[0].split('-')[0];
  const isArabic = targetLang === 'ar';

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { tags: { has: search as string } },
      { sku: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId as string;
  }

  // Handle visibility (showInactive is for admins)
  if (showInactive === 'true') {
    // Show everything
  } else {
    where.isActive = true;
  }

  // Handle stock status
  if (onlyOutOfStock === 'true') {
    where.quantity = 0;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice as string);
    if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
  }

  // Get total count for pagination
  const total = await PrismaService.getInstance().product.count({ where });

  // Get products
  const products = await PrismaService.getInstance().product.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      [sortBy as string]: sortOrder as 'asc' | 'desc'
    },
    select: productSelect
  });

  // DEBUG: Check first product for colors
  if (products.length > 0) {
    console.log('--- DEBUG: GET ALL PRODUCTS ---');
    console.log('First Product Colors:', (products[0] as any).colors);
    console.log('--------------------------------');
  }

  const pagination = calculatePagination(page, limit, total);

  // Localize response if needed
  const localizedProducts = isArabic ? products.map(p => ({
    ...p,
    colors: (p as any).colors || [],
    name: p.nameAr || p.name,
    description: p.descriptionAr || p.description,
    shortDescription: p.shortDescriptionAr || p.shortDescription,
    category: p.category ? {
      ...p.category,
      name: (p.category as any).nameAr || p.category.name
    } : p.category
  })) : products.map(p => ({
    ...p,
    colors: (p as any).colors || []
  }));

  console.log('--- FINAL RESPONSE LOG (GET ALL) ---');
  console.log('Sample Product Colors:', localizedProducts[0]?.colors);
  console.log('------------------------------------');

  return res.json(createSuccessResponse('Products retrieved successfully', localizedProducts, pagination));
}));




/**
 * @route   GET /api/v1/products/slug/:slug
 * @desc    Get single product by slug
 * @access  Public
 */
router.get('/slug/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { lng } = req.query;
  const targetLang = lng || req.headers['accept-language']?.split(',')[0].split('-')[0];
  const isArabic = targetLang === 'ar';

  const product = await PrismaService.getInstance().product.findUnique({
    where: { slug },
    select: {
      ...productSelect,
      variants: {
        select: {
          id: true,
          name: true,
          value: true,
          price: true,
          quantity: true,
          sku: true,
        }
      }
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Localize response if needed
  const localizedProduct = isArabic ? {
    ...product,
    colors: (product as any).colors || [],
    name: (product as any).nameAr || (product as any).name,
    description: (product as any).descriptionAr || (product as any).description,
    shortDescription: (product as any).shortDescriptionAr || (product as any).shortDescription,
    category: (product as any).category ? {
      ...(product as any).category,
      name: ((product as any).category as any).nameAr || (product as any).category.name
    } : (product as any).category
  } : {
    ...(product as any),
    colors: (product as any).colors || []
  };

  return res.json(createSuccessResponse('Product retrieved successfully', localizedProduct));
}));


/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', authenticateUser, authorizeAdmin, upload.array('images', 4), createProductValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const {
    name, nameAr, description, price, categoryId,
    quantity = 0, sku, tags = [],
    colors = [], type, size, discountPrice, promoStart, promoEnd
  } = req.body;

  // Process uploaded files
  let imagePaths: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    imagePaths = (req.files as Express.Multer.File[]).map(file => `/uploads/products/${file.filename}`);
  }

  // JSON parsing is now handled by customSanitizers in createProductValidation
  const finalTags = tags || [];
  const finalColors = colors || [];

  // Generate slug from name
  const slug = generateSlug(name);

  // Check if slug already exists
  const existingProduct = await PrismaService.getInstance().product.findUnique({
    where: { slug }
  });

  if (existingProduct) {
    throw new AppError('Product with this name already exists', 409);
  }

  // Check if SKU already exists
  const existingSku = await PrismaService.getInstance().product.findUnique({
    where: { sku }
  });

  if (existingSku) {
    throw new AppError('Product with this SKU already exists', 409);
  }

  // Verify category exists
  const category = await PrismaService.getInstance().category.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  try {
    const product = await PrismaService.getInstance().product.create({
      data: {
        name,
        nameAr,
        description,
        price: parseFloat(price as string),
        categoryId,
        quantity: parseInt(quantity as string) || 0,
        sku,
        tags: finalTags,
        slug,
        isActive: (parseInt(quantity as string) || 0) > 0,
        trackQuantity: true,
        colors: finalColors,
        type,
        size,
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        promoStart: promoStart ? new Date(promoStart) : null,
        promoEnd: promoEnd ? new Date(promoEnd) : null,
        images: imagePaths,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return res.status(201).json(createSuccessResponse('Product created successfully', product));
  } catch (error: any) {
    console.error('Product creation error:', error);
    return res.status(400).json(createErrorResponse(`Database error: ${error.message || 'Unknown error'}`, JSON.stringify(error)));
  }
}));


/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update a product
 * @access  Private (Admin only)
 */
router.put('/:id', authenticateUser, authorizeAdmin, upload.array('images', 4), updateProductValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Process uploaded files if any
  if (req.files && Array.isArray(req.files) && (req.files as any[]).length > 0) {
    const newImagePaths = (req.files as Express.Multer.File[]).map(file => `/uploads/products/${file.filename}`);

    // If we're updating images, we might want to append or replace. 
    // For now, let's assume replacement if new files are provided, 
    // or the frontend manages the full list.
    // User goal: "images[] array ... populated with the correct string path"
    updateData.images = newImagePaths;
  }

  // JSON parsing is now handled by customSanitizers in updateProductValidation
  // updateData fields are already sanitized if they were present in req.body


  // Check if product exists
  const existingProduct = await PrismaService.getInstance().product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  // If name is being updated, generate new slug
  if (updateData.name && updateData.name !== existingProduct.name) {
    const newSlug = generateSlug(updateData.name);

    // Check if new slug already exists
    const slugExists = await PrismaService.getInstance().product.findFirst({
      where: {
        slug: newSlug,
        id: { not: id }
      }
    });

    if (slugExists) {
      throw new AppError('Product with this name already exists', 409);
    }

    updateData.slug = newSlug;
  }

  // If SKU is being updated, check uniqueness
  if (updateData.sku && updateData.sku !== existingProduct.sku) {
    const skuExists = await PrismaService.getInstance().product.findFirst({
      where: {
        sku: updateData.sku,
        id: { not: id }
      }
    });

    if (skuExists) {
      throw new AppError('Product with this SKU already exists', 409);
    }
  }

  // If categoryId is being updated, verify it exists
  if (updateData.categoryId) {
    const category = await PrismaService.getInstance().category.findUnique({
      where: { id: updateData.categoryId }
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  // Prepare final update data
  const finalUpdateData: any = { ...updateData };

  // Ensure images is always an array for Prisma
  if (finalUpdateData.images !== undefined) {
    let imagesArray: string[] = [];
    if (finalUpdateData.images === '') {
      imagesArray = [];
    } else if (!Array.isArray(finalUpdateData.images)) {
      imagesArray = [finalUpdateData.images];
    } else {
      imagesArray = finalUpdateData.images;
    }
    // Correct way to update scalar list in Prisma
    finalUpdateData.images = { set: imagesArray };
  }

  // Ensure colors is always an array for Prisma
  if (finalUpdateData.colors !== undefined) {
    let colorsArray: string[] = [];
    if (finalUpdateData.colors === '') {
      colorsArray = [];
    } else if (!Array.isArray(finalUpdateData.colors)) {
      colorsArray = [finalUpdateData.colors];
    } else {
      colorsArray = finalUpdateData.colors;
    }
    // Correct way to update scalar list in Prisma
    finalUpdateData.colors = { set: colorsArray };
  }

  // Remove the old 'color' field if it somehow made it into the payload
  delete finalUpdateData.color;

  // Format fields if they exist
  if (finalUpdateData.price !== undefined) {
    finalUpdateData.price = parseFloat(finalUpdateData.price);
  }
  if (finalUpdateData.quantity !== undefined) {
    finalUpdateData.quantity = parseInt(finalUpdateData.quantity) || 0;
  }
  if (finalUpdateData.discountPrice !== undefined) {
    finalUpdateData.discountPrice = finalUpdateData.discountPrice ? parseFloat(finalUpdateData.discountPrice) : null;
  }
  if (finalUpdateData.isActive !== undefined) {
    finalUpdateData.isActive = finalUpdateData.isActive === 'true' || finalUpdateData.isActive === true;
  }
  if (finalUpdateData.isFeatured !== undefined) {
    finalUpdateData.isFeatured = finalUpdateData.isFeatured === 'true' || finalUpdateData.isFeatured === true;
  }
  if (finalUpdateData.promoStart !== undefined) {
    finalUpdateData.promoStart = finalUpdateData.promoStart ? new Date(finalUpdateData.promoStart) : null;
  }
  if (finalUpdateData.promoEnd !== undefined) {
    finalUpdateData.promoEnd = finalUpdateData.promoEnd ? new Date(finalUpdateData.promoEnd) : null;
  }

  try {
    const product = await PrismaService.getInstance().product.update({
      where: { id },
      data: finalUpdateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return res.json(createSuccessResponse('Product updated successfully', product));
  } catch (error: any) {
    console.error('Product update error:', error);
    return res.status(400).json(createErrorResponse(`Database error: ${error.message || 'Unknown error'}`, JSON.stringify(error)));
  }
}));


/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateUser, authorizeAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if product exists
  const existingProduct = await PrismaService.getInstance().product.findUnique({
    where: { id }
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  await PrismaService.getInstance().product.delete({
    where: { id }
  });

  return res.json(createSuccessResponse('Product deleted successfully'));
}));


/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', asyncHandler(async (req: Request, res: Response) => {
  const products = await PrismaService.getInstance().product.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    take: 8,
    orderBy: {
      createdAt: 'desc'
    },
    select: productSelect
  });

  const { lng } = req.query;
  const targetLang = lng || req.headers['accept-language']?.split(',')[0].split('-')[0];
  const isArabic = targetLang === 'ar';

  const localizedProducts = isArabic ? products.map(p => ({
    ...p,
    colors: (p as any).colors || [],
    name: p.nameAr || p.name,
    description: p.descriptionAr || p.description,
    shortDescription: p.shortDescriptionAr || p.shortDescription,
    category: p.category ? {
      ...p.category,
      name: (p.category as any).nameAr || p.category.name
    } : p.category
  })) : products.map(p => ({
    ...p,
    colors: (p as any).colors || []
  }));

  return res.json(createSuccessResponse('Featured products retrieved successfully', localizedProducts));
}));


/**
 * @route   GET /api/v1/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Prevent catching static routes if they failed matching above
  if (id === 'featured' || id === 'slug') {
    return next();
  }

  const { lng } = req.query;
  const targetLang = lng || req.headers['accept-language']?.split(',')[0].split('-')[0];
  const isArabic = targetLang === 'ar';

  const product = await PrismaService.getInstance().product.findUnique({
    where: { id },
    select: {
      ...productSelect,
      variants: {
        select: {
          id: true,
          name: true,
          value: true,
          price: true,
          quantity: true,
          sku: true,
        }
      }
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Localize response if needed
  const localizedProduct = isArabic ? {
    ...product,
    colors: (product as any).colors || [],
    name: (product as any).nameAr || (product as any).name,
    description: (product as any).descriptionAr || (product as any).description,
    shortDescription: (product as any).shortDescriptionAr || (product as any).shortDescription,
    category: (product as any).category ? {
      ...(product as any).category,
      name: ((product as any).category as any).nameAr || (product as any).category.name
    } : (product as any).category
  } : {
    ...(product as any),
    colors: (product as any).colors || []
  };

  console.log('--- FINAL RESPONSE LOG (GET BY ID) ---');
  console.log('ID Requested:', id);
  console.log('Response Object Keys:', Object.keys(localizedProduct));
  console.log('Final Colors Payload:', (localizedProduct as any).colors);
  console.log('--------------------------------------');

  return res.json(createSuccessResponse('Product retrieved successfully', localizedProduct));
}));


export default router;