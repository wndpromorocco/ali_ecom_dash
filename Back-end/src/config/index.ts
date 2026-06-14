import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Server Configuration
  port: number;
  nodeEnv: string;
  apiVersion: string;

  // Database Configuration
  databaseUrl: string;

  // Redis Configuration
  redis: {
    url: string;
    password?: string;
    db: number;
  };

  // JWT Configuration
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // CORS Configuration
  cors: {
    origin: string | string[];
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Bcrypt Configuration
  bcrypt: {
    saltRounds: number;
  };

  // Cache Configuration
  cache: {
    ttl: number;
    prefix: string;
  };

  // Logging
  logLevel: string;

  // File Upload
  upload: {
    maxFileSize: number;
    uploadPath: string;
  };

  // Email Configuration
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromAddress: string;
    fromName: string;
  };
}

const config: Config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',

  // Database Configuration
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // CORS Configuration
  cors: {
    origin: (() => {
      const defaults = ['http://localhost:8080', 'http://localhost:5173', 'https://hermado.com'];
      const env = process.env.CORS_ORIGIN;
      if (!env) return defaults;
      const list = env.split(',').map((o) => o.trim()).filter(Boolean);
      const merged = Array.from(new Set([...defaults, ...list]));
      return merged.length ? merged : defaults;
    })(),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000,
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : 500,
  },

  // Bcrypt Configuration
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    prefix: process.env.CACHE_PREFIX || 'herbio:',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Herbio Marketplace',
  },
};

// Validation
const requiredEnvVars = ['DATABASE_URL'];

// Add SMTP validation for production
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('SMTP_HOST', 'SMTP_USER', 'SMTP_PASS');
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Missing required environment variable: ${envVar}`);
  }
}

export default config;
