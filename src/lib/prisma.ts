import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const dbName = 'dev.db';
  const bundledDbPath = path.join(process.cwd(), 'prisma', dbName);
  const writableDbPath = path.join('/tmp', dbName);

  if (!fs.existsSync(writableDbPath)) {
    try {
      fs.mkdirSync(path.dirname(writableDbPath), { recursive: true });
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, writableDbPath);
      } else {
        fs.writeFileSync(writableDbPath, '');
      }
    } catch (error) {
      console.error('Failed to copy database to /tmp:', error);
    }
  }

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${writableDbPath}`,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });
} else {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
}

export { prisma };

