import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { TreeComment } from '@prisma/client';
import { MaxLength } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeCommentProfile } from '../../types/TreeCommentProfile';
import { GenericError } from '../../errors';


@InputType()
export class CreateTreeCommentInput {
  @Field()
  treeId: string

  @Field()
  @MaxLength(280)
  comment: string
}


@Resolver()
export class CreateTreeCommentResolver {
  @Mutation(() => TreeCommentProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async createTreeComment(
    @Arg('data') { treeId, comment }: CreateTreeCommentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeComment> {
    const { id: creatorId } = context.accessToken.data;


    /**
     * Get tree and validate owner
     */
    const tree = await context.db.read.tree.findUnique({
      where: {
        id: treeId,
      },
    });
    if (!tree) throw GenericError('Tree does not exist');


    /**
     * Create
     */
    return context.db.write.treeComment.create({
      data: {
        comment,
        creatorId,
        treeId,
      },
    });
  }
}
