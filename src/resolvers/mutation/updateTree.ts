import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType } from 'type-graphql';
import { Tree } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeProfile } from '../../types/TreeProfile';
import { GenericError } from '../../errors';


@InputType()
export class UpdateTreeInput {
  @Field()
  id: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  cultivationDate?: string
}


@Resolver()
export class UpdateTreeResolver {
  @Mutation(() => TreeProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async updateTree(
    @Arg('data') { id, name, cultivationDate }: UpdateTreeInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<Tree> {
    const { id: creatorId } = context.accessToken.data;


    /**
     * Get tree and validate owner
     */
    const tree = await context.db.read.tree.findUnique({
      where: {
        id,
      },
    });
    if (!tree) throw GenericError('Tree does not exist');
    if (tree.creatorId !== creatorId) throw GenericError('Unauthorized');


    /**
     * Update tree
     */
    return context.db.write.tree.update({
      where: {
        id: tree.id,
      },
      data: {
        name,
        cultivationDate,
      },
    });
  }
}
