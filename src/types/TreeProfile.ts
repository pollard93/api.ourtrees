import 'reflect-metadata';
import { ObjectType, Field, ID } from 'type-graphql';
import { TreeDataProfile } from './TreeDataProfile';
import { TreeEntryProfile } from './TreeEntryProfile';
import { UserProfile } from './UserProfile';


@ObjectType()
export class TreeProfile {
  @Field(() => ID)
  id: string

  @Field()
  name: string

  @Field()
  cultivationDate: Date

  @Field(() => TreeDataProfile)
  treeData: TreeDataProfile

  @Field(() => UserProfile)
  creator: UserProfile

  @Field(() => [TreeEntryProfile])
  entries: TreeEntryProfile[]
}
