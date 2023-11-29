import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';
import { TreeDataCareGerminationNotesContentProfile } from './TreeDataCareGerminationNotesContentProfile';

@ObjectType()
export class TreeDataCareGerminationNotesResultProfile {
  @Field(() => TreeDataCareGerminationNotesContentProfile, { nullable: true })
  content?: TreeDataCareGerminationNotesContentProfile;
}
