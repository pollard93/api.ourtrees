import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';
import { TreeDataCareDifficultyResultProfile } from './TreeDataCareDifficultyResultProfile';
import { TreeDataCareWaterResultProfile } from './TreeDataCareWaterResultProfile';
import { TreeDataCareSunlightResultProfile } from './TreeDataCareSunlightResultProfile';
import { TreeDataCarePlantingResultProfile } from './TreeDataCarePlantingResultProfile';
import { TreeDataCareGerminationDifficultyResultProfile } from './TreeDataCareGerminationDifficultyResultProfile';
import { TreeDataCareWhenToReleaseResultProfile } from './TreeDataCareWhenToReleaseResultProfile';
import { TreeDataCareObtainingSeedsResultProfile } from './TreeDataCareObtainingSeedsResultProfile';
import { TreeDataCareHowToPlantSeedsResultProfile } from './TreeDataCareHowToPlantSeedsResultProfile';
import { TreeDataCareGerminationNotesResultProfile } from './TreeDataCareGerminationNotesResultProfile';

@ObjectType()
export class TreeDataProfile {
  @Field()
  id: number;

  @Field()
  taxon: string;

  @Field()
  family: string;

  @Field(() => TreeDataCareDifficultyResultProfile)
  careDifficultyResult: TreeDataCareDifficultyResultProfile;

  @Field(() => TreeDataCareWaterResultProfile)
  careWaterResult: TreeDataCareWaterResultProfile;

  @Field(() => TreeDataCareSunlightResultProfile)
  careSunlightResult: TreeDataCareSunlightResultProfile;

  @Field(() => TreeDataCarePlantingResultProfile)
  carePlantingResult: TreeDataCarePlantingResultProfile;

  @Field(() => TreeDataCareGerminationDifficultyResultProfile)
  careGerminationDifficultyResult: TreeDataCareGerminationDifficultyResultProfile;

  @Field(() => TreeDataCareWhenToReleaseResultProfile)
  careWhenToReleaseResult: TreeDataCareWhenToReleaseResultProfile;

  @Field(() => TreeDataCareObtainingSeedsResultProfile, { nullable: true })
  careObtainingSeedsResult?: TreeDataCareObtainingSeedsResultProfile;

  @Field(() => TreeDataCareHowToPlantSeedsResultProfile, { nullable: true })
  careHowToPlantSeedsResult?: TreeDataCareHowToPlantSeedsResultProfile;

  @Field(() => TreeDataCareGerminationNotesResultProfile, { nullable: true })
  careGerminationNotesResult?: TreeDataCareGerminationNotesResultProfile;
}
