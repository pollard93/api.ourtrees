import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType()
export class TreeDataCareWaterResultProfile {
  @Field()
  count: number

  @Field()
  weekly: number

  @Field()
  biweekly: number

  @Field()
  triweekly: number
}
