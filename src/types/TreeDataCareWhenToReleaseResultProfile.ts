import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class TreeDataCareWhenToReleaseResultProfile {
  @Field()
  count: number;

  @Field()
  jan: number;

  @Field()
  feb: number;

  @Field()
  mar: number;

  @Field()
  apr: number;

  @Field()
  may: number;

  @Field()
  jun: number;

  @Field()
  jul: number;

  @Field()
  aug: number;

  @Field()
  sep: number;

  @Field()
  oct: number;

  @Field()
  nov: number;

  @Field()
  dec: number;
}
