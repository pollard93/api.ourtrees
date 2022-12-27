import { DeepOmit } from 'ts-essentials';
import { Prisma, PrismaClient } from '@prisma/client';


/**
 * Remap prisma instances and omit read and write actions appropriately
 */
export interface Prisma {
  write: DeepOmit<
    PrismaClient,
    {
      [K in Uncapitalize<Prisma.ModelName>]: {
        findUnique: never;
        findFirst: never;
        findMany: never;
        count: never;
        aggregate: never;
        groupBy: never;
      }
    }
  >;
  read: DeepOmit<
    PrismaClient,
    {
      [K in Uncapitalize<Prisma.ModelName>]: {
        upsert: never;
        updateMany: never;
        deleteMany: never;
        update: never;
        delete: never;
        create: never;
        createMany: never;
      };
    }
  >;
}


export default (): Prisma => ({
  write: new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_WRITE } } }) as any,
  read: new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_READ } } }) as any,
});
