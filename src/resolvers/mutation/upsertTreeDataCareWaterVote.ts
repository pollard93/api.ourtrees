import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { TreeData, TREE_CARE_WATER_TYPE } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';

@InputType()
export class UpsertTreeDataCareWaterVoteInput {
  @Field()
  treeDataId: number;

  @Field(() => TREE_CARE_WATER_TYPE)
  type: TREE_CARE_WATER_TYPE;
}

@Resolver()
export class UpsertTreeDataCareWaterVoteResolver {
  @Mutation(() => TreeDataProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async upsertTreeDataCareWaterVote(
    @Arg('data') { treeDataId, type }: UpsertTreeDataCareWaterVoteInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeData> {
    const { id: userId } = context.accessToken.data;

    /**
     * Upsert vote
     */
    await context.db.write.treeDataCareWaterVote.upsert({
      where: {
        userId_treeDataId: {
          userId,
          treeDataId,
        },
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        treeData: {
          connect: {
            id: treeDataId,
          },
        },
        type,
      },
      update: {
        user: {
          connect: {
            id: userId,
          },
        },
        treeData: {
          connect: {
            id: treeDataId,
          },
        },
        type,
      },
    });

    /**
     * Update tree data with counts
     */
    return context.db.write.treeData.update({
      where: {
        id: treeDataId,
      },
      data: {
        careWaterResult: {
          upsert: {
            create: {
              count: await context.db.read.treeDataCareWaterVote.count({ where: { treeDataId } }),
              weekly: await context.db.read.treeDataCareWaterVote.count({
                where: { treeDataId, type: TREE_CARE_WATER_TYPE.WEEKLY },
              }),
              biweekly: await context.db.read.treeDataCareWaterVote.count({
                where: { treeDataId, type: TREE_CARE_WATER_TYPE.BIWEEKLY },
              }),
              triweekly: await context.db.read.treeDataCareWaterVote.count({
                where: { treeDataId, type: TREE_CARE_WATER_TYPE.TRIWEEKLY },
              }),
            },
            update: {
              count: await context.db.read.treeDataCareWaterVote.count({ where: { treeDataId } }),
              weekly: await context.db.read.treeDataCareWaterVote.count({
                where: { treeDataId, type: TREE_CARE_WATER_TYPE.WEEKLY },
              }),
              biweekly: await context.db.read.treeDataCareWaterVote.count({
                where: { treeDataId, type: TREE_CARE_WATER_TYPE.BIWEEKLY },
              }),
              triweekly: await context.db.read.treeDataCareWaterVote.count({
                where: { treeDataId, type: TREE_CARE_WATER_TYPE.TRIWEEKLY },
              }),
            },
          },
        },
      },
    });
  }
}
