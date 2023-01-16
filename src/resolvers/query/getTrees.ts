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
import { Tree, Prisma } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeProfile } from '../../types/TreeProfile';


export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}


@InputType()
class TreeWhereInput {
  @Field({ nullable: true })
  treeDataId?: number

  @Field({ nullable: true })
  creatorId?: string
}


@InputType()
class TreeWhereUniqueInput {
  @Field()
  id: string
}


@InputType()
export class GetTreesInput {
  @Field(() => TreeWhereInput)
  where: TreeWhereInput

  @Field(() => TreeWhereUniqueInput, { nullable: true })
  cursor?: TreeWhereUniqueInput

  @Field()
  take: number
}


@ObjectType()
export class TreeProfilesPayLoad {
  @Field(() => [TreeProfile])
  trees: TreeProfile[]

  @Field(() => Int)
  count: number
}


@Resolver()
export class GetTreesResolver {
  @Query(() => TreeProfilesPayLoad)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getTrees(
    @Arg('data') data: GetTreesInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ trees: Tree[], count: number }> {
    /**
     * Where
     */
    const where: Prisma.TreeWhereInput = {
      ...(data.where.creatorId ? { creatorId: data.where.creatorId } : {}),
      ...(data.where.treeDataId ? { treeDataId: data.where.treeDataId } : {}),
    };


    /**
     * Get trees and return
     */
    const trees = await context.db.read.tree.findMany({
      where,
      cursor: data?.cursor,
      take: data.take,
    });


    /**
     * Count
     */
    const count = await context.db.read.tree.count({
      where,
    });


    return {
      trees,
      count,
    };
  }
}
