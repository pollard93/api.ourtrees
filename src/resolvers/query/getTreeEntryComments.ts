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
import { TreeEntryComment } from '@prisma/client';
import { Max } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeEntryCommentProfile } from '../../types/TreeEntryCommentProfile';
import { GenericError } from '../../errors';

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@InputType()
class TreeEntryCommentWhereUniqueInput {
  @Field()
  id: string;
}

@InputType()
export class GetTreeEntryCommentsInput {
  @Field(() => ID)
  treeEntryId: string;

  @Field(() => TreeEntryCommentWhereUniqueInput, { nullable: true })
  cursor?: TreeEntryCommentWhereUniqueInput;

  @Field()
  @Max(30)
  take: number;
}

@ObjectType()
export class TreeEntryCommentProfilesPayLoad {
  @Field(() => [TreeEntryCommentProfile])
  comments: TreeEntryCommentProfile[];

  @Field(() => Int)
  count: number;
}

@Resolver()
export class GetTreeEntryCommentsResolver {
  @Query(() => TreeEntryCommentProfilesPayLoad)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async getTreeEntryComments(
    @Arg('data') data: GetTreeEntryCommentsInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ comments: TreeEntryComment[]; count: number }> {
    /**
     * Get comments and return
     * @TODO - must not return reported (add delete and report)
     */
    const comments = await context.db.read.treeEntry
      .findUnique({ where: { id: data.treeEntryId } })
      .comments({
        cursor: data.cursor,
        take: data.take,
      });

    /**
     * If treeEntry does not exist
     */
    if (comments === null) throw GenericError('Tree entry does not exist');

    /**
     * Count
     */
    const count = await context.db.read.treeEntryComment.count({
      where: {
        treeEntryId: data.treeEntryId,
      },
    });

    return {
      comments,
      count,
    };
  }
}
