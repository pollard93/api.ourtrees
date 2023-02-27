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
export class DeleteTreeInput {
  @Field()
  id: string
}


@Resolver()
export class DeleteTreeResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async deleteTree(
    @Arg('data') { id }: DeleteTreeInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    const { id: creatorId } = context.accessToken.data;


    /**
     * Get tree and validate owner
     */
    const tree = await context.db.read.treeEntry.findUnique({
      where: {
        id,
      },
      include: {
        tree: true,
      },
    });
    if (!tree) throw GenericError('Tree does not exist');
    if (tree.tree.creatorId !== creatorId) throw GenericError('Unauthorized');


    /**
     * Update tree
     */
    await context.db.write.tree.delete({
      where: {
        id: tree.id,
      },
    });


    return true;
  }
}
