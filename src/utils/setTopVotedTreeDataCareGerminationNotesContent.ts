import { TokenType } from '../modules/Auth/interfaces';
import { Context } from './types';

/**
 * Update tree data with top voted content
 */
export const setTopVotedTreeDataCareGerminationNotesContent = async (
  context: Context<TokenType.GENERAL>,
  treeDataId: number,
) => {
  /**
   * Get all content for the tree data with votes counted
   * Exclude reportedAt
   */
  const contents = await context.db.read.treeDataCareGerminationNotesContent.findMany({
    where: {
      treeDataId,
      reportedAt: null,
    },
    include: {
      _count: {
        select: { votes: true },
      },
    },
  });

  /**
   * Get top voted
   * @TODO - better way to get top if 2 contents have equal vote counts?
   */
  // eslint-disable-next-line no-underscore-dangle
  const topVotes = Math.max(...Object.values(contents).map((c) => c._count.votes));
  // eslint-disable-next-line no-underscore-dangle
  const topVoted = contents.find((c) => c._count.votes === topVotes);

  /**
   * Update tree data with counts
   */
  return context.db.write.treeData.update({
    where: {
      id: treeDataId,
    },
    data: {
      careGerminationNotesResult: {
        upsert: {
          create: {
            content: topVoted
              ? {
                  connect: {
                    id: topVoted.id,
                  },
                }
              : undefined,
          },
          update: {
            content: topVoted
              ? {
                  connect: {
                    id: topVoted.id,
                  },
                }
              : {
                  disconnect: true,
                },
          },
        },
      },
    },
  });
};
