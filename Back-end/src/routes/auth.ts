import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  createSuccessResponse,
  createErrorResponse,
  AppError,
  asyncHandler
} from '../utils';
import PrismaService from '../services/prisma';
import { AuthenticatedRequest, LoginCredentials, RegisterData } from '../types';
import { OAuth2Client } from 'google-auth-library';
import config from '../config';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Passwords do not match'),
];

// Helper function to check validation errors
const checkValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    res.status(400).json(createErrorResponse(errorArray[0].msg, JSON.stringify(errorArray)));
    return;
  }
  next();
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  console.log('[AUTH-DEBUG] RAW BODY RECEIVED:', req.body);
  const { email, password, firstName, lastName, phone }: RegisterData & { phone?: string } = req.body;

  // Check if user already exists
  const existingUser = await PrismaService.getInstance().user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.warn(`[AUTH-DEBUG] Register failed: User already exists (${email})`);
    throw new AppError('User already exists with this email', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  try {
    const user = await PrismaService.getInstance().user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token in database
    await PrismaService.getInstance().refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    });

    return res.status(201).json(createSuccessResponse('User registered successfully', {
      user,
      tokens: {
        accessToken,
        refreshToken,
      }
    }));
  } catch (err: any) {

    console.error('[AUTH-REGISTRATION-ERROR] Details:', {
      error: err.message,
      stack: err.stack,
      body: req.body
    });
    return res.status(500).json(createErrorResponse('Internal Server Error during registration', err.message));
  }

}));

/**
 * @route   GET /api/v1/auth/health-sync
 * @desc    GOD MODE Diagnostic route
 * @access  Public
 */
router.get('/health-sync', asyncHandler(async (req: Request, res: Response) => {
  const prisma = PrismaService.getInstance();
  const healthy = await PrismaService.healthCheck();

  const tables: any = await prisma.$queryRaw`
    SELECT tablename FROM pg_catalog.pg_tables 
    WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
  `.catch((e: any) => `Error listing tables: ${e.message}`);

  const userCount = await prisma.user.count().catch((e: any) => `Error counting users: ${e.message}`);
  const categoryCount = await prisma.category.count().catch((e: any) => 0);
  const users = await prisma.user.findMany({
    select: { email: true, role: true, password: true }
  }).catch((e: any) => []);

  const categories = await prisma.category.findMany({
    select: { name: true, slug: true }
  }).catch((e: any) => []);

  // Diagnostic: Check if hardcoded password matches DB hash for admin@hermado.com
  let passwordMatch = false;
  const adminUser = users.find(u => u.email === 'admin@hermado.com');
  if (adminUser) {
    passwordMatch = await bcrypt.compare('AdminPassword2026!', adminUser.password);
  }

  return res.json({
    status: healthy ? 'UP' : 'DOWN',
    database_connected: healthy,
    tables: tables,
    user_count: userCount,
    category_count: categoryCount,
    users: users.map(u => ({ email: u.email, role: u.role })), // Sanitize for response
    categories: categories,
    diagnostic: {
      admin_found: !!adminUser,
      password_match: passwordMatch,
    },
    env: process.env.NODE_ENV,
    db_host: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : 'N/A'
  });
}));


/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginCredentials = req.body;

  // Find user
  const user = await PrismaService.getInstance().user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError('Invalid credentials (User not found)', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials (Password mismatch)', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });

  // Store refresh token in database
  await PrismaService.getInstance().refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return res.json(createSuccessResponse('Login successful', {
    user: userWithoutPassword,
    tokens: {
      accessToken,
      refreshToken,
    }
  }));
}));


/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Verify refresh token
  const decoded = verifyToken(refreshToken, 'refresh') as any;

  // Check if refresh token exists in database and is not expired
  const storedToken = await PrismaService.getInstance().refreshToken.findFirst({
    where: {
      token: refreshToken,
      userId: decoded.userId,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        }
      }
    }
  });

  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Generate new access token
  const newAccessToken = generateAccessToken({
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role
  });

  return res.json(createSuccessResponse('Token refreshed successfully', {
    accessToken: newAccessToken,
  }));
}));


/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post('/logout', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove refresh token from database
    await PrismaService.getInstance().refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  return res.json(createSuccessResponse('Logout successful'));
}));


/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await PrismaService.getInstance().user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return res.json(createSuccessResponse('User profile retrieved successfully', { user }));
}));


router.post('/change-password', authenticateUser, changePasswordValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

  const user = await PrismaService.getInstance().user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, password: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await PrismaService.getInstance().user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  await PrismaService.getInstance().refreshToken.deleteMany({
    where: { userId: user.id }
  });

  return res.json(createSuccessResponse('Password updated successfully'));
}));


/**
 * @route   POST /api/v1/auth/request-secure-reset
 * @desc    Request a secure password reset code (Authenticated)
 * @access  Private
 */
router.post('/request-secure-reset', authenticateUser, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await PrismaService.getInstance().user.findUnique({
    where: { id: req.user!.id },
    select: { email: true }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store code in DB
  await PrismaService.getInstance().user.update({
    where: { id: req.user!.id },
    data: {
      resetCode: code,
      resetCodeExpires: expiry
    }
  });

  // Send Email
  const emailSent = await sendEmail(
    user.email,
    'Code de sécurité - Changement de mot de passe',
    `<p>Bonjour,</p>
     <p>Vous avez demandé à changer votre mot de passe Herbio.</p>
     <p>Votre code de sécurité est : <strong>${code}</strong></p>
     <p>Ce code expire dans 15 minutes.</p>`
  );

  if (!emailSent) {
    throw new AppError('Service d\'envoi d\'e-mails indisponible.', 500);
  }

  return res.json(createSuccessResponse('Code de sécurité envoyé par e-mail.'));
}));


