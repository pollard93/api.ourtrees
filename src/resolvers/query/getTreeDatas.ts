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


export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}


@InputType()
class TreeDataWhereInput {
  @Field()
  countryName: string

  @Field({ nullable: true })
  nameSearch?: string
}


@InputType()
class TreeDataWhereUniqueInput {
  @Field()
  id: number
}


@InputType()
class TreeDataOrderByInput {
  @Field()
  taxon?: SortOrder

  @Field()
  family?: SortOrder
}


@InputType()
export class GetTreeDatasInput {
  @Field(() => TreeDataWhereInput)
  where: TreeDataWhereInput

  @Field(() => TreeDataWhereUniqueInput, { nullable: true })
  cursor?: TreeDataWhereUniqueInput

  @Field()
  take: number

  @Field(() => [TreeDataOrderByInput], { nullable: true })
  orderBy?: TreeDataOrderByInput[]
}


@ObjectType()
export class TreeDataProfilesPayLoad {
  @Field(() => [TreeDataProfile])
  treeDatas: TreeDataProfile[]

  @Field(() => Int)
  count: number
}


@Resolver()
export class GetTreeDatasResolver {
  @Query(() => TreeDataProfilesPayLoad)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getTreeDatas(
    @Arg('data') data: GetTreeDatasInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ treeDatas: TreeData[], count: number }> {
    /**
     * Always query users own treeDatas only
     */
    const where: Prisma.TreeDataWhereInput = {
      countries: {
        some: {
          name: data.where.countryName,
        },
      },
      ...(data.where.nameSearch ? {
        OR: [
          { taxon: { contains: data.where.nameSearch } },
          { family: { contains: data.where.nameSearch } },
        ],
      } : undefined),
    };


    /**
     * Get treeDatas and return
     */
    const treeDatas = await context.db.read.treeData.findMany({
      where,
      cursor: data?.cursor,
      take: data.take,
      orderBy: data?.orderBy,
    });


    /**
     * Count
     */
    const count = await context.db.read.treeData.count({
      where,
    });


    return {
      treeDatas,
      count,
    };
  }
}
