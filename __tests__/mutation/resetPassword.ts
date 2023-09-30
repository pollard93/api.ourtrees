import { gql } from 'graphql-request';
import '../../global-variables';
import { comparePassword, generateToken } from '../../src/modules/Auth';
import { TokenType } from '../../src/modules/Auth/interfaces';
import { ResetPasswordInput } from '../../src/resolvers/mutation/resetPassword';
import { AuthPayload } from '../../src/types/AuthPayload';


const query = gql`
  mutation resetPassword($data: ResetPasswordInput!){
    resetPassword(data: $data){
      token
    }
  }
`;

type Response = { resetPassword: AuthPayload };
type Variables = { data: ResetPasswordInput };


test('should succeed', async () => {
  const { user } = await global.config.utils.createUser();

  const token = generateToken({
    type: TokenType.RESET,
    data: {
      email: user.email,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    { data: { password: 'new-password' } },
    { authorization: `Bearer ${token}` },
  );

  expect(data?.resetPassword.token).toBeTruthy();
  expect(await comparePassword({
    pwd: 'new-password',
    hash: (await global.config.db.user.findUnique({ where: { id: user.id } }))?.password,
  })).toBeTruthy();
});


test('should fail - Password Invalid', async () => {
  const { user } = await global.config.utils.createUser();

  const token = generateToken({
    type: TokenType.RESET,
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
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Password Invalid');
  }
});
