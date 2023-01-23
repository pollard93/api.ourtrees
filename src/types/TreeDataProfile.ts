import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';
import { TreeDataCareDifficultyResultProfile } from './TreeDataCareDifficultyResultProfile';
import { TreeDataCareWaterResultProfile } from './TreeDataCareWaterResultProfile';


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
}
