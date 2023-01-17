import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType
} from 'type-graphql';
import { Tree } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeProfile } from '../../types/TreeProfile';


@InputType()
export class FollowTreeInput {
  @Field()
  treeId: string

  @Field({ nullable: true })
  unfollow?: boolean
}


@Resolver()
export class FollowTreeResolver {
  @Mutation(() => TreeProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async followTree(
    @Arg('data') { treeId, unfollow }: FollowTreeInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<Tree> {
    const { id: userId } = context.accessToken.data;
    return context.db.write.tree.update({
      where: {
        id: treeId,
      },
      data: {
        followers: {
          [unfollow ? 'disconnect' : 'connect']: {
            id: userId,
          },
        },
      },
    });
  }
}
