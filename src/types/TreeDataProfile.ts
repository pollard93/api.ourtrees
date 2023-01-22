import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { TreeDataCareDifficultyResultProfile } from './TreeDataCareDifficultyResultProfile';


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
}
