import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { UserSelf } from './UserSelf';

@ObjectType()
export class UrlProfile {
  @Field(() => String)
  splash: string

  @Field(() => String)
  small: string

  @Field(() => String)
  large: string

  @Field(() => String)
  full: string
}


@ObjectType()
export class FileProfile {
  @Field(() => ID)
  id: number

  @Field(() => UserSelf, { nullable: true })
  author: UserSelf | null

  @Field(() => String)
  mime: string

  @Field(() => UrlProfile)
  url: UrlProfile
}
