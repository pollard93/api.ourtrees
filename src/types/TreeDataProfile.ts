import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';
import { TreeDataCareDifficultyResultProfile } from './TreeDataCareDifficultyResultProfile';
import { TreeDataCareWaterResultProfile } from './TreeDataCareWaterResultProfile';
import { TreeDataCareSunlightResultProfile } from './TreeDataCareSunlightResultProfile';
import { TreeDataCareGerminationDifficultyResultProfile } from './TreeDataCareGerminationDifficultyResultProfile';


@ObjectType()
export class TreeDataProfile {
  @Field()
  id: number

  @Field()
  taxon: string

  @Field()
  family: string

  @Field(() => TreeDataCareDifficultyResultProfile)
  careDifficultyResult: TreeDataCareDifficultyResultProfile

  @Field(() => TreeDataCareWaterResultProfile)
  careWaterResult: TreeDataCareWaterResultProfile

  @Field(() => TreeDataCareSunlightResultProfile)
  careSunlightResult: TreeDataCareSunlightResultProfile

  @Field(() => TreeDataCareGerminationDifficultyResultProfile)
  careGerminationDifficultyResult: TreeDataCareGerminationDifficultyResultProfile
}