/**
 * @route   POST /api/v1/auth/verify-and-update-password
 * @desc    Verify reset code and update password (Authenticated)
 * @access  Private
 */
const secureResetValidation = [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

router.post('/verify-and-update-password', authenticateUser, secureResetValidation, checkValidationErrors, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code, newPassword } = req.body;

  const user = await PrismaService.getInstance().user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, resetCode: true, resetCodeExpires: true }
  });

  if (!user || user.resetCode !== code || (user.resetCodeExpires && user.resetCodeExpires < new Date())) {
    throw new AppError('Code invalide ou expiré', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await PrismaService.getInstance().user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpires: null
    }
  });

  // Invalidate all sessions
  await PrismaService.getInstance().refreshToken.deleteMany({
    where: { userId: user.id }
  });

  return res.json(createSuccessResponse('Mot de passe mis à jour avec succès.'));
}));


router.get('/google', asyncHandler(async (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;
  if (!clientId || !clientSecret) {
    throw new AppError('Google OAuth not configured', 500);
  }
  const client = new OAuth2Client({ clientId, clientSecret, redirectUri });
  const state = Buffer.from(JSON.stringify({
    redirect: (req.query.redirect as string) || process.env.CORS_ORIGIN || 'http://localhost:5173'
  })).toString('base64');
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'consent',
    state
  });
  return res.redirect(url);
}));


router.get('/google/callback', asyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const stateParam = req.query.state as string | undefined;
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;
  if (!code || !clientId || !clientSecret) {
    throw new AppError('Invalid Google OAuth callback', 400);
  }
  const client = new OAuth2Client({ clientId, clientSecret, redirectUri });
  const { tokens } = await client.getToken(code);
  const idToken = tokens.id_token as string;
  const ticket = await client.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new AppError('Failed to retrieve Google user info', 400);
  }
  const email = payload.email;
  const firstName = payload.given_name || 'User';
  const lastName = payload.family_name || 'Google';
  const avatar = payload.picture || null;
  let user = await PrismaService.getInstance().user.findUnique({
    where: { email }
  });
  if (!user) {
    const hashedPassword = await bcrypt.hash(`oauth:${payload.sub}:${Date.now()}`, 12);
    user = await PrismaService.getInstance().user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: null,
        role: 'CUSTOMER',
        avatar: avatar
      }
    });
  }
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });
  await PrismaService.getInstance().refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  let redirect = 'http://localhost:5173/compte';
  if (stateParam) {
    try {
      const parsed = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8')) as { redirect?: string };
      if (parsed.redirect) redirect = parsed.redirect;
    } catch { }
  }
  const url = new URL(redirect);
  url.searchParams.set('accessToken', accessToken);
  return res.redirect(url.toString());
}));


router.get('/test-email-config', (req: Request, res: Response) => {
  return res.json({
    host: config.email.host,
    port: config.email.port,
    fromAddress: config.email.fromAddress,
    user: config.email.user,
    env_user: process.env.SMTP_USER,
    env_from: process.env.EMAIL_FROM_ADDRESS
  });
});


import { sendEmail } from '../services/email';

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

router.post('/forgot-password', forgotPasswordValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400);

  const user = await PrismaService.getInstance().user.findUnique({ where: { email } });
  if (!user) {
    console.log(`[DEBUG] Forgot Password: User not found for ${email}`);
    // Return success even if user not found for security
    return res.json(createSuccessResponse('If an account exists, a reset code has been sent.'));
  }


  console.log(`[DEBUG] Forgot Password: User found for ${email}. Generating code...`);

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store code in DB
  await PrismaService.getInstance().user.update({
    where: { id: user.id },
    data: {
      resetCode: code,
      resetCodeExpires: expiry
    }
  });

  console.log(`[DEBUG] Password Reset Code for ${email}: ${code}`);

  // Send Email
  const emailSent = await sendEmail(
    email,
    'Réinitialisation de votre mot de passe - Herbio',
    `<p>Bonjour,</p>
     <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
     <p>Votre code de vérification est : <strong>${code}</strong></p>
     <p>Ce code expire dans 15 minutes.</p>`
  );

  if (!emailSent) {
    throw new AppError('Le service d\'envoi d\'e-mails est temporairement indisponible.', 500);
  }

  return res.json(createSuccessResponse('Code de vérification envoyé. Veuillez vérifier vos e-mails.'));
}));


const resetPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

router.post('/reset-password', resetPasswordValidation, checkValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) throw new AppError('Missing fields', 400);

  const user = await PrismaService.getInstance().user.findUnique({
    where: { email },
    select: { id: true, resetCode: true, resetCodeExpires: true }
  });

  if (!user || user.resetCode !== code || (user.resetCodeExpires && user.resetCodeExpires < new Date())) {
    throw new AppError('Code invalide ou expiré', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await PrismaService.getInstance().user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetCode: null,
      resetCodeExpires: null
    }
  });

  // Invalidate all tokens
  await PrismaService.getInstance().refreshToken.deleteMany({
    where: { userId: user.id }
  });

  return res.json(createSuccessResponse('Password reset successfully'));
}));


export default router;
