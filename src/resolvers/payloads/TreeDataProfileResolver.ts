import { TreeData, TreeDataCareDifficultyResult, TreeDataCareWaterResult } from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { TreeDataCareDifficultyResultProfile } from '../../types/TreeDataCareDifficultyResultProfile';
import { Context } from '../../utils/types';
import { TreeDataCareWaterResultProfile } from '../../types/TreeDataCareWaterResultProfile';


@Resolver(() => TreeDataProfile)
export class TreeDataProfileResolver {
  @FieldResolver(() => TreeDataCareDifficultyResultProfile)
  async careDifficultyResult(@Root() { id }: TreeData, @Ctx() context: Context): Promise<TreeDataCareDifficultyResult | undefined> {
    return (await context.db.read.treeData.findUnique({ where: { id }, include: { careDifficultyResult: true } }))?.careDifficultyResult;
  }

  @FieldResolver(() => TreeDataCareWaterResultProfile)
  async careWaterResult(@Root() { id }: TreeData, @Ctx() context: Context): Promise<TreeDataCareWaterResult | undefined> {
    return (await context.db.read.treeData.findUnique({ where: { id }, include: { careWaterResult: true } }))?.careWaterResult;
  }
}
