import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { UserProfile } from './UserProfile';

@ObjectType()
export class TreeCommentProfile {
  @Field(() => ID)
  id: string;

  @Field()
  comment: string;

  @Field(() => UserProfile)
  creator: UserProfile;

  @Field(() => Date)
  createdAt: Date;
}
