import { gql } from 'graphql-request';
import * as jwt from 'jsonwebtoken';
import '../../../global-variables';
import TestUtils from '../../utils';
import { generateToken } from '../../../src/modules/Auth';
import { RefreshTokenType, TokenArgs, TokenType } from '../../../src/modules/Auth/interfaces';
import { LoginInput } from '../../../src/resolvers/mutation/login';
import { AuthPayload } from '../../../src/types/AuthPayload';
import { UserSelf } from '../../../src/types/UserSelf';

const loginQuery = gql`
  mutation login($data: LoginInput!) {
    login(data: $data) {
      token
    }
  }
`;

type LoginResponse = { login: AuthPayload };
type LoginVariables = { data: LoginInput };

const getSelfQuery = gql`
  query getSelf {
    getSelf {
      id
    }
  }
`;

type GetSelfResponse = { getSelf: UserSelf };
type GetSelfVariables = Record<string, undefined>;

test('should make a request with valid access and refresh token', async () => {
  const { user } = await global.config.utils.createUser();

  // Login
  const { headers } = await global.config.client.rawRequest<LoginResponse, LoginVariables>(
    loginQuery,
    {
      data: {
        email: user.email,
        password: 'password',
      },
    },
  );

  // Get access token and refresh token
  const accessToken = headers.get('general_token');
  const refreshToken = TestUtils.getCookie(headers.get('set-cookie')!, 'general_refresh_token');

  // Get self with tokens
  const { data } = await global.config.client.rawRequest<GetSelfResponse, GetSelfVariables>(
    getSelfQuery,
    undefined,
    {
      authorization: `Bearer ${accessToken}`,
      Cookie: `general_refresh_token=${refreshToken};`,
    },
  );
  expect(data?.getSelf.id).toEqual(user.id);
});

test('should make a request with an invalid access and valid refresh token', async () => {
  const { user } = await global.config.utils.createUser();

  // Login
  const { headers } = await global.config.client.rawRequest<LoginResponse, LoginVariables>(
    loginQuery,
    {
      data: {
        email: user.email,
        password: 'password',
      },
    },
  );

  // Get access token and refresh token
  const accessToken = headers.get('general_token');
  const refreshToken = TestUtils.getCookie(headers.get('set-cookie')!, 'general_refresh_token');

  // Get refresh token in db
  const tokenData = jwt.verify(accessToken, process.env.JWT_SECRET);
  const refreshTokenDB = await global.config.db.refreshToken.findUnique({
    where: { sessionId: tokenData.sessionId },
  });

  // Create expired token
  const expiredToken = generateToken({
    ...tokenData,
    exp: Math.floor(Date.now() / 1000) - 60,
  });

  // Get self with expired access token, valid refresh token
  const { data, headers: getSelfHeaders } = await global.config.client.rawRequest<
    GetSelfResponse,
    GetSelfVariables
  >(getSelfQuery, undefined, {
    authorization: `Bearer ${expiredToken}`,
    Cookie: `general_refresh_token=${refreshToken};`,
  });
  expect(data?.getSelf.id).toEqual(user.id);

  // Tokens should be in response
  const newAccessToken = getSelfHeaders.get('general_token');
  expect(newAccessToken).toBeTruthy();
  const newRefreshToken = getSelfHeaders.get('set-cookie')?.replace('general_refresh_token=', '');
  expect(newRefreshToken).toBeTruthy();

  // The refresh token expiry should have been increased
  expect(
    new Date(refreshTokenDB!.expires).getTime() <
      new Date(
        (await global.config.db.refreshToken.findUnique({
          where: { sessionId: tokenData.sessionId },
        }))!.expires,
      ).getTime(),
  ).toBeTruthy();

  /**
   * Test all scenarios of the race conditions
   */

  {
    // Can make a request with the old general token and old refresh token
    // This allows asynchronous requests to not fail after the tokens have been refreshed
    const { data: data1 } = await global.config.client.rawRequest<
      GetSelfResponse,
      GetSelfVariables
    >(getSelfQuery, undefined, {
      authorization: `Bearer ${accessToken}`,
      Cookie: `general_refresh_token=${refreshToken};`,
    });
    expect(data1?.getSelf.id).toEqual(user.id);
  }

  {
    // Can then make a request with the new access token and new refresh token
    const { data: data1 } = await global.config.client.rawRequest<
      GetSelfResponse,
      GetSelfVariables
    >(getSelfQuery, undefined, {
      authorization: `Bearer ${newAccessToken}`,
      Cookie: `general_refresh_token=${newRefreshToken};`,
    });
    expect(data1?.getSelf.id).toEqual(user.id);
  }
});

