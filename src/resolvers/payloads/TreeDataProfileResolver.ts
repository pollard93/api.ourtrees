import {
  TreeData,
  TreeDataCareDifficultyResult,
  TreeDataCareGerminationDifficultyResult,
  TreeDataCarePlantingResult,
  TreeDataCareSunlightResult,
  TreeDataCareWaterResult,
  TreeDataCareWhenToReleaseResult,
  TreeDataCareObtainingSeedsResult,
  TreeDataCareHowToPlantSeedsResult,
  TreeDataCareGerminationNotesResult,
} from '@prisma/client';
import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TreeDataProfile } from '../../types/TreeDataProfile';
import { TreeDataCareDifficultyResultProfile } from '../../types/TreeDataCareDifficultyResultProfile';
import { Context } from '../../utils/types';
import { TreeDataCareWaterResultProfile } from '../../types/TreeDataCareWaterResultProfile';
import { TreeDataCareSunlightResultProfile } from '../../types/TreeDataCareSunlightResultProfile';
import { TreeDataCareGerminationDifficultyResultProfile } from '../../types/TreeDataCareGerminationDifficultyResultProfile';
import { TreeDataCarePlantingResultProfile } from '../../types/TreeDataCarePlantingResultProfile';
import { TreeDataCareWhenToReleaseResultProfile } from '../../types/TreeDataCareWhenToReleaseResultProfile';
import { TreeDataCareObtainingSeedsResultProfile } from '../../types/TreeDataCareObtainingSeedsResultProfile';
import { TreeDataCareHowToPlantSeedsResultProfile } from '../../types/TreeDataCareHowToPlantSeedsResultProfile';
import { TreeDataCareGerminationNotesResultProfile } from '../../types/TreeDataCareGerminationNotesResultProfile';

@Resolver(() => TreeDataProfile)
export class TreeDataProfileResolver {
  @FieldResolver(() => TreeDataCareDifficultyResultProfile)
  async careDifficultyResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareDifficultyResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careDifficultyResult: true },
      })
    )?.careDifficultyResult;
  }

  @FieldResolver(() => TreeDataCareWaterResultProfile)
  async careWaterResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareWaterResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careWaterResult: true },
      })
    )?.careWaterResult;
  }

  @FieldResolver(() => TreeDataCareSunlightResultProfile)
  async careSunlightResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareSunlightResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careSunlightResult: true },
      })
    )?.careSunlightResult;
  }

  @FieldResolver(() => TreeDataCarePlantingResultProfile)
  async carePlantingResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCarePlantingResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { carePlantingResult: true },
      })
    )?.carePlantingResult;
  }

  @FieldResolver(() => TreeDataCareGerminationDifficultyResultProfile)
  async careGerminationDifficultyResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareGerminationDifficultyResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careGerminationDifficultyResult: true },
      })
    )?.careGerminationDifficultyResult;
  }

  @FieldResolver(() => TreeDataCareWhenToReleaseResultProfile)
  async careWhenToReleaseResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareWhenToReleaseResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careWhenToReleaseResult: true },
      })
    )?.careWhenToReleaseResult;
  }

  @FieldResolver(() => TreeDataCareObtainingSeedsResultProfile)
  async careObtainingSeedsResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareObtainingSeedsResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careObtainingSeedsResult: true },
      })
    )?.careObtainingSeedsResult;
  }

  @FieldResolver(() => TreeDataCareHowToPlantSeedsResultProfile)
  async careHowToPlantSeedsResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareHowToPlantSeedsResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careHowToPlantSeedsResult: true },
      })
    )?.careHowToPlantSeedsResult;
  }

  @FieldResolver(() => TreeDataCareGerminationNotesResultProfile)
  async careGerminationNotesResult(
    @Root() { id }: TreeData,
    @Ctx() context: Context<null>,
  ): Promise<TreeDataCareGerminationNotesResult | undefined> {
    return (
      await context.db.read.treeData.findUnique({
        where: { id },
        include: { careGerminationNotesResult: true },
      })
    )?.careGerminationNotesResult;
  }
}
