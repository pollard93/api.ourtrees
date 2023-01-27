import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { TreeDataCareObtainingSeedsContentProfile } from './TreeDataCareObtainingSeedsContentProfile';


@ObjectType()
export class TreeDataCareObtainingSeedsResultProfile {
  @Field(() => TreeDataCareObtainingSeedsContentProfile)
  content: TreeDataCareObtainingSeedsContentProfile
}
