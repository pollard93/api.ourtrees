import 'reflect-metadata';
import { ObjectType, Field } from 'type-graphql';


@ObjectType()
export class TreeDataCareHowToPlantSeedsContentProfile {
  @Field()
  id: string

  @Field()
  content: string

  @Field()
  voteCount: number
}
