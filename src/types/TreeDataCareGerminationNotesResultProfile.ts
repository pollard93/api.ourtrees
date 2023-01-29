import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { TreeDataCareGerminationNotesContentProfile } from './TreeDataCareGerminationNotesContentProfile';


@ObjectType()
export class TreeDataCareGerminationNotesResultProfile {
  @Field(() => TreeDataCareGerminationNotesContentProfile, { nullable: true })
  content?: TreeDataCareGerminationNotesContentProfile
}
