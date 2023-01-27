import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { TreeDataCareHowToPlantSeedsContentProfile } from './TreeDataCareHowToPlantSeedsContentProfile';


@ObjectType()
export class TreeDataCareHowToPlantSeedsResultProfile {
  @Field(() => TreeDataCareHowToPlantSeedsContentProfile, { nullable: true })
  content?: TreeDataCareHowToPlantSeedsContentProfile
}
