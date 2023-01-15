import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType()
export class TreeDataProfile {
  @Field()
  id: number

  @Field()
  taxon: string

  @Field()
  family: string
}
