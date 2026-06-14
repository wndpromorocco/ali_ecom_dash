import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { JwtPayload, UserRole, ApiResponse, PaginationInfo } from '../types';

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT utilities
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
};

export const verifyToken = (token: string, type: 'access' | 'refresh' = 'access'): JwtPayload => {
  const secret = type === 'access' ? config.jwt.secret : config.jwt.refreshSecret;
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createError('Token expired', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token signature or malformed token', 401);
    }
    throw error;
  }
};

// UUID utilities
export const generateId = (): string => {
  return uuidv4();
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  // 6 random uppercase alphanumeric characters
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `B2C-${yyyy}${mm}${dd}-${random}`;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/; // Moroccan phone format
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Sanitization utilities
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Pagination utilities
export const calculatePagination = (page: number, limit: number, total: number): PaginationInfo => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
};

export const getPaginationParams = (page?: string, limit?: string) => {
  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit || '10', 10)));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

// Response utilities
export const createSuccessResponse = <T>(
  message: string,
  data?: T,
  pagination?: PaginationInfo
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    pagination,
  };
};

export const createErrorResponse = (message: string, error?: string): ApiResponse => {
  return {
    success: false,
    message,
    error,
  };
};

// Price utilities
export const formatPrice = (price: number): number => {
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

export const calculateTax = (amount: number, taxRate: number = 0.2): number => {
  return formatPrice(amount * taxRate);
};

export const calculateDiscount = (originalPrice: number, discountPercent: number): number => {
  return formatPrice(originalPrice * (discountPercent / 100));
};

// Date utilities
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isExpired = (date: Date): boolean => {
  return date < new Date();
};

// String utilities
export const generateSlug = (text: string): string => {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // If slug is empty or contains only non-allowed chars, return a random one
  // but we keep non-ASCII chars for better SEO in Arabic
  return slug || `category-${Date.now()}`;
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Array utilities
export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Cache key utilities
export const generateCacheKey = (prefix: string, ...parts: string[]): string => {
  return `${config.cache.prefix}${prefix}:${parts.join(':')}`;
};

// Error utilities
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  return new AppError(message, statusCode);
};

// Async wrapper for error handling
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Environment utilities
export const isDevelopment = (): boolean => {
  return config.nodeEnv === 'development';
};

export const isProduction = (): boolean => {
  return config.nodeEnv === 'production';
};

export const isTest = (): boolean => {
  return config.nodeEnv === 'test';
};