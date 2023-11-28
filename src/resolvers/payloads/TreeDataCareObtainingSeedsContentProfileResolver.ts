import { TreeDataCareObtainingSeedsContent } from '@prisma/client';
import { Ctx, FieldResolver, Int, Resolver, Root } from 'type-graphql';
import { TreeDataCareObtainingSeedsContentProfile } from '../../types/TreeDataCareObtainingSeedsContentProfile';
import { Context } from '../../utils/types';

@Resolver(() => TreeDataCareObtainingSeedsContentProfile)
export class TreeDataCareObtainingSeedsContentProfileResolver {
  @FieldResolver(() => Int)
  voteCount(
    @Root() { id }: TreeDataCareObtainingSeedsContent,
    @Ctx() context: Context<null>,
  ): Promise<number> {
    return context.db.read.treeDataCareObtainingSeedsVote.count({ where: { contentId: id } });
  }
}
