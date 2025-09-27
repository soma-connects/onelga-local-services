import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with proper configuration
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    errorFormat: 'pretty',
  });
};

// Use global instance in development to prevent multiple connections
// In production, create a new instance each time
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

// Logging is currently disabled due to a bug

// Database connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (tx: Omit<PrismaClient, '\$connect' | '\$disconnect' | '\$on' | '\$transaction' | '\$use' | '\$extends'>) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

// Database utilities
export const dbUtils = {
  // Check if a record exists
  exists: async (
    model: { count: (args: any) => Promise<number> },
    where: any
  ): Promise<boolean> => {
    const count = await model.count({ where });
    return count > 0;
  },

  // Soft delete helper
  softDelete: async <T extends { update: (args: any) => Promise<any> }>(
    model: T,
    where: any
  ): Promise<ReturnType<T['update']>> => {
    return await model.update({
      where,
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  },

  // Restore soft deleted record
  restore: async <T extends { update: (args: any) => Promise<any> }>(
    model: T,
    where: any
  ): Promise<ReturnType<T['update']>> => {
    return await model.update({
      where,
      data: {
        deletedAt: null,
        isActive: true,
      },
    });
  },

  // Pagination helper
  paginate: async <T>(
    model: any,
    options: {
      page?: number;
      limit?: number;
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    } = {}
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> => {
    const {
      page = 1,
      limit = 10,
      where = {},
      orderBy = { createdAt: 'desc' },
      include,
      select,
    } = options;

    const skip = (page - 1) * limit;
    const take = limit;

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        skip,
        take,
        include,
        select,
      }),
      model.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  },
};

// Export default prisma instance
export default prisma;
