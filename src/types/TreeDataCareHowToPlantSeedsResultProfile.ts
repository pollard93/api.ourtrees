import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';
import { TreeDataCareHowToPlantSeedsContentProfile } from './TreeDataCareHowToPlantSeedsContentProfile';

@ObjectType()
export class TreeDataCareHowToPlantSeedsResultProfile {
  @Field(() => TreeDataCareHowToPlantSeedsContentProfile, { nullable: true })
  content?: TreeDataCareHowToPlantSeedsContentProfile;
}
