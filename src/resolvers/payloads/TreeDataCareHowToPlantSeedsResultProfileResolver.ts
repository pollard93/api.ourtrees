import {
  TreeDataCareHowToPlantSeedsContent,
  TreeDataCareHowToPlantSeedsResult,
} from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeDataCareHowToPlantSeedsContentProfile } from '../../types/TreeDataCareHowToPlantSeedsContentProfile';
import { TreeDataCareHowToPlantSeedsResultProfile } from '../../types/TreeDataCareHowToPlantSeedsResultProfile';
import { Context } from '../../utils/types';

@Resolver(() => TreeDataCareHowToPlantSeedsResultProfile)
export class TreeDataCareHowToPlantSeedsResultProfileResolver {
  @FieldResolver(() => TreeDataCareHowToPlantSeedsContentProfile)
  async content(
    @Root() { id }: TreeDataCareHowToPlantSeedsResult,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareHowToPlantSeedsContent | null | undefined> {
    return (
      await context.db.read.treeDataCareHowToPlantSeedsResult.findUnique({
        where: { id },
        include: { content: true },
      })
    )?.content;
  }
}
