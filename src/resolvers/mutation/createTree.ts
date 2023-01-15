import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType
} from 'type-graphql';
import { Tree } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeProfile } from '../../types/TreeProfile';


@InputType()
export class CreateTreeProfileInput {
  @Field()
  treeDataId: number

  @Field()
  name: string

  @Field({ nullable: true })
  cultivationDate?: string
}


@Resolver()
export class CreateTreeProfileResolver {
  @Mutation(() => TreeProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async createTree(
    @Arg('data') { treeDataId, name, cultivationDate }: CreateTreeProfileInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<Tree> {
    const { id: creatorId } = context.accessToken.data;
    return context.db.write.tree.create({
      data: {
        creatorId,
        treeDataId,
        name,
        cultivationDate,
      },
    });
  }
}
