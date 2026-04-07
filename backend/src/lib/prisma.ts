import { PrismaClient } from '@prisma/client';
import { softDeleteMiddleware } from './softDelete.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

// TODO: Prisma v5+ removed $use middleware in favor of $extends.
// Soft-delete middleware needs to be migrated to $extends pattern.
// prisma.$use(softDeleteMiddleware());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
