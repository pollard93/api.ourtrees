import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';
import { UserSelf } from './UserSelf';

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  token: string

  @Field(() => UserSelf)
  user: UserSelf
}
