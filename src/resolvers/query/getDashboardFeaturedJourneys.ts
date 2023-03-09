import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware,
  ObjectType,
  Field } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';


@ObjectType()
export class GetDashboardFeaturedJourneysPayload {
  @Field({ nullable: true })
  treeDataId?: number

  @Field({ nullable: true })
  creatorId?: string

  @Field({ nullable: true })
  followerId?: string

  @Field({ nullable: true })
  countryName?: string
}


@Resolver()
export class GetDashboardFeaturedJourneysResolver {
  @Query(() => GetDashboardFeaturedJourneysPayload)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getDashboardFeaturedJourneys(
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<GetDashboardFeaturedJourneysPayload> {
    /**
     * Get user
     */
    const { id } = context.accessToken.data;
    const user = await context.db.read.user.findUnique({ where: { id } });
    if (!user) throw GenericError('Unauthorized');


    /**
     * If user has countryName then search by country
     */
    if (user.countryName) {
      return {
        countryName: user.countryName,
      };
    }

    /**
     * Default to all
     */
    return {};
  }
}
