import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { FileProfile } from './FileProfile';


@ObjectType()
export class UserProfile {
  @Field(() => ID)
  id: string

  @Field(() => String, { nullable: true })
  name?: string | null

  @Field(() => FileProfile, { nullable: true })
  profilePicture: FileProfile
}
