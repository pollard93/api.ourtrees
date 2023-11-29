import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';

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
