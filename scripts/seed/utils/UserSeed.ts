import { User } from '@prisma/client';
import { Seeder } from './Seeder';
import { hashPassword } from '../../../src/modules/Auth/index';

class UserSeeder extends Seeder {
  async createUser(email: string, password: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
      },
    });
  }
}

export default UserSeeder;
