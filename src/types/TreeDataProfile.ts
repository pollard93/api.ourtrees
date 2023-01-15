import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';


@ObjectType()
export class TreeDataProfile {
  @Field(() => ID)
  id: string

  @Field(() => String)
  taxon: string

  @Field(() => String)
  family: string
}
