import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class CountryProfile {
  @Field(() => ID)
  name: string;
}
