import 'reflect-metadata';
import { Resolver, Ctx, UseMiddleware, Mutation, Arg, Field, InputType } from 'type-graphql';
import { TreeDataCareGerminationNotesContent } from '@prisma/client';
import { MaxLength } from 'class-validator';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { TreeDataCareGerminationNotesContentProfile } from '../../types/TreeDataCareGerminationNotesContentProfile';
import { GenericError } from '../../errors';

@InputType()
export class CreateTreeDataCareGerminationNotesContentInput {
  @Field()
  treeDataId: number;

  @Field()
  @MaxLength(280)
  content: string;
}

@Resolver()
export class CreateTreeDataCareGerminationNotesContentResolver {
  @Mutation(() => TreeDataCareGerminationNotesContentProfile)
  @UseMiddleware(
    AuthInterceptor({
      accessTokens: [TokenType.GENERAL],
    }),
  )
  async createTreeDataCareGerminationNotesContent(
    @Arg('data') { treeDataId, content }: CreateTreeDataCareGerminationNotesContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<TreeDataCareGerminationNotesContent> {
    const { id: userId } = context.accessToken.data;

    try {
      /**
       * Create vote
       */
      return await context.db.write.treeDataCareGerminationNotesContent.create({
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
      if (e.meta.target === 'TreeDataCareGerminationNotesContent_userId_treeDataId_key') throw GenericError('User already submitted content for this tree');
      // eslint-disable-next-line max-len
      if (
        e.meta.cause ===
        'No \'TreeData\' record(s) (needed to inline the relation on \'TreeDataCareGerminationNotesContent\' record(s)) was found for a nested connect on one-to-many relation \'TreeDataCareGerminationNotesContents\'.'
      ) throw GenericError('Tree does not exist');
      throw e;
    }
  }
}
