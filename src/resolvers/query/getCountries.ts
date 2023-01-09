import 'reflect-metadata';
import {
  Resolver,
  Ctx,
  Query,
  UseMiddleware,
  ObjectType,
  Field,
  ID
} from 'type-graphql';
import { Country } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { CountryProfile } from '../../types/CountryProfile';


@ObjectType()
export class CountrYProfilesPayload {
  @Field(() => [CountryProfile])
  countries: CountryProfile[]
}


@Resolver()
export class GetCountriesResolver {
  @Query(() => CountrYProfilesPayload)
  @UseMiddleware(AuthInterceptor({
    accessTokens: [TokenType.GENERAL],
  }))
  async getCountries(
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ countries: Country[] }> {
    return ({
      countries: await context.db.read.country.findMany(),
    });
  }
}
