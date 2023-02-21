import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { FileProfile } from './FileProfile';


@ObjectType()
export class TreeEntryProfile {
  @Field(() => ID)
  id: string

  @Field()
  notes: string

  @Field(() => FileProfile, { nullable: true })
  image: FileProfile

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
