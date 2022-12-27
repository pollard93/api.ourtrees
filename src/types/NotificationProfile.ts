import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { UserProfile } from './UserProfile';


@ObjectType()
export class NotificationProfile {
  @Field(() => ID)
  id: number

  @Field(() => String)
  type: String

  @Field(() => String)
  message: String

  @Field(() => String)
  onOpenType: String

  @Field(() => UserProfile)
  receiver: UserProfile

  @Field(() => UserProfile)
  sender: UserProfile

  @Field(() => Date, { nullable: true })
  readDate?: Date | null

  @Field(() => Date)
  createdAt: Date
}
