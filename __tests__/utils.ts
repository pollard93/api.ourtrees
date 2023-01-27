import * as random from 'random-utility';
import uuidv4 from 'uuid/v4';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { generateToken, hashPassword } from '../src/modules/Auth';
import { TokenType } from '../src/modules/Auth/interfaces';

export default class TestUtils {
  constructor(private readonly db: PrismaClient) {
    this.db = db;
  }

  async createUser(data?: Partial<Prisma.UserCreateInput>): Promise<{ token: string, user: User }> {
    const user = await this.db.user.create({
      data: {
        name: TestUtils.randomString(),
        email: TestUtils.randomEmail(),
        password: await hashPassword('password'),
        ...data,
      },
    });

    return {
      token: generateToken({
        type: TokenType.GENERAL,
        sessionId: uuidv4(),
        data: {
          id: user.id,
          email: user.email,
        },
      }),
      user,
    };
  }

  async createCountry() {
    const countryName = TestUtils.randomString();

    await this.db.country.create({
      data: {
        name: countryName,
      },
    });

    return countryName;
  }

  async createTreeData(data?: Partial<Prisma.TreeDataCreateInput>) {
    return this.db.treeData.create({
      data: {
        id: TestUtils.getRandomInt(10000),
        taxon: TestUtils.randomString(),
        author: TestUtils.randomString(),
        family: TestUtils.randomString(),
        countries: {
          connect: {
            name: await this.createCountry(),
          },
        },
        careDifficultyResult: {
          create: {
            count: 0,
            easy: 0,
            moderate: 0,
            hard: 0,
          },
        },
        careWaterResult: {
          create: {
            count: 0,
            weekly: 0,
            biweekly: 0,
            triweekly: 0,
          },
        },
        careSunlightResult: {
          create: {
            count: 0,
            indirect: 0,
            partial: 0,
            direct: 0,
          },
        },
        careGerminationDifficultyResult: {
          create: {
            count: 0,
            easy: 0,
            moderate: 0,
            hard: 0,
          },
        },
        carePlantingResult: {
          create: {
            count: 0,
            jan: 0,
            feb: 0,
            mar: 0,
            apr: 0,
            may: 0,
            jun: 0,
            jul: 0,
            aug: 0,
            sep: 0,
            oct: 0,
            nov: 0,
            dec: 0,
          },
        },
        careWhenToReleaseResult: {
          create: {
            count: 0,
            jan: 0,
            feb: 0,
            mar: 0,
            apr: 0,
            may: 0,
            jun: 0,
            jul: 0,
            aug: 0,
            sep: 0,
            oct: 0,
            nov: 0,
            dec: 0,
          },
        },
        careObtainingSeedsResult: {
          create: {},
        },
        ...data,
      },
    });
  }

  async createTree(data?: Partial<Prisma.TreeCreateInput>) {
    return this.db.tree.create({
      data: {
        name: TestUtils.randomString(),
        creator: {
          connect: {
            id: (await this.createUser()).user.id,
          },
        },
        treeData: {
          connect: {
            id: (await this.createTreeData()).id,
          },
        },
        ...data,
      },
    });
  }

  static randomEmail() {
    return random.email({ domain: random.domain({ level: 2, tld: 'com' }) });
  }

  static randomString() {
    return uuidv4();
  }

  static getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  static getCookie(cookieString: string, name: string) {
    const parts = cookieString.split('; ').find((s) => s.startsWith(name)).split('=');
    if (parts.length === 2) return parts[1];
    return null;
  }
}
