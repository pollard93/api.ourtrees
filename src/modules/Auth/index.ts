import * as bcrypt from 'bcryptjs';
import * as emailValidator from 'email-validator';
import * as jwt from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import { Context } from 'utils/types';
import { User } from '@prisma/client';
import { TokenType, TokenData, RefreshTokenType, TokenArgs } from './interfaces';

export const validateEmail = (email: string) => emailValidator.validate(email);

export const validatePassword = (pwd: string) => /^.{6,}$/.test(pwd);

export const hashPassword: (pwd: string) => Promise<string> = (pwd: string) => bcrypt.hash(pwd, 10);

export const comparePassword = ({ pwd, hash }) => bcrypt.compare(pwd, hash) as boolean;

export const signToken = (data) => jwt.sign(data, process.env.JWT_SECRET);


/**
 * Generates and signs token with data
 * If no data.exp is passed as undefined, defaults to 15 minute
 * If data.exp is passed as null, jwt will generated with no expiry
 * @param data - token data
 */
export const generateToken = <T extends TokenType>(data: TokenArgs<T>): string => {
  if (data.exp === undefined) {
    // eslint-disable-next-line no-param-reassign
    data.exp = Math.floor(Date.now() / 1000) + 900; // 15 minute default
  } else if (data.exp === null) {
    // eslint-disable-next-line no-param-reassign
    delete data.exp; // No expiry
  }
  return signToken(data);
};


/**
 * Upserts refresh token in db database
 * GENERAL token type has 7 day expiry
 * OTHER token type has 1 hour expiry
 * @param tokenData - token data
 * @param sessionId - optional session if wanting to upsert, otherwise session is created
 */
export const generateRefreshToken = async (db: Context<null>['db'], tokenData: TokenData<TokenType.REFRESH>, sessionId = uuidv4()) => {
  // 7 days from today - seconds
  const expires = tokenData.type === RefreshTokenType.GENERAL
    ? Math.floor(Date.now() / 1000) + (604800) // 7 days
    : Math.floor(Date.now() / 1000) + (3600); // 1 hour

  // Need to wait a second for unit testing
  if (process.env.NODE_ENV === 'test') {
    await new Promise<void>((res) => {
      setTimeout(() => {
        res();
      }, 1000);
    });
  }

  const token = await generateToken({
    type: TokenType.REFRESH,
    sessionId,
    exp: expires,
    data: tokenData,
  });

  try {
    // Upsert refresh token incase 2 requests are made with expired access tokens
    await db.write.refreshToken.upsert({
      where: {
        sessionId,
      },
      update: {
        expires: new Date(expires * 1000).toISOString(),
      },
      create: {
        sessionId,
        // Expiry date as iso time stamp
        expires: new Date(expires * 1000).toISOString(),
        user: {
          connect: {
            id: tokenData.id,
          },
        },
      },
    });
  } catch (e) { } // eslint-disable-line no-empty

  return {
    sessionId,
    token,
  };
};


/**
 * Config for cookie
 * GENERAL token type has 7 day expiry
 * OTHER token type has 1 hour expiry
 */
export const refreshCookieConfig = (type: RefreshTokenType) => {
  // Expires in seconds
  const expires = type === RefreshTokenType.GENERAL
    ? new Date(Date.now() + 604800000) // 7 days
    : new Date(Date.now() + 3600000); // 1 hour

  return {
    httpOnly: true,
    expires,
  };
};


/**
 * Set general access and refresh token in context
 * @param data
 * @param context
 */
export const setGeneralTokens = async (context: Context<any>, user: User) => {
  /**
   * Set general refresh token and add to cookie in response
   */
  const { sessionId, token: refreshToken } = await generateRefreshToken(context.db, {
    id: user.id,
    type: RefreshTokenType.GENERAL,
  });
  context.res.cookie('general_refresh_token', refreshToken, refreshCookieConfig(RefreshTokenType.GENERAL));


  /**
   * Create general token
   * Add to cookie in response
   * Add to response headers
   */
  const token = generateToken({
    type: TokenType.GENERAL,
    sessionId,
    data: {
      id: user.id,
      email: user.email,
    },
  });
  context.res.set({ general_token: token });
  context.res.cookie('general_token', token);

  return token;
};
