import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class TreeDataCareGerminationDifficultyResultProfile {
  @Field()
  count: number;

  @Field()
  easy: number;

  @Field()
  moderate: number;

  @Field()
  hard: number;
}
