import 'reflect-metadata';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import { IsEmail } from 'class-validator';
import { FileProfile } from './FileProfile';

@ObjectType()
export class RequiresUpdate {
  @Field(() => String)
  appStoreUrl: string;

  @Field(() => String)
  playStoreUrl: string;
}


@ObjectType()
export class UserSelf {
  @Field(() => ID)
  id: string

  @Field(() => String, { nullable: true })
  name?: string | null

  @Field()
  @IsEmail()
  email: string

  @Field(() => Boolean)
  verified: boolean

  @Field(() => String, { nullable: true })
  countryName?: string | null

  @Field(() => FileProfile, { nullable: true })
  profilePicture: FileProfile

  @Field(() => Int)
  unreadNotificationCount: number

  @Field(() => RequiresUpdate, { nullable: true })
  requiresUpdate: RequiresUpdate
}
