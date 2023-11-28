import { TreeDataCareHowToPlantSeedsContent } from '@prisma/client';
import { Ctx, FieldResolver, Int, Resolver, Root } from 'type-graphql';
import { TreeDataCareHowToPlantSeedsContentProfile } from '../../types/TreeDataCareHowToPlantSeedsContentProfile';
import { Context } from '../../utils/types';

@Resolver(() => TreeDataCareHowToPlantSeedsContentProfile)
export class TreeDataCareHowToPlantSeedsContentProfileResolver {
  @FieldResolver(() => Int)
  voteCount(
    @Root() { id }: TreeDataCareHowToPlantSeedsContent,
    @Ctx() context: Context<null>,
  ): Promise<number> {
    return context.db.read.treeDataCareHowToPlantSeedsVote.count({ where: { contentId: id } });
  }
}
