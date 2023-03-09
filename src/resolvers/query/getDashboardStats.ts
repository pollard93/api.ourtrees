import 'reflect-metadata';
import { Resolver,
  Ctx,
  Query,
  UseMiddleware,
  Field,
  ObjectType } from 'type-graphql';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { GenericError } from '../../errors';


@ObjectType()
export class DashboardStatsProfilePayLoad {
  @Field({ nullable: true })
  header?: string;

  @Field({ nullable: true })
  content?: string;
}


@ObjectType()
export class DashboardStatsProfilesPayLoad {
  @Field(() => [DashboardStatsProfilePayLoad])
  items: DashboardStatsProfilePayLoad[]
}


@Resolver()
export class GetDashboardStatsResolver {
  @Query(() => DashboardStatsProfilesPayLoad)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getDashboardStats(
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<DashboardStatsProfilesPayLoad> {
    /**
     * Get user
     */
    const { id } = context.accessToken.data;
    const user = await context.db.read.user.findUnique({ where: { id } });
    if (!user) throw GenericError('Unauthorized');

    /**
     * Create items
     */
    const items = [{
      header: `${await context.db.read.tree.count()}`,
      content: 'Trees Planted',
    }];

    /**
     * Push country if we have it
     */
    if (user.countryName) {
      items.push({
        header: `${await context.db.read.tree.count({ where: { creator: { countryName: { equals: user.countryName } } } })}`,
        content: 'Trees Planted in the UK',
      });
    }

    return {
      items,
    };
  }
}
