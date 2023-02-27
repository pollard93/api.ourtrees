import 'reflect-metadata';
import { Resolver,
  Ctx,
  UseMiddleware,
  Mutation,
  Arg,
  InputType,
  Field } from 'type-graphql';
import { User } from '@prisma/client';
import { TokenType } from '../../modules/Auth/interfaces';
import { Context } from '../../utils/types';
import { AuthInterceptor } from '../../modules/Auth/middleware';
import { AuthPayload } from '../../types/AuthPayload';
import { GenericError } from '../../errors';
import { setGeneralTokens } from '../../modules/Auth';


export enum SocialProvider {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
}


@InputType()
export class LoginWithSocialInput {
  @Field()
  provider: SocialProvider
}


@Resolver()
export class LoginWithSocialResolver {
  @Mutation(() => AuthPayload)
  @UseMiddleware(AuthInterceptor({
    accessTokens: null,
  }))
  async loginWithSocial(
    @Arg('data') { provider }: LoginWithSocialInput,
    @Ctx() context: Context<TokenType.GENERAL>,
  ): Promise<{ token: string, user: User }> {
    try {
      const getUser = async () => {
        switch (provider) {
          case 'FACEBOOK':
            // Get token from header
            const facebookAccessToken = (context.req.headers.authorization || '').replace('Bearer ', '');

            // Make a request to facebook to validate the access token and to get user id and email
            // For testing, use the raw token
            const fbUser: { id: string; email: string; } = process.env.NODE_ENV !== 'test'
              ? await (await fetch(`https://graph.facebook.com/me?fields=email,name&access_token=${facebookAccessToken}`)).json()
              : JSON.parse(facebookAccessToken);

            /**
             * Upsert user into db via their facebookId
             */
            return context.db.write.user.upsert({
              where: {
                email: fbUser.email,
              },
              create: {
                facebookId: fbUser.id,
                email: fbUser.email,
                verified: true,
                password: '',
              },
              update: {
                facebookId: fbUser.id,
              },
            });

          case 'GOOGLE':
            // Get id token from header
            const googleIdToken = (context.req.headers.authorization || '').replace('Bearer ', '');

            // Make a request to google to validate the id token and to get user id and email
            // For testing, use the raw token
            const googleUser: { sub: string, email: string; } = process.env.NODE_ENV !== 'test'
              ? await (await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleIdToken}`)).json()
              : JSON.parse(googleIdToken);

            /**
             * Upsert user into db via their email
             */
            return context.db.write.user.upsert({
              where: {
                email: googleUser.email,
              },
              create: {
                googleId: googleUser.sub,
                email: googleUser.email,
                verified: true,
                password: '',
              },
              update: {
                googleId: googleUser.sub,
              },
            });

          default:
            throw new Error();
        }
      };

      // Get user based on provider
      const user = await getUser();

      return {
        token: await setGeneralTokens(context, user),
        user,
      };
    } catch (e) {
      if (e.message.includes('Unique constraint failed on the constraint')) {
        throw GenericError('Email already exists');
      }

      throw new Error();
    }
  }
}
