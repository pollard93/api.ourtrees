import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';


@InputType()
export class ReportTreeCommentInput {
  @Field()
  id: string
}


@Resolver()
export class ReportTreeCommentResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async reportTreeComment(
    @Arg('data') { id }: ReportTreeCommentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    /**
     * Report comment
     */
    try {
      await context.db.write.treeComment.update({
        where: {
          id,
        },
        data: {
          reportedAt: new Date(),
        },
      });
    } catch (e) {
      if (e.message.includes('Record to update not found')) throw GenericError('Resource does not exist');
      throw e;
    }


    return true;
  }
}
