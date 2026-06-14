import { PrismaClient } from '@prisma/client';
import config from '../config';

// Singleton pattern for Prisma Client
class PrismaService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty',
      });

      // Handle graceful shutdown
      process.on('beforeExit', async () => {
        await PrismaService.instance.$disconnect();
      });

      process.on('SIGINT', async () => {
        await PrismaService.instance.$disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await PrismaService.instance.$disconnect();
        process.exit(0);
      });
    }

    return PrismaService.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const prisma = PrismaService.getInstance();
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      if (PrismaService.instance) {
        await PrismaService.instance.$disconnect();
        console.log('✅ Database disconnected successfully');
      }
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = PrismaService.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

// Export the Prisma instance
export const prisma = PrismaService.getInstance();
export default PrismaService;