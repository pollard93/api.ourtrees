import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { TreeEntryComment } from '@prisma/client';
import { MaxLength } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeEntryCommentProfile } from '../../types/TreeEntryCommentProfile';
import { GenericError } from '../../errors';


@InputType()
export class CreateTreeEntryCommentInput {
  @Field()
  treeEntryId: string

  @Field()
  @MaxLength(280)
  comment: string
}


@Resolver()
export class CreateTreeEntryCommentResolver {
  @Mutation(() => TreeEntryCommentProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async createTreeEntryComment(
    @Arg('data') { treeEntryId, comment }: CreateTreeEntryCommentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeEntryComment> {
    const { id: creatorId } = context.accessToken.data;


    /**
     * Get treeEntry and validate owner
     */
    const treeEntry = await context.db.read.treeEntry.findUnique({
      where: {
        id: treeEntryId,
      },
    });
    if (!treeEntry) throw GenericError('Tree entry does not exist');


    /**
     * Create
     */
    return context.db.write.treeEntryComment.create({
      data: {
        comment,
        creatorId,
        treeEntryId,
      },
    });
  }
}
