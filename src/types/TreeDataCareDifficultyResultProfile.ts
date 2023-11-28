import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class TreeDataCareDifficultyResultProfile {
  @Field()
  count: number;

  @Field()
  easy: number;

  @Field()
  moderate: number;

  @Field()
  hard: number;
}
