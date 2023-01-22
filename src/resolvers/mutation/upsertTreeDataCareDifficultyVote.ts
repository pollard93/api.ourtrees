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
import { TreeData, TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';


@InputType()
export class UpsertTreeDataCareDifficultyVoteInput {
  @Field()
  treeDataId: number

  @Field(() => TREE_CARE_DIFFICULTY_TYPE)
  type: TREE_CARE_DIFFICULTY_TYPE
}


@Resolver()
export class UpsertTreeDataCareDifficultyVoteResolver {
  @Mutation(() => TreeDataProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async upsertTreeDataCareDifficultyVote(
    @Arg('data') { treeDataId, type }: UpsertTreeDataCareDifficultyVoteInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeData> {
    const { id: userId } = context.accessToken.data;

    /**
     * Upsert vote
     */
    await context.db.write.treeDataCareDifficultyVote.upsert({
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
        careDifficultyResult: {
          upsert: {
            create: {
              count: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId } }),
              easy: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId, type: TREE_CARE_DIFFICULTY_TYPE.EASY } }),
              moderate: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId, type: TREE_CARE_DIFFICULTY_TYPE.MODERATE } }),
              hard: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId, type: TREE_CARE_DIFFICULTY_TYPE.HARD } }),
            },
            update: {
              count: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId } }),
              easy: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId, type: TREE_CARE_DIFFICULTY_TYPE.EASY } }),
              moderate: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId, type: TREE_CARE_DIFFICULTY_TYPE.MODERATE } }),
              hard: await context.db.read.treeDataCareDifficultyVote.count({ where: { treeDataId, type: TREE_CARE_DIFFICULTY_TYPE.HARD } }),
            },
          },
        },
      },
    });
  }
}
