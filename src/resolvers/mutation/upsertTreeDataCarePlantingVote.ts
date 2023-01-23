import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType,
  Int
} from 'type-graphql';
import { TreeData } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataProfile } from '../../types/TreeDataProfile';


@InputType()
export class UpsertTreeDataCarePlantingVoteInput {
  @Field()
  treeDataId: number

  @Field(() => [Int])
  months: number[]
}


@Resolver()
export class UpsertTreeDataCarePlantingVoteResolver {
  @Mutation(() => TreeDataProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async upsertTreeDataCarePlantingVote(
    @Arg('data') { treeDataId, months }: UpsertTreeDataCarePlantingVoteInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeData> {
    const { id: userId } = context.accessToken.data;

    /**
     * Upsert vote
     */
    await context.db.write.treeDataCarePlantingVote.upsert({
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
        jan: months.includes(1),
        feb: months.includes(2),
        mar: months.includes(3),
        apr: months.includes(4),
        may: months.includes(5),
        jun: months.includes(6),
        jul: months.includes(7),
        aug: months.includes(8),
        sep: months.includes(9),
        oct: months.includes(10),
        nov: months.includes(11),
        dec: months.includes(12),
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
        jan: months.includes(1),
        feb: months.includes(2),
        mar: months.includes(3),
        apr: months.includes(4),
        may: months.includes(5),
        jun: months.includes(6),
        jul: months.includes(7),
        aug: months.includes(8),
        sep: months.includes(9),
        oct: months.includes(10),
        nov: months.includes(11),
        dec: months.includes(12),
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
        carePlantingResult: {
          upsert: {
            create: {
              count: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId } }),
              jan: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, jan: true } }),
              feb: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, feb: true } }),
              mar: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, mar: true } }),
              apr: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, apr: true } }),
              may: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, may: true } }),
              jun: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, jun: true } }),
              jul: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, jul: true } }),
              aug: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, aug: true } }),
              sep: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, sep: true } }),
              oct: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, oct: true } }),
              nov: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, nov: true } }),
              dec: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, dec: true } }),
            },
            update: {
              count: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId } }),
              jan: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, jan: true } }),
              feb: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, feb: true } }),
              mar: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, mar: true } }),
              apr: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, apr: true } }),
              may: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, may: true } }),
              jun: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, jun: true } }),
              jul: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, jul: true } }),
              aug: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, aug: true } }),
              sep: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, sep: true } }),
              oct: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, oct: true } }),
              nov: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, nov: true } }),
              dec: await context.db.read.treeDataCarePlantingVote.count({ where: { treeDataId, dec: true } }),
            },
          },
        },
      },
    });
  }
}
