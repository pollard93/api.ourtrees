import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType()
export class TreeDataCareSunlightResultProfile {
  @Field()
  count: number

  @Field()
  indirect: number

  @Field()
  partial: number

  @Field()
  direct: number
}
