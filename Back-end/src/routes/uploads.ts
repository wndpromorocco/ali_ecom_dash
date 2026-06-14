import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateUser, authorizeAdmin } from '../middleware/auth';
import { createSuccessResponse, createErrorResponse } from '../utils';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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

/**
 * @route   POST /api/v1/uploads
 * @desc    Upload an image
 * @access  Private (Admin only)
 */
router.post('/', authenticateUser, authorizeAdmin, upload.single('image'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json(createErrorResponse('No file uploaded'));
    }

    const url = `/uploads/${req.file.filename}`;
    return res.json(createSuccessResponse('File uploaded successfully', { url }));
});


export default router;
