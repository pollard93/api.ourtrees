/* eslint-disable no-void */
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import UserSeeder from '../utils/UserSeed';
import { InitFileHandler } from '../../../src/modules/FileHandler';

dotenv.config();
InitFileHandler();

void (async function main() {
  const prisma = new PrismaClient();

  try {
    // Create User
    const userSeeder = new UserSeeder(prisma);
    await userSeeder.createUser('dev@madebyprism.com', 'password');
  // eslint-disable-next-line no-empty
  } catch {}

  await prisma.$disconnect();
}());
