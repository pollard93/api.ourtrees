import { ApolloError } from 'apollo-errors';
import { MiddlewareFn } from 'type-graphql';
import { Context } from '../../../utils/types';
import { verifyAccessToken, verifyRefreshToken } from './utils';
import { generateToken, generateRefreshToken, refreshCookieConfig } from '..';
import { TokenType, RefreshTokenType } from '../interfaces';
import { AuthError } from '../../../errors';

/**
 * Validates access and refresh tokens
 * A request with a valid access token is allowed to proceed without further checks
 * A request with an expired access token will verify it has a valid refresh token with a matching sessionId
 * A request with an expired access token and valid refresh token will refresh both tokens
 *
 * @param context - context of request
 * @param accessTokens - types of access tokens required
 * @param noRefreshRequired - if true, refresh token is not required
 */
export const validateAndRefreshTokens = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Context<any>,
  accessTokens: TokenType[],
  noRefreshRequired = false,
): Promise<void> => {
  /**
   * Validate access token, will not throw if invalid as may need to be refreshed
   */
  const accessToken = verifyAccessToken(context);

  // Validate the access token type is valid for this endpoint
  if (accessToken.data && !accessTokens.includes(accessToken.data.type)) {
    throw AuthError('Invalid Token');
  }

  // Set accessToken in cotext for use in resolvers
  // eslint-disable-next-line no-param-reassign
  context.accessToken = accessToken.data!;

  // If access token is valid, and there is no error then resolve
  if (accessToken.data && accessToken.error == null) {
    return Promise.resolve();
  }

  // If no accessToken data or it has an error, but is not expired then error here
  if (!accessToken.data || (accessToken.error && accessToken.error.message !== 'jwt expired')) {
    throw AuthError('Unauthorised');
  }

  /**
   * No refresh token endpoint handling
   */

  if (noRefreshRequired) {
    // If no refresh token is required and access token has no errors resolve here
    if (accessToken.error == null) {
      return Promise.resolve();
    }

    // If access token expired then throw based on token type
    switch (accessToken.data.type) {
      case TokenType.GENERAL:
        throw AuthError('Expired General Token');

      default:
        throw AuthError('Expired Token');
    }
  }

  /**
   * Expired access token handling
   * This code will only run when the the access token is expired
   */

  /**
   * Validate refresh token
   */
  const refreshToken = await verifyRefreshToken(accessToken.data.type, context);

  // If no refresh token or error then throw
  if (!refreshToken.data || refreshToken.error) {
    if (refreshToken.error?.message === 'jwt expired') {
      // If expired then throw based on token type
      switch (refreshToken.data?.data.type) {
        case RefreshTokenType.GENERAL:
          throw AuthError('Expired General Token');

        default:
          throw AuthError('Expired Token');
      }
    }

    throw AuthError('Unauthorised');
  }

  // Check that the access token and refresh token match
  if (refreshToken.data.sessionId !== accessToken.data.sessionId) {
    throw AuthError('Unauthorised');
  }

  /**
   * Valid refresh token handling
   * This code will only run when the the access token is expired and the refresh token is valid
   */

  // Refresh the access token with new expiry
  const newAccessToken = generateToken({
    ...accessToken.data,
    exp: undefined,
  });

  // Generate new refresh token every time a new access token is issued
  const newRefreshToken = await generateRefreshToken(
    context.db,
    refreshToken.data.data,
    refreshToken.data.sessionId,
  );

  // Set access and refresh tokens in response headers
  switch (accessToken.data.type) {
    case TokenType.GENERAL:
      // Set new access token
      context.res.set({ general_token: newAccessToken });
      // Set the new refresh token in the cookie
      context.res.cookie(
        'refresh_token',
        newRefreshToken.token,
        refreshCookieConfig(RefreshTokenType.GENERAL),
      );
      break;

    default:
      break;
  }

  return Promise.resolve();
};

interface AuthInterceptorProps {
  accessTokens: TokenType[] | null; // Required access tokens, pass null if none are required (login)
  refreshTokenNotRequired?: true; // Pass true to not require a refresh token (resetPassword)
  fileCacheBuster?: boolean; // Set to bust file cache (see: `src/resolvers/payloads/Url.ts`)
}

export const AuthInterceptor =
  (props: AuthInterceptorProps): MiddlewareFn<Context<never>> =>
  async ({ context }, next) => {
    try {
      // Set vars from headers
      // eslint-disable-next-line no-param-reassign
      context.clientVersion = context.req.headers['client-version'];
      // eslint-disable-next-line no-param-reassign
      context.clientType = context.req.headers['client-type'];

      // If no access token is required then proceed
      if (props.accessTokens === null) {
        return await next();
      }

      // Validate and refresh tokens
      context.fileCacheBuster = props.fileCacheBuster;
      await validateAndRefreshTokens(context, props.accessTokens, props.refreshTokenNotRequired);

      // Execute resolver
      return await next();
    } catch (err) {
      // If error is instance of ApolloError, an error has been thrown manually and message is intended for client
      if (err instanceof ApolloError) {
        throw err;
      }

      // eslint-disable-next-line no-console
      console.log('AuthInterceptor -> err', err);
      // If an error happened elsewhere, throw unauthorised
      throw AuthError('Unauthorised');
    }
  };
