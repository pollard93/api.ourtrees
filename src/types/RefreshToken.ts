import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { UserSelf } from './UserSelf';

@ObjectType()
export class RefreshToken {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  sessionId: string;

  @Field(() => UserSelf)
  user: UserSelf;

  @Field(() => Date)
  expires: Date;
}
