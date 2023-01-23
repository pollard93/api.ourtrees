import { TreeData, TreeDataCareDifficultyResult, TreeDataCareSunlightResult, TreeDataCareWaterResult } from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { TreeDataCareDifficultyResultProfile } from '../../types/TreeDataCareDifficultyResultProfile';
import { Context } from '../../utils/types';
import { TreeDataCareWaterResultProfile } from '../../types/TreeDataCareWaterResultProfile';
import { TreeDataCareSunlightResultProfile } from '../../types/TreeDataCareSunlightResultProfile';


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

  @FieldResolver(() => TreeDataCareSunlightResultProfile)
  async careSunlightResult(@Root() { id }: TreeData, @Ctx() context: Context): Promise<TreeDataCareSunlightResult | undefined> {
    return (await context.db.read.treeData.findUnique({ where: { id }, include: { careSunlightResult: true } }))?.careSunlightResult;
  }
}
