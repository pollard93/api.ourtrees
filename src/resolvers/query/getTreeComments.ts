import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware,
  Int,
  Field,
  ObjectType,
  InputType,
  Arg,
  ID } from 'type-graphql';
import { TreeComment } from '@prisma/client';
import { Max } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeCommentProfile } from '../../types/TreeCommentProfile';
import { GenericError } from '../../errors';


export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}


@InputType()
class TreeCommentWhereUniqueInput {
  @Field()
  id: string
}


@InputType()
export class GetTreeCommentsInput {
  @Field(() => ID)
  treeId: string

  @Field(() => TreeCommentWhereUniqueInput, { nullable: true })
  cursor?: TreeCommentWhereUniqueInput

  @Field()
  @Max(30)
  take: number
}


@ObjectType()
export class TreeCommentProfilesPayLoad {
  @Field(() => [TreeCommentProfile])
  comments: TreeCommentProfile[]

  @Field(() => Int)
  count: number
}


@Resolver()
export class GetTreeCommentsResolver {
  @Query(() => TreeCommentProfilesPayLoad)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getTreeComments(
    @Arg('data') data: GetTreeCommentsInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ comments: TreeComment[], count: number }> {
    /**
     * Get comments and return
     */
    const comments = await context.db.read.tree.findUnique({ where: { id: data.treeId } }).comments({
      cursor: data.cursor,
      take: data.take,
    });


    /**
     * If tree does not exist
     */
    if (comments === null) throw GenericError('Tree does not exist');


    /**
     * Count
     */
    const count = await context.db.read.treeComment.count({
      where: {
        treeId: data.treeId,
      },
    });


    return {
      comments,
      count,
    };
  }
}
