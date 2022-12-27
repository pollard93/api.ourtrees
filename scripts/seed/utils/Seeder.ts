import { Prisma, PrismaClient } from '@prisma/client';
import request from 'request';
import uuidv4 from 'uuid/v4';
import { FileHandler } from '../../../src/modules/FileHandler';


export class Seeder {
  public prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }


  /**
   * Utility to get a random image from unsplash
   * Stores image and returns FileCreateInput to be inserted into queries
   *
   * @static
   * @param {{
   *     isPublic?: boolean;
   *     term?: string;
   *     dimensions?: {
   *       width: number;
   *       height: number;
   *     };
   *    }} [options]
   * @returns {Promise<FileCreateInput>}
   * @memberof Seeder
   */
  static async getRandomImage(options?: {
    isPublic?: boolean;
    term?: string;
    dimensions?: {
      width: number;
      height: number;
    };
   }): Promise<Prisma.FileCreateInput> {
    const requestOptions = {
      url: `https://source.unsplash.com/random/${options?.dimensions ? `${options.dimensions.width}x${options.dimensions.height}` : ''}?${options?.term ? options.term : ''}`,
      method: 'get',
      encoding: null,
    };

    return (new Promise((res) => {
      request(requestOptions, async (error, response, body) => {
        if (error) return res(null);

        const url = await FileHandler.putImage(`${options?.isPublic ? 'public/' : ''}testing/${uuidv4()}.jpeg`, body, true);
        return res({
          mime: 'image/jpeg',
          path: url.full,
          author: null,
        });
      });
    }));
  }
}
