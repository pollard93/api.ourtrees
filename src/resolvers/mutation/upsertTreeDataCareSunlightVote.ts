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
import { TreeData, TREE_CARE_SUNLIGHT_TYPE } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';


@InputType()
export class UpsertTreeDataCareSunlightVoteInput {
  @Field()
  treeDataId: number

  @Field(() => TREE_CARE_SUNLIGHT_TYPE)
  type: TREE_CARE_SUNLIGHT_TYPE
}


@Resolver()
export class UpsertTreeDataCareSunlightVoteResolver {
  @Mutation(() => TreeDataProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async upsertTreeDataCareSunlightVote(
    @Arg('data') { treeDataId, type }: UpsertTreeDataCareSunlightVoteInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeData> {
    const { id: userId } = context.accessToken.data;

    /**
     * Upsert vote
     */
    await context.db.write.treeDataCareSunlightVote.upsert({
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
        careSunlightResult: {
          upsert: {
            create: {
              count: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId } }),
              indirect: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId, type: TREE_CARE_SUNLIGHT_TYPE.INDIRECT } }),
              partial: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId, type: TREE_CARE_SUNLIGHT_TYPE.PARTIAL } }),
              direct: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId, type: TREE_CARE_SUNLIGHT_TYPE.DIRECT } }),
            },
            update: {
              count: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId } }),
              indirect: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId, type: TREE_CARE_SUNLIGHT_TYPE.INDIRECT } }),
              partial: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId, type: TREE_CARE_SUNLIGHT_TYPE.PARTIAL } }),
              direct: await context.db.read.treeDataCareSunlightVote.count({ where: { treeDataId, type: TREE_CARE_SUNLIGHT_TYPE.DIRECT } }),
            },
          },
        },
      },
    });
  }
}
