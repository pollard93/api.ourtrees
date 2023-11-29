import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class TreeDataCareSunlightResultProfile {
  @Field()
  count: number;

  @Field()
  indirect: number;

  @Field()
  partial: number;

  @Field()
  direct: number;
}
