import { gql } from 'graphql-request';
import '../../../global-variables';
import TestUtils from '../../utils';
import { generateToken } from '../../../src/modules/Auth';
import { TokenType } from '../../../src/modules/Auth/interfaces';
import { AuthPayload } from '../../../src/types/AuthPayload';
import { LoginInput } from '../../../src/resolvers/mutation/login';
import { ResetPasswordInput } from '../../../src/resolvers/mutation/resetPassword';
import { RegisterInput } from '../../../src/resolvers/mutation/register';

// -- AUTH ENDPOINTS -- //

test('should login', async () => {
  const query = gql`
    mutation login($data: LoginInput!) {
      login(data: $data) {
        token
      }
    }
  `;

  type Response = { login: AuthPayload };
  type Variables = { data: LoginInput };

  const { user } = await global.config.utils.createUser();

  const { data, headers } = await global.config.client.rawRequest<Response, Variables>(query, {
    data: {
      email: user.email,
      password: 'password',
    },
  });

  // Token returned is also set in the response headers
  expect(headers.get('general_token')).toEqual(data?.login.token);
  expect(headers.get('set-cookie')?.includes('general_token=')).toBeTruthy();

  // Must receive refresh token via set cookie
  expect(headers.get('set-cookie')?.includes('general_refresh_token=')).toBeTruthy();

  // Should have a refresh token in the database
  const refreshTokens = await global.config.db.refreshToken.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
  });
  expect(refreshTokens.length).toEqual(1);

  // Logging in again
  await global.config.client.rawRequest<Response, Variables>(query, {
    data: {
      email: user.email,
      password: 'password',
    },
  });

  // Should have 2 refresh token in the database
  const refreshTokensAfter = await global.config.db.refreshToken.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
  });
  expect(refreshTokensAfter.length).toEqual(2);
});

test('should resetPassword', async () => {
  const query = gql`
    mutation resetPassword($data: ResetPasswordInput!) {
      resetPassword(data: $data) {
        token
      }
    }
  `;

  type Response = { resetPassword: AuthPayload };
  type Variables = { data: ResetPasswordInput };

  const { user } = await global.config.utils.createUser();

  const token = generateToken({
    type: TokenType.RESET,
    data: {
      email: user.email,
    },
  });

  const { data, headers } = await global.config.client.rawRequest<Response, Variables>(
    query,
    { data: { password: 'new-password' } },
    { authorization: `Bearer ${token}` },
  );

  // Token returned is also set in the response headers
  expect(headers.get('general_token')).toEqual(data?.resetPassword.token);
  expect(headers.get('set-cookie')?.includes('general_token=')).toBeTruthy();

  // Must receive refresh token via set cookie
  expect(headers.get('set-cookie')?.includes('general_refresh_token=')).toBeTruthy();

  // Should have a refresh token in the database
  const refreshTokens = await global.config.db.refreshToken.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
  });
  expect(refreshTokens.length).toEqual(1);
});

test('should fail to resetPassword with expired token', async () => {
  const query = gql`
    mutation resetPassword($data: ResetPasswordInput!) {
      resetPassword(data: $data) {
        token
      }
    }
  `;

  type Response = { resetPassword: AuthPayload };
  type Variables = { data: ResetPasswordInput };

  const { user } = await global.config.utils.createUser();

  const token = generateToken({
    type: TokenType.RESET,
    exp: 1,
    data: {
      email: user.email,
    },
  });

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      { data: { password: 'pwd' } },
      { authorization: `Bearer ${token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Expired Token');
  }
});

test('should register', async () => {
  const query = gql`
    mutation register($data: RegisterInput!) {
      register(data: $data) {
        token
        user {
          id
          email
        }
      }
    }
  `;

  type Response = { register: AuthPayload };
  type Variables = { data: RegisterInput };

  const { data, headers } = await global.config.client.rawRequest<Response, Variables>(query, {
    data: {
      email: TestUtils.randomEmail(),
      password: 'password',
    },
  });

  // Token returned is also set in the response headers
  expect(headers.get('general_token')).toEqual(data?.register.token);
  expect(headers.get('set-cookie')?.includes('general_token=')).toBeTruthy();

  // Must receive refresh token via set cookie
  expect(headers.get('set-cookie')?.includes('general_refresh_token=')).toBeTruthy();

  // Should have a refresh token in the database
  const refreshTokens = await global.config.db.refreshToken.findMany({
    where: {
      user: {
        id: data?.register.user.id,
      },
    },
  });
  expect(refreshTokens.length).toEqual(1);
});
