import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware,
  Int,
  Field,
  ObjectType,
  InputType,
  Arg } from 'type-graphql';
import { TreeDataCareHowToPlantSeedsContent } from '@prisma/client';
import { Max } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataCareHowToPlantSeedsContentProfile } from '../../types/TreeDataCareHowToPlantSeedsContentProfile';
import { GenericError } from '../../errors';


export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}


@InputType()
class TreeDataCareHowToPlantSeedsContentWhereUniqueInput {
  @Field()
  id: string
}


@InputType()
export class GetTreeDataCareHowToPlantSeedsContentsInput {
  @Field()
  treeDataId: number

  @Field(() => TreeDataCareHowToPlantSeedsContentWhereUniqueInput, { nullable: true })
  cursor?: TreeDataCareHowToPlantSeedsContentWhereUniqueInput

  @Field()
  @Max(30)
  take: number
}


@ObjectType()
export class TreeDataCareHowToPlantSeedsContentProfilesPayLoad {
  @Field(() => [TreeDataCareHowToPlantSeedsContentProfile])
  notes: TreeDataCareHowToPlantSeedsContentProfile[]

  @Field(() => Int)
  count: number
}


@Resolver()
export class GetTreeDataCareHowToPlantSeedsContentsResolver {
  @Query(() => TreeDataCareHowToPlantSeedsContentProfilesPayLoad)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getTreeDataCareHowToPlantSeedsContents(
    @Arg('data') data: GetTreeDataCareHowToPlantSeedsContentsInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ notes: TreeDataCareHowToPlantSeedsContent[], count: number }> {
    /**
     * Get notes and return
     */
    const notes = await context.db.read.treeData.findUnique({ where: { id: data.treeDataId } }).careHowToPlantSeedsContents({
      where: {
        reportedAt: null,
      },
      cursor: data.cursor,
      take: data.take,
    });


    /**
     * If tree does not exist
     */
    if (notes === null) throw GenericError('Tree data does not exist');


    /**
     * Count
     */
    const count = await context.db.read.treeDataCareHowToPlantSeedsContent.count({
      where: {
        reportedAt: null,
        treeDataId: data.treeDataId,
      },
    });


    return {
      notes,
      count,
    };
  }
}
