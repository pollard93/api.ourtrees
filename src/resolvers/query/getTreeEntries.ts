import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  Query,
  UseMiddleware,
  Int,
  Field,
  ObjectType,
  InputType,
  Arg,
  ID,
} from 'type-graphql';
import { TreeEntry } from '@prisma/client';
import { Max } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeEntryProfile } from '../../types/TreeEntryProfile';
import { GenericError } from '../../errors';

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@InputType()
class TreeEntryWhereUniqueInput {
  @Field()
  id: string;
}

@InputType()
export class GetTreeEntriesInput {
  @Field(() => ID)
  treeId: string;

  @Field(() => TreeEntryWhereUniqueInput, { nullable: true })
  cursor?: TreeEntryWhereUniqueInput;

  @Field()
  @Max(30)
  take: number;
}

@ObjectType()
export class TreeEntryProfilesPayLoad {
  @Field(() => [TreeEntryProfile])
  entries: TreeEntryProfile[];

  @Field(() => Int)
  count: number;
}

@Resolver()
export class GetTreeEntriesResolver {
  @Query(() => TreeEntryProfilesPayLoad)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async getTreeEntries(
    @Arg('data') data: GetTreeEntriesInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ entries: TreeEntry[]; count: number }> {
    /**
     * Get entries and return
     */
    const entries = await context.db.read.tree.findUnique({ where: { id: data.treeId } }).entries({
      cursor: data.cursor,
      take: data.take,
    });

    /**
     * If tree does not exist
     */
    if (entries === null) throw GenericError('Tree does not exist');

    /**
     * Count
     */
    const count = await context.db.read.treeEntry.count({
      where: {
        treeId: data.treeId,
      },
    });

    return {
      entries,
      count,
    };
  }
}
