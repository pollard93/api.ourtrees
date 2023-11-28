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
  Arg,
} from 'type-graphql';
import { TreeDataCareObtainingSeedsContent } from '@prisma/client';
import { Max } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataCareObtainingSeedsContentProfile } from '../../types/TreeDataCareObtainingSeedsContentProfile';
import { GenericError } from '../../errors';

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@InputType()
class TreeDataCareObtainingSeedsContentWhereUniqueInput {
  @Field()
  id: string;
}

@InputType()
export class GetTreeDataCareObtainingSeedsContentsInput {
  @Field()
  treeDataId: number;

  @Field(() => TreeDataCareObtainingSeedsContentWhereUniqueInput, { nullable: true })
  cursor?: TreeDataCareObtainingSeedsContentWhereUniqueInput;

  @Field()
  @Max(30)
  take: number;
}

@ObjectType()
export class TreeDataCareObtainingSeedsContentProfilesPayLoad {
  @Field(() => [TreeDataCareObtainingSeedsContentProfile])
  notes: TreeDataCareObtainingSeedsContentProfile[];

  @Field(() => Int)
  count: number;
}

@Resolver()
export class GetTreeDataCareObtainingSeedsContentsResolver {
  @Query(() => TreeDataCareObtainingSeedsContentProfilesPayLoad)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async getTreeDataCareObtainingSeedsContents(
    @Arg('data') data: GetTreeDataCareObtainingSeedsContentsInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ notes: TreeDataCareObtainingSeedsContent[]; count: number }> {
    /**
     * Get notes and return
     */
    const notes = await context.db.read.treeData
      .findUnique({ where: { id: data.treeDataId } })
      .careObtainingSeedsContents({
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
    const count = await context.db.read.treeDataCareObtainingSeedsContent.count({
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
