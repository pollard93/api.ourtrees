import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware,
  Field,
  InputType,
  Arg,
  ID } from 'type-graphql';
import { Tree } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeProfile } from '../../types/TreeProfile';
import { GenericError } from '../../errors';


@InputType()
export class GetTreeInput {
  @Field(() => ID)
  id: string
}


@Resolver()
export class GetTreeResolver {
  @Query(() => TreeProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getTree(
    @Arg('data') data: GetTreeInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<Tree> {
    const tree = await context.db.read.tree.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!tree) throw GenericError('Tree does not exist');
    return tree;
  }
}
