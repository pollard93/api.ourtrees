import 'reflect-metadata';
import { Resolver, Ctx, Query, UseMiddleware, Field, InputType, Arg, ID } from 'type-graphql';
import { TreeEntry } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeEntryProfile } from '../../types/TreeEntryProfile';
import { GenericError } from '../../errors';

@InputType()
export class GetTreeEntryInput {
  @Field(() => ID)
  id: string;
}

@Resolver()
export class GetTreeEntryResolver {
  @Query(() => TreeEntryProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async getTreeEntry(
    @Arg('data') data: GetTreeEntryInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeEntry> {
    const treeEntry = await context.db.read.treeEntry.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!treeEntry) throw GenericError('Tree entry does not exist');
    return treeEntry;
  }
}
