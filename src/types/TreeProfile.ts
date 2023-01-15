import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType()
export class TreeProfile {
  @Field()
  id: number
}
