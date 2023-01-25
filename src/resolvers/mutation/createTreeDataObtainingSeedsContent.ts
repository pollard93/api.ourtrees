import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  Field,
  InputType
} from 'type-graphql';
import { TreeDataCareObtainingSeedsContent } from '@prisma/client';
import { MaxLength } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataCareObtainingSeedsContentProfile } from '../../types/TreeDataCareObtainingSeedsContentProfile';
import { GenericError } from '../../errors';


@InputType()
export class CreateTreeDataCareObtainingSeedsContentInput {
  @Field()
  treeDataId: number

  @Field()
  @MaxLength(280)
  content: string
}


@Resolver()
export class CreateTreeDataCareObtainingSeedsContentResolver {
  @Mutation(() => TreeDataCareObtainingSeedsContentProfile)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async createTreeDataCareObtainingSeedsContent(
    @Arg('data') { treeDataId, content }: CreateTreeDataCareObtainingSeedsContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeDataCareObtainingSeedsContent> {
    const { id: userId } = context.accessToken.data;

    try {
      /**
       * Create vote
       */
      return await context.db.write.treeDataCareObtainingSeedsContent.create({
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
      if (e.meta.target === 'TreeDataCareObtainingSeedsContent_userId_treeDataId_key') throw GenericError('User already submitted content for this tree');
      // eslint-disable-next-line max-len
      if (e.meta.cause === 'No \'TreeData\' record(s) (needed to inline the relation on \'TreeDataCareObtainingSeedsContent\' record(s)) was found for a nested connect on one-to-many relation \'TreeDataCareObtainingSeedsContents\'.') throw GenericError('Tree does not exist');
      throw e;
    }
  }
}
