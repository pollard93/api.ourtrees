import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';
import { TreeDataCareObtainingSeedsContentProfile } from './TreeDataCareObtainingSeedsContentProfile';

@ObjectType()
export class TreeDataCareObtainingSeedsResultProfile {
  @Field(() => TreeDataCareObtainingSeedsContentProfile, { nullable: true })
  content?: TreeDataCareObtainingSeedsContentProfile;
}
