import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { TreeDataCareHowToPlantSeedsContent } from '@prisma/client';
import { MaxLength } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataCareHowToPlantSeedsContentProfile } from '../../types/TreeDataCareHowToPlantSeedsContentProfile';
import { GenericError } from '../../errors';

@InputType()
export class CreateTreeDataCareHowToPlantSeedsContentInput {
  @Field()
  treeDataId: number;

  @Field()
  @MaxLength(280)
  content: string;
}

@Resolver()
export class CreateTreeDataCareHowToPlantSeedsContentResolver {
  @Mutation(() => TreeDataCareHowToPlantSeedsContentProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async createTreeDataCareHowToPlantSeedsContent(
    @Arg('data') { treeDataId, content }: CreateTreeDataCareHowToPlantSeedsContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeDataCareHowToPlantSeedsContent> {
    const { id: userId } = context.accessToken.data;

    try {
      /**
       * Create vote
       */
      return await context.db.write.treeDataCareHowToPlantSeedsContent.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          treeData: {
            connect: {
              id: treeDataId,
            },
          },
          content,
        },
      });
    } catch (e) {
      if (e.meta.target === 'TreeDataCareHowToPlantSeedsContent_userId_treeDataId_key')
        throw GenericError('User already submitted content for this tree');
      // eslint-disable-next-line max-len
      if (
        e.meta.cause ===
        "No 'TreeData' record(s) (needed to inline the relation on 'TreeDataCareHowToPlantSeedsContent' record(s)) was found for a nested connect on one-to-many relation 'TreeDataCareHowToPlantSeedsContents'."
      )
        throw GenericError('Tree does not exist');
      throw e;
    }
  }
}
