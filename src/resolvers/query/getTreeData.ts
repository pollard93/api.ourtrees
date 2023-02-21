import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware,
  Field,
  InputType,
  Arg } from 'type-graphql';
import { TreeData } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { GenericError } from '../../errors';


@InputType()
export class GetTreeDataInput {
  @Field()
  id: number
}


@Resolver()
export class GetTreeDataResolver {
  @Query(() => TreeDataProfile, { nullable: true })
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getTreeData(
    @Arg('data') data: GetTreeDataInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeData> {
    const res = await context.db.read.treeData.findUnique({
      where: {
        id: data.id,
      },
    });
    if (!res) throw GenericError('Resource does not exist');
    return res;
  }
}
