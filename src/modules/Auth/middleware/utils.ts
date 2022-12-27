import * as jwt from 'jsonwebtoken';
import { Context, VerifiedToken } from '../../../utils/types';
import { TokenArgs, TokenType } from '../interfaces';


/**
 * Safely decodes access token from context, does not verify
 * Return null if error
 */
const safelyDecodeAccessToken = <T extends TokenType = null>(context: Context<T>): TokenArgs<T> => {
  try {
    return jwt.decode((context.req?.headers?.authorization || context.connection.context.authorization).replace('Bearer ', ''));
  } catch (e) {
    return null;
  }
};


/**
 * Safely verifies access token
 * Returns data and error
 */
export const verifyAccessToken = <T extends TokenType = null>(context: Context<T>): VerifiedToken<T> => {
  try {
    return {
      data: jwt.verify((context.req?.headers?.authorization || context.connection.context.authorization).replace('Bearer ', ''), process.env.JWT_SECRET),
    };
  } catch (error) {
    return {
      data: safelyDecodeAccessToken(context),
      error,
    };
  }
};


/**
 * Gets refresh token from context based on access token type
 */
const getRefreshToken = (accessTokenType: TokenType, context: Context) => {
  switch (accessTokenType) {
    // EXTEND TOKEN TYPES HERE

    // case TokenType.TEST:
    //   // TEST token types require a test_refresh_token
    //   return context.req.cookies.test_refresh_token;

    default:
      // else require general_refresh_token
      // eslint-disable-next-line camelcase
      return context.req?.cookies?.general_refresh_token || context.connection.context.cookies.general_refresh_token;
  }
};


/**
 * Safely decodes access token from context, does not verify
 * Return null if error
 */
const safelyDecodeRefreshToken = (accessTokenType: TokenType, context: Context): TokenArgs<TokenType.REFRESH> => {
  try {
    return jwt.decode(getRefreshToken(accessTokenType, context).replace('Bearer ', ''));
  } catch (e) {
    return null;
  }
};


/**
 * Verifies refresh token from context
 * Checks the session id exists in database
 * Returns data and error
 */
export const verifyRefreshToken = async (accessTokenType: TokenType, context: Context): Promise<VerifiedToken<TokenType.REFRESH>> => {
  try {
    // Verify from header
    const data: TokenArgs<TokenType.REFRESH> = jwt.verify(getRefreshToken(accessTokenType, context), process.env.JWT_SECRET);

    // Check the token is stored in db
    const storedToken = await context.db.read.refreshToken.findUnique({
      where: {
        sessionId: data.sessionId,
      },
    });
    if (!storedToken) throw new Error();

    try {
      // Delete all expired tokens for user
      await context.db.write.refreshToken.deleteMany({
        where: {
          user: { id: storedToken.userId },
          expires: {
            lt: new Date(),
          },
        },
      });
    } catch (e) {
      throw new Error();
    }

    return {
      data: safelyDecodeRefreshToken(accessTokenType, context),
    };
  } catch (error) {
    return {
      data: safelyDecodeRefreshToken(accessTokenType, context),
      error,
    };
  }
};
