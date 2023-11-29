import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { UserProfile } from './UserProfile';

@ObjectType()
export class NotificationProfile {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  type: string;

  @Field(() => String)
  message: string;

  @Field(() => String)
  onOpenType: string;

  @Field(() => UserProfile)
  receiver: UserProfile;

  @Field(() => UserProfile)
  sender: UserProfile;

  @Field(() => Date, { nullable: true })
  readDate?: Date | null;

  @Field(() => Date)
  createdAt: Date;
}
