import { TreeDataCareObtainingSeedsContent, TreeDataCareObtainingSeedsResult } from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeDataCareObtainingSeedsContentProfile } from '../../types/TreeDataCareObtainingSeedsContentProfile';
import { TreeDataCareObtainingSeedsResultProfile } from '../../types/TreeDataCareObtainingSeedsResultProfile';
import { Context } from '../../utils/types';


@Resolver(() => TreeDataCareObtainingSeedsResultProfile)
export class TreeDataCareObtainingSeedsResultProfileResolver {
  @FieldResolver(() => TreeDataCareObtainingSeedsContentProfile)
  async content(@Root() { id }: TreeDataCareObtainingSeedsResult, @Ctx() context: Context): Promise<TreeDataCareObtainingSeedsContent | null | undefined> {
    return (await context.db.read.treeDataCareObtainingSeedsResult.findUnique({ where: { id }, include: { content: true } }))?.content;
  }
}
