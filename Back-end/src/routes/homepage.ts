import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    createSuccessResponse,
    createErrorResponse,
    AppError,
    asyncHandler
} from '../utils';
import PrismaService from '../services/prisma';
import { authenticateUser, authorizeAdmin } from '../middleware/auth';

const router = Router();

// Configure Multer for hero images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/hero');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'hero-' + Date.now() + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Configure Multer for gallery images (Homepage)
const homepageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/homepage');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const slot = req.params.id || 'x';
        cb(null, `gallery-slot-${slot}-${Date.now()}${ext}`);
    }
});

const homepageUpload = multer({
    storage: homepageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Configure Multer for Exclusive Offer (Promo)
const promoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/promo');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `promo-${Date.now()}${ext}`);
    }
});

const promoUpload = multer({
    storage: promoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper function to check validation errors
const checkValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json(createErrorResponse(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`));
        return;
    }
    next();
};

/* ─────────────────────────────────────────────
  HERO SLIDES
───────────────────────────────────────────── */

/**
 * @route   GET /api/v1/homepage/hero
 * @desc    Get all active hero slides
 * @access  Public
 */
router.get('/hero', asyncHandler(async (req: Request, res: Response) => {
    const slides = await PrismaService.getInstance().heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });
    return res.json(createSuccessResponse('Hero slides retrieved successfully', slides));
}));

/**
 * @route   POST /api/v1/homepage/hero
 * @desc    Create a new hero slide
 * @access  Private (Admin only)
 */
router.post('/hero', authenticateUser, authorizeAdmin, upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError('Image file is required', 400);
    }

    const { title, subtitle, order = 0 } = req.body;
    const imageUrl = `/uploads/hero/${req.file.filename}`;

    const slide = await PrismaService.getInstance().heroSlide.create({
        data: {
            imageUrl,
            title,
            subtitle,
            order: parseInt(order as string) || 0,
            isActive: true
        }
    });

    return res.status(201).json(createSuccessResponse('Hero slide created successfully', slide));
}));

/**
 * @route   PUT /api/v1/homepage/hero/:id
 * @desc    Update a hero slide
 * @access  Private (Admin only)
 */
router.put('/hero/:id', authenticateUser, authorizeAdmin, upload.single('image'), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, subtitle, order, isActive } = req.body;

    const existingSlide = await PrismaService.getInstance().heroSlide.findUnique({
        where: { id }
    });

    if (!existingSlide) {
        throw new AppError('Hero slide not found', 404);
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (order !== undefined) updateData.order = parseInt(order as string);
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
        // Delete old file
        const oldPath = path.join(__dirname, '../../', existingSlide.imageUrl);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
        updateData.imageUrl = `/uploads/hero/${req.file.filename}`;
    }

    const slide = await PrismaService.getInstance().heroSlide.update({
        where: { id },
        data: updateData
    });

    return res.json(createSuccessResponse('Hero slide updated successfully', slide));
}));

/**
 * @route   DELETE /api/v1/homepage/hero/:id
 * @desc    Delete a hero slide
 * @access  Private (Admin only)
 */
router.delete('/hero/:id', authenticateUser, authorizeAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingSlide = await PrismaService.getInstance().heroSlide.findUnique({
        where: { id }
    });

    if (!existingSlide) {
        throw new AppError('Hero slide not found', 404);
    }

    // Delete file
    const filePath = path.join(__dirname, '../../', existingSlide.imageUrl);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await PrismaService.getInstance().heroSlide.delete({
        where: { id }
    });

    return res.json(createSuccessResponse('Hero slide deleted successfully'));
}));

/* ─────────────────────────────────────────────
  PROMO SECTION
───────────────────────────────────────────── */

/**
 * @route   GET /api/v1/homepage/promo
 * @desc    Get promo configuration
 * @access  Public
 */
router.get('/promo', asyncHandler(async (req: Request, res: Response) => {
    const promo = await PrismaService.getInstance().homepagePromo.findFirst({
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    discountPrice: true,
                    images: true,
                    slug: true
                }
            }
        }
    });
    return res.json(createSuccessResponse('Promo configuration retrieved successfully', promo));
}));

/**
 * @route   PUT /api/v1/homepage/promo
 * @desc    Update promo configuration (upsert)
 * @access  Private (Admin only)
 */
router.put('/promo', authenticateUser, authorizeAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { is_active, promo_end_date, section_title, section_subtitle, product_id, image_url } = req.body;

    const existingPromo = await PrismaService.getInstance().homepagePromo.findFirst();

    const data: any = {
        isActive: is_active === undefined ? true : (is_active === 'true' || is_active === true),
        promoEndDate: new Date(promo_end_date),
        sectionTitle: section_title || 'Offre Exclusive Finit Bientôt !',
        sectionSubtitle: section_subtitle || 'Notre plus grande démarque saisonnière à ce jour.',
        productId: product_id || null,
    };

    if (image_url !== undefined) data.imageUrl = image_url;

    let promo;
    if (existingPromo) {
        promo = await PrismaService.getInstance().homepagePromo.update({
            where: { id: existingPromo.id },
            data
        });
    } else {
        promo = await PrismaService.getInstance().homepagePromo.create({
            data
        });
    }

    return res.json(createSuccessResponse('Promo configuration updated successfully', promo));
}));

/**
 * @route   POST /api/v1/homepage/promo/upload-image
 * @desc    Upload an image for the exclusive offer
 * @access  Private (Admin only)
 */
router.post('/promo/upload-image', authenticateUser, authorizeAdmin, promoUpload.single('image'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new AppError('Image file is required', 400);
    }

    // FALLBACK: Since Cloudinary is not configured yet, we return the local path.
    // In a real Cloudinary setup, you would upload to Cloudinary here.
    const imageUrl = `/uploads/promo/${req.file.filename}`;

    return res.json(createSuccessResponse('Promo image uploaded successfully', { imageUrl }));
}));

/* ─────────────────────────────────────────────
  GALLERY IMAGES (CONTROLLERS)
───────────────────────────────────────────── */

/**
 * Update a gallery slot image (upsert)
 * Dedicated controller for Homepage Gallery
 */
export const updateGallerySlot = asyncHandler(async (req: Request, res: Response) => {
    const slot = parseInt(req.params.id);
    const { alt_text } = req.body;

    if (isNaN(slot) || slot < 1 || slot > 5) {
        throw new AppError('Invalid slot number (1-5)', 400);
    }

    // Check if slot exists to handle old file deletion
    const existingSlot = await PrismaService.getInstance().galleryImage.findUnique({
        where: { slot }
    });

    const updateData: any = {
        slot: slot,
    };

    if (alt_text !== undefined) updateData.altText = alt_text;

    if (req.file) {
        // Delete old file if it was an uploaded one
        if (existingSlot && existingSlot.imageUrl.startsWith('/uploads/')) {
            const oldPath = path.join(__dirname, '../../', existingSlot.imageUrl);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                } catch (err) {
                    console.error('Error deleting old gallery image:', err);
                }
            }
        }
        updateData.imageUrl = `/uploads/homepage/${req.file.filename}`;
    }

    const updated = await PrismaService.getInstance().galleryImage.upsert({
        where: { slot },
        update: updateData,
        create: {
            slot,
            imageUrl: updateData.imageUrl || '',
            altText: updateData.altText || ''
        }
    });

    return res.json(createSuccessResponse(`Slot ${slot} updated successfully`, updated));
});

/* ─────────────────────────────────────────────
  GALLERY IMAGES (ROUTES)
───────────────────────────────────────────── */

/**
 * @route   GET /api/v1/homepage/gallery
 * @desc    Get all gallery slots
 * @access  Public
 */
router.get('/gallery', asyncHandler(async (req: Request, res: Response) => {
    const images = await PrismaService.getInstance().galleryImage.findMany({
        orderBy: { slot: 'asc' }
    });
    return res.json(createSuccessResponse('Gallery images retrieved successfully', images));
}));

/**
 * @route   PUT /api/v1/homepage/gallery/:id
 * @desc    Update a gallery slot image (upsert)
 * @access  Private (Admin only)
 */
router.put('/gallery/:id', authenticateUser, authorizeAdmin, homepageUpload.single('image'), updateGallerySlot);

/* ─────────────────────────────────────────────
  BLACK FRIDAY CONFIG
───────────────────────────────────────────── */

/**
 * @route   GET /api/v1/homepage/blackfriday
 * @desc    Get Black Friday configuration
 * @access  Public
 */
router.get('/blackfriday', asyncHandler(async (req: Request, res: Response) => {
    const config = await PrismaService.getInstance().blackFridayConfig.findFirst({
        where: { id: 1 }
    });
    return res.json(createSuccessResponse('Black Friday configuration retrieved successfully', config));
}));

/**
 * @route   PUT /api/v1/homepage/blackfriday
 * @desc    Update Black Friday configuration
 * @access  Private (Admin only)
 */
router.put('/blackfriday', authenticateUser, authorizeAdmin, asyncHandler(async (req: Request, res: Response) => {
    const {
        is_active,
        emoji,
        line1,
        line2,
        badge_text,
        bg_color,
        text_color,
        border_color
    } = req.body;

    const data = {
        isActive: is_active === undefined ? true : (is_active === 'true' || is_active === true),
        emoji,
        line1,
        line2,
        badgeText: badge_text,
        bgColor: bg_color,
        textColor: text_color,
        borderColor: border_color
    };

    const updated = await PrismaService.getInstance().blackFridayConfig.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data }
    });

    return res.json(createSuccessResponse('Black Friday configuration updated successfully', updated));
}));

export default router;
