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
  Arg
} from 'type-graphql';
import { TreeData, Prisma } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';


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
  ): Promise<TreeData | null> {
    return context.db.read.treeData.findUnique({
      where: {
        id: data.id,
      },
    });
  }
}
