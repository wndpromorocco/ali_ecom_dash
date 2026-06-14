import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import {
  createSuccessResponse,
  createErrorResponse,
  AppError,
  asyncHandler,
  generateSlug
} from '../utils';
import PrismaService from '../services/prisma';
import { authenticateUser, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Validation middleware
const createCategoryValidation = [
  body('name').trim().isLength({ min: 1 }).withMessage('Category name is required'),
  body('nameAr').optional({ checkFalsy: true }).trim(),
  body('description').optional({ checkFalsy: true }).trim(),
  body('descriptionAr').optional({ checkFalsy: true }).trim(),
  body('parentId').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('Valid parent category ID is required'),
  body('image').optional({ checkFalsy: true }),
  body('types').optional().isArray().withMessage('Types must be an array of strings'),
  body('colors').optional().isArray().withMessage('Colors must be an array of strings'),
];

const updateCategoryValidation = [
  body('name').optional().trim().isLength({ min: 1 }),
  body('nameAr').optional({ checkFalsy: true }).trim(),
  body('description').optional({ checkFalsy: true }).trim(),
  body('descriptionAr').optional({ checkFalsy: true }).trim(),
  body('parentId').optional({ nullable: true, checkFalsy: true }).isUUID(),
  body('image').optional({ checkFalsy: true }),
  body('isActive').optional().isBoolean(),
  body('types').optional().isArray(),
  body('colors').optional().isArray(),
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
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { includeInactive, lng } = req.query;
  const targetLang = lng || req.headers['accept-language']?.split(',')[0].split('-')[0];
  const isArabic = targetLang === 'ar';

  const where: any = {};

  // Only show active categories by default for public access
  if (!includeInactive || includeInactive !== 'true') {
    where.isActive = true;
  }

  const categories = await PrismaService.getInstance().category.findMany({
    where,
    orderBy: {
      name: 'asc'
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      },
      children: {
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
        },
        orderBy: {
          name: 'asc'
        }
      },
      _count: {
        select: {
          products: {
            where: {
              isActive: true
            }
          }
        }
      }
    }
  });

  return res.json(createSuccessResponse('Categories retrieved successfully', categories));
}));


/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await PrismaService.getInstance().category.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
        }
      },
      children: {
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          description: true,
          descriptionAr: true,
          image: true,
        },
        orderBy: {
          name: 'asc'
        }
      },
      products: {
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          price: true,
          images: true
        },
        take: 12,
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          products: {
            where: {
              isActive: true
            }
          }
        }
      }
    }
  });

  const { lng } = req.query;
  const targetLang = lng || req.headers['accept-language']?.split(',')[0].split('-')[0];
  const isArabic = targetLang === 'ar';

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const localizedCategory = isArabic ? {
    ...category,
    name: category.nameAr || category.name,
    description: category.descriptionAr || category.description,
    parent: category.parent ? {
      ...category.parent,
      name: (category.parent as any).nameAr || category.parent.name
    } : category.parent,
    children: category.children.map((child: any) => ({
      ...child,
      name: child.nameAr || child.name,
      description: child.descriptionAr || child.description
    })),
    products: category.products.map((p: any) => ({
      ...p,
      name: p.nameAr || p.name
    }))
  } : category;

  return res.json(createSuccessResponse('Category retrieved successfully', localizedCategory));
}));


/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get single category by slug
 * @access  Public
 */
router.get('/slug/:slug', asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const category = await PrismaService.getInstance().category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      },
      children: {
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
        },
        orderBy: {
          name: 'asc'
        }
      },
      products: {
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true
        },
        take: 12,
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          products: {
            where: {
              isActive: true
            }
          }
        }
      }
    }
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return res.json(createSuccessResponse('Category retrieved successfully', category));
}));


/**
 * @route   POST /api/v1/categories
 * @desc    Create a new category
 * @access  Private (Admin only)
 */
router.post('/', authenticateUser, authorizeAdmin, createCategoryValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { name, nameAr, description, descriptionAr, parentId, image, types = [], colors = [] } = req.body;

  // Generate slug from name
  const slug = generateSlug(name);

  // Check if slug already exists
  const existingCategory = await PrismaService.getInstance().category.findUnique({
    where: { slug }
  });

  if (existingCategory) {
    throw new AppError('Category with this name already exists', 409);
  }

  // If parentId is provided, verify parent category exists
  if (parentId) {
    const parentCategory = await PrismaService.getInstance().category.findUnique({
      where: { id: parentId }
    });

    if (!parentCategory) {
      throw new AppError('Parent category not found', 404);
    }
  }

  try {
    const category = await PrismaService.getInstance().category.create({
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        slug,
        parentId,
        image,
        types,
        colors,
        isActive: true,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return res.status(201).json(createSuccessResponse('Category created successfully', category));
  } catch (error: any) {
    console.error('Category creation error:', error);
    return res.status(400).json(createErrorResponse(`Database error: ${error.message || 'Unknown error'}`, JSON.stringify(error)));
  }
}));


