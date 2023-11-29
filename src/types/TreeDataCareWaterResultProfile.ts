import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class TreeDataCareWaterResultProfile {
  @Field()
  count: number;

  @Field()
  weekly: number;

  @Field()
  biweekly: number;

  @Field()
  triweekly: number;
}
