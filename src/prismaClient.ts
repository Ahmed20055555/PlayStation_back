import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  errorFormat: 'minimal'
} as any);

export default prisma;