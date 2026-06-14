import { Request } from 'express';

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  images: string[];
  tags: string[];
  isOrganic: boolean;
  isFeatured: boolean;
  isActive: boolean;
  weight?: number;
  dimensions?: ProductDimensions;
  nutritionalInfo?: NutritionalInfo;
  certifications: string[];
  origin?: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: 'cm' | 'mm' | 'inch';
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;

  // Billing Information
  billingAddress: Address;

  // Shipping Information
  shippingAddress: Address;
  shippingMethod: string;
  trackingNumber?: string;

  // Payment Information
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;

  // Order Notes
  notes?: string;

  // Timestamps
  orderDate: Date;
  shippedDate?: Date;
  deliveredDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

// Address Types
export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductQuery extends PaginationQuery {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  isOrganic?: string;
  isFeatured?: string;
  search?: string;
  tags?: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  captchaToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Cache Types
export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Shipping Types
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  isActive: boolean;
}

export interface ShippingRate {
  method: ShippingMethod;
  cost: number;
  estimatedDelivery: Date;
}

// Moroccan Regions (matching frontend)
export const MOROCCAN_REGIONS = [
  'agadir-ida-ou-tanane',
  'azilal',
  'beni-mellal',
  'berkane',
  'ben-slimane',
  'boujdour',
  'boulemane',
  'berrechid',
  'casablanca',
  'chefchaouen',
  'chichaoua',
  'chtouka-ait-baha',
  'driouch',
  'essaouira',
  'errachidia',
  'fahs-beni-makada',
  'fes-dar-dbibegh',
  'figuig',
  'fquih-ben-salah',
  'guelmim',
  'guercif',
  'el-hajeb',
  'al-haouz',
  'al-hoceima',
  'ifrane',
  'inezgane-ait-melloul',
  'el-jadida',
  'jerada',
  'kenitra',
  'kelaat-sraghna',
  'khemisset',
  'khenifra',
  'khouribga',
  'laayoune',
  'larache',
  'marrakech',
  'mdiq-fnideq',
  'mediouna',
  'meknes',
  'midelt',
  'marrakech-medina',
  'marrakech-menara',
  'mohammedia',
  'moulay-yacoub',
  'nador',
  'nouaceur',
  'ouarzazate',
  'oued-ed-dahab',
  'oujda-angad',
  'ouezzane',
  'rabat',
  'rehamna',
  'safi',
  'sale',
  'sefrou',
  'settat',
  'sidi-bennour',
  'sidi-ifni',
  'sidi-kacem',
  'sidi-slimane',
  'skhirat-temara',
  'sidi-youssef-ben-ali',
  'tarfaya',
  'taourirt',
  'taounate',
  'taroudant',
  'tata',
  'taza',
  'tetouan',
  'tinghir',
  'tiznit',
  'tangier-assilah',
  'tan-tan',
  'youssoufia',
  'zagora'
] as const;

export type MoroccanRegion = typeof MOROCCAN_REGIONS[number];