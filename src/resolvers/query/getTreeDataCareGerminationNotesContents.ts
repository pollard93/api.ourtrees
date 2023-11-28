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
import { TreeDataCareGerminationNotesContent } from '@prisma/client';
import { Max } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataCareGerminationNotesContentProfile } from '../../types/TreeDataCareGerminationNotesContentProfile';
import { GenericError } from '../../errors';

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@InputType()
class TreeDataCareGerminationNotesContentWhereUniqueInput {
  @Field()
  id: string;
}

@InputType()
export class GetTreeDataCareGerminationNotesContentsInput {
  @Field()
  treeDataId: number;

  @Field(() => TreeDataCareGerminationNotesContentWhereUniqueInput, { nullable: true })
  cursor?: TreeDataCareGerminationNotesContentWhereUniqueInput;

  @Field()
  @Max(30)
  take: number;
}

@ObjectType()
export class TreeDataCareGerminationNotesContentProfilesPayLoad {
  @Field(() => [TreeDataCareGerminationNotesContentProfile])
  notes: TreeDataCareGerminationNotesContentProfile[];

  @Field(() => Int)
  count: number;
}

@Resolver()
export class GetTreeDataCareGerminationNotesContentsResolver {
  @Query(() => TreeDataCareGerminationNotesContentProfilesPayLoad)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async getTreeDataCareGerminationNotesContents(
    @Arg('data') data: GetTreeDataCareGerminationNotesContentsInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ notes: TreeDataCareGerminationNotesContent[]; count: number }> {
    /**
     * Get notes and return
     */
    const notes = await context.db.read.treeData
      .findUnique({ where: { id: data.treeDataId } })
      .careGerminationNotesContents({
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
    const count = await context.db.read.treeDataCareGerminationNotesContent.count({
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
