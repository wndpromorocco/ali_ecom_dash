import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import config from './config';
import { createErrorResponse, isDevelopment } from './utils';
import { AppError } from './utils';
import PrismaService from './services/prisma';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import categoryRoutes from './routes/categories';
import reviewRoutes from './routes/reviews';
import addressRoutes from './routes/addresses';
import settingsRoutes from './routes/settings';
import uploadRoutes from './routes/uploads';
import homepageRoutes from './routes/homepage';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await PrismaService.connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.log('⚠️  Server will continue without database connection');
      // Don't exit the process, just log the error
    }
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
          frameSrc: ["'self'", "https://www.google.com", "https://recaptcha.google.com"],
          connectSrc: [
            "'self'",
            "https://www.google.com",
            "http://localhost:3001",
            "http://localhost:8081",
            "https://hermado.com",
            "https://www.hermado.com",
            "https://hermado-ecom.liadtech-hosting.com",
            ...(Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin])
          ],
          upgradeInsecureRequests: null, // Disable for HTTP testing
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    }));

    // CORS configuration (FIXED)
    this.app.use(cors({
      origin: [
        'https://hermado.com',
        'https://www.hermado.com',
        'http://localhost:8081',
        'http://localhost:3000',
        ...(Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin])
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (isDevelopment()) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy (for rate limiting and IP detection)
    this.app.set('trust proxy', 1);

    // Static files
    this.app.use('/uploads', express.static('uploads'));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      let dbHealthy = false;
      try {
        dbHealthy = await PrismaService.healthCheck();
      } catch (error) {
        console.log('Health check: Database not available');
      }

      res.status(200).json({
        success: true,
        message: 'Fadel trading E-commerce API is running', // Updated message
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: config.apiVersion,
        services: {
          database: dbHealthy ? 'healthy' : 'unavailable',
        },
      });
    });

    // API routes
    const apiRouter = express.Router();

    // Mount API routes
    apiRouter.use('/auth', authRoutes);
    apiRouter.use('/products', productRoutes);
    apiRouter.use('/cart', cartRoutes);
    apiRouter.use('/orders', orderRoutes);
    apiRouter.use('/categories', categoryRoutes);
    apiRouter.use('/reviews', reviewRoutes);
    apiRouter.use('/addresses', addressRoutes);
    apiRouter.use('/uploads', uploadRoutes);
    apiRouter.use('/settings', settingsRoutes);
    apiRouter.use('/homepage', homepageRoutes);

    // API info route
    apiRouter.get('/', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Fadel trading E-commerce API', // Updated message
        version: config.apiVersion,
        endpoints: {
          health: '/health',
          auth: '/api/v1/auth',
          products: '/api/v1/products',
          cart: '/api/v1/cart',
          orders: '/api/v1/orders',
          categories: '/api/v1/categories',
          reviews: '/api/v1/reviews',
          addresses: '/api/v1/addresses',
          settings: '/api/v1/settings',
        },
      });
    });

    this.app.use(`/api/${config.apiVersion}`, apiRouter);
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';

      // MEGA DEBUG: Log everything to console
      console.error(' [CRITICAL ERROR] ', {
        path: req.path,
        message: message,
        stack: error.stack,
        raw: error
      });

      // MEGA DEBUG: Send everything to response
      res.status(statusCode).json({
        success: false,
        message: message,
        debug_stack: error.stack,
        debug_full_error: error,
        debug_instruction: "Please check this response to identify the issue."
      });
    });
  }
}

export default App;