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
