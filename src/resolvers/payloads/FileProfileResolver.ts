import { File, User } from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { FileHandler } from '../../modules/FileHandler';
import { FileProfile, UrlProfile } from '../../types/FileProfile';
import { UserProfile } from '../../types/UserProfile';
import { Context } from '../../utils/types';


@Resolver(() => FileProfile)
export class FileProfileResolver {
  @FieldResolver(() => UserProfile, { nullable: true })
  author(@Root() { authorId }: File, @Ctx() context: Context<null>): Promise<User | null> {
    return context.db.read.user.findUnique({ where: { id: authorId } });
  }

  @FieldResolver(() => UrlProfile)
  async url(@Root() root: File, @Ctx() context: Context<null>): Promise<UrlProfile> {
    return {
      splash: await FileHandler.getUrl({
        path: root.path,
        thumbnail: 'splash',
        publicCacheBuster: context.fileCacheBuster,
      }),
      small: await FileHandler.getUrl({
        path: root.path,
        thumbnail: 'small',
        publicCacheBuster: context.fileCacheBuster,
      }),
      large: await FileHandler.getUrl({
        path: root.path,
        thumbnail: 'large',
        publicCacheBuster: context.fileCacheBuster,
      }),
      full: await FileHandler.getUrl({
        path: root.path,
        publicCacheBuster: context.fileCacheBuster,
      }),
    };
  }
}