/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update a category
 * @access  Private (Admin only)
 */
router.put('/:id', authenticateUser, authorizeAdmin, updateCategoryValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if category exists
  const existingCategory = await PrismaService.getInstance().category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  // If name is being updated, generate new slug
  if (updateData.name && updateData.name !== existingCategory.name) {
    const newSlug = generateSlug(updateData.name);

    // Check if new slug already exists
    const slugExists = await PrismaService.getInstance().category.findFirst({
      where: {
        slug: newSlug,
        id: { not: id }
      }
    });

    if (slugExists) {
      throw new AppError('Category with this name already exists', 409);
    }

    updateData.slug = newSlug;
  }

  // If parentId is being updated, verify parent category exists and prevent circular reference
  if (updateData.parentId) {
    if (updateData.parentId === id) {
      throw new AppError('Category cannot be its own parent', 400);
    }

    const parentCategory = await PrismaService.getInstance().category.findUnique({
      where: { id: updateData.parentId }
    });

    if (!parentCategory) {
      throw new AppError('Parent category not found', 404);
    }

    // Check for circular reference (parent trying to be child of its descendant)
    const checkCircularReference = async (categoryId: string, targetParentId: string): Promise<boolean> => {
      const category = await PrismaService.getInstance().category.findUnique({
        where: { id: categoryId },
        select: { parentId: true }
      });

      if (!category || !category.parentId) {
        return false;
      }

      if (category.parentId === targetParentId) {
        return true;
      }

      return checkCircularReference(category.parentId, targetParentId);
    };

    const hasCircularReference = await checkCircularReference(updateData.parentId, id);
    if (hasCircularReference) {
      throw new AppError('Circular reference detected: parent category cannot be a descendant of this category', 400);
    }
  }

  try {
    const category = await PrismaService.getInstance().category.update({
      where: { id },
      data: {
        ...updateData,
        types: updateData.types ? (Array.isArray(updateData.types) ? updateData.types : [updateData.types]) : undefined,
        colors: updateData.colors ? (Array.isArray(updateData.colors) ? updateData.colors : [updateData.colors]) : undefined,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    return res.json(createSuccessResponse('Category updated successfully', category));
  } catch (error: any) {
    console.error('Category update error:', error);
    return res.status(400).json(createErrorResponse(`Database error: ${error.message || 'Unknown error'}`, JSON.stringify(error)));
  }
}));


/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete a category
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateUser, authorizeAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if category exists
  const existingCategory = await PrismaService.getInstance().category.findUnique({
    where: { id },
    include: {
      children: true,
      products: true,
    }
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has children
  if (existingCategory.children.length > 0) {
    throw new AppError('Cannot delete category with subcategories. Please delete or move subcategories first.', 400);
  }

  // Check if category has products
  if (existingCategory.products.length > 0) {
    throw new AppError('Cannot delete category with products. Please move or delete products first.', 400);
  }

  await PrismaService.getInstance().category.delete({
    where: { id }
  });

  return res.json(createSuccessResponse('Category deleted successfully'));
}));


/**
 * @route   GET /api/v1/categories/tree
 * @desc    Get categories in tree structure
 * @access  Public
 */
router.get('/tree', asyncHandler(async (req: Request, res: Response) => {
  // Get all root categories (no parent)
  const rootCategories = await PrismaService.getInstance().category.findMany({
    where: {
      parentId: null,
      isActive: true,
    },
    orderBy: {
      name: 'asc'
    },
    include: {
      children: {
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          description: true,
          descriptionAr: true,
          image: true,
          children: {
            where: {
              isActive: true
            },
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
              description: true,
              descriptionAr: true,
              image: true,
            },
            orderBy: {
              name: 'asc'
            }
          },
          _count: {
            select: {
              products: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      },
      _count: {
        select: {
          products: {
            where: {
              isActive: true
            }
          }
        }
      }
    }
  });

  const { lng } = req.query;
  const targetLang = lng || req.headers['accept-language']?.split(',')[0].split('-')[0];
  const isArabic = targetLang === 'ar';

  const localizeNode = (node: any): any => ({
    ...node,
    name: node.nameAr || node.name,
    description: node.descriptionAr || node.description,
    children: node.children ? node.children.map(localizeNode) : []
  });

  const localizedRoot = isArabic ? rootCategories.map(localizeNode) : rootCategories;

  return res.json(createSuccessResponse('Category tree retrieved successfully', localizedRoot));
}));


export default router;