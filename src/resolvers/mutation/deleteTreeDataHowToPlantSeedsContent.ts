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
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';


@InputType()
export class DeleteTreeDataCareHowToPlantSeedsContentInput {
  @Field()
  id: string
}


@Resolver()
export class DeleteTreeDataCareHowToPlantSeedsContentResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async deleteTreeDataCareHowToPlantSeedsContent(
    @Arg('data') { id }: DeleteTreeDataCareHowToPlantSeedsContentInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<boolean> {
    const { id: userId } = context.accessToken.data;

    /**
     * Only owner can delete
     */
    const data = await context.db.read.treeDataCareHowToPlantSeedsContent.findUnique({
      where: {
        id,
      },
    });
    if (!data) throw GenericError('Resource does not exist');
    if (data.userId !== userId) throw GenericError('Unauthorized');

    /**
     * Delete
     */
    await context.db.write.treeDataCareHowToPlantSeedsContent.delete({
      where: {
        id,
      },
    });

    return true;
  }
}