test('should make a request with an invalid access and valid refresh token, tests that refresh tokens are cleaned up', async () => {
  const { user } = await global.config.utils.createUser();

  // Login
  const { headers } = await global.config.client.rawRequest<LoginResponse, LoginVariables>(
    loginQuery,
    {
      data: {
        email: user.email,
        password: 'password',
      },
    },
  );

  // Get access token and refresh token
  const accessToken = headers.get('general_token');
  const refreshToken = TestUtils.getCookie(headers.get('set-cookie')!, 'general_refresh_token');
  const tokenData: TokenArgs<TokenType.GENERAL> = jwt.verify(accessToken, process.env.JWT_SECRET);

  // Manually create an expired refresh token with a different sessionId
  await global.config.db.refreshToken.create({
    data: {
      sessionId: TestUtils.randomString(),
      expires: new Date(0).toISOString(),
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  const expiredToken = generateToken({
    type: TokenType.GENERAL,
    sessionId: tokenData.sessionId,
    exp: Math.floor(Date.now() / 1000) - 60,
    data: {
      id: '',
      email: user.email,
    },
  });

  // Make request with expired access token, valid refresh token, this will regenerate the refresh token and should clean up expired tokens
  await global.config.client.rawRequest<GetSelfResponse, GetSelfVariables>(
    getSelfQuery,
    undefined,
    {
      authorization: `Bearer ${expiredToken}`,
      Cookie: `general_refresh_token=${refreshToken};`,
    },
  );

  // Should only be 1 refresh token, the expired created manually above has been deleted
  expect(
    (
      await global.config.db.refreshToken.findMany({
        where: {
          user: {
            id: user.id,
          },
        },
      })
    ).length,
  ).toEqual(1);
});

// -- FAILURES -- //

test('should fail with an expired access token and invalid refresh token', async () => {
  // Create expired general token
  const accessToken = generateToken({
    type: TokenType.GENERAL,
    exp: 1,
    sessionId: '',
    data: {} as any, // Not used
  });

  try {
    await global.config.client.rawRequest<GetSelfResponse, GetSelfVariables>(
      getSelfQuery,
      undefined,
      {
        authorization: `Bearer ${accessToken}`,
        Cookie: 'general_refresh_token=invalidtoken;',
      },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});

test('should fail with an invalid session id pair', async () => {
  // Create expired general token
  const accessToken = generateToken({
    type: TokenType.GENERAL,
    exp: 1,
    sessionId: '1',
    data: {} as any, // Not used
  });

  // Generate refresh token with the different sessionId
  const refreshToken = generateToken({
    type: TokenType.REFRESH,
    sessionId: '2',
    data: {
      type: RefreshTokenType.GENERAL,
    } as any,
  });

  try {
    await global.config.client.rawRequest<GetSelfResponse, GetSelfVariables>(
      getSelfQuery,
      undefined,
      {
        authorization: `Bearer ${accessToken}`,
        Cookie: `general_refresh_token=${refreshToken};`,
      },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});

test('should fail with an invalid type pair', async () => {
  // Create expired general token
  const accessToken = generateToken({
    type: TokenType.GENERAL,
    exp: 1,
    sessionId: '1',
    data: {} as any, // Not used
  });

  // Generate refresh token with the different sessionId
  const refreshToken = generateToken({
    type: TokenType.REFRESH,
    sessionId: '1',
    data: {
      type: RefreshTokenType.OTHER,
    } as any,
  });

  try {
    await global.config.client.rawRequest<GetSelfResponse, GetSelfVariables>(
      getSelfQuery,
      undefined,
      {
        authorization: `Bearer ${accessToken}`,
        Cookie: `general_refresh_token=${refreshToken};`,
      },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});

test('should fail with an expired refresh token', async () => {
  // Create expired general token
  const accessToken = generateToken({
    type: TokenType.GENERAL,
    exp: 1,
    sessionId: '1',
    data: {} as any, // Not used
  });

  // Generate expired refresh token with the same sessionId
  const refreshToken = generateToken({
    type: TokenType.REFRESH,
    exp: 1,
    sessionId: '1',
    data: {
      type: RefreshTokenType.GENERAL,
    } as any,
  });

  try {
    await global.config.client.rawRequest<GetSelfResponse, GetSelfVariables>(
      getSelfQuery,
      undefined,
      {
        authorization: `Bearer ${accessToken}`,
        Cookie: `general_refresh_token=${refreshToken};`,
      },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Expired General Token');
  }
});
