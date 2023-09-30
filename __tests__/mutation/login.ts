import { gql } from 'graphql-request';
import '../../global-variables';
import { LoginInput } from '../../src/resolvers/mutation/login';
import { AuthPayload } from '../../src/types/AuthPayload';


const query = gql`
  mutation login($data: LoginInput!){
    login(data: $data){
      token
      user {
        id
        email
      }
    }
  }
`;

type Response = { login: AuthPayload };
type Variables = { data: LoginInput };


test('should succeed', async () => {
  const { user } = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(query, {
    data: {
      email: user.email,
      password: 'password',
    },
  });

  expect(typeof data?.login.token).toEqual('string');
  expect(data?.login.user.email).toEqual(user.email);
});


test('should fail - invalid password', async () => {
  const { user } = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(query, {
      data: {
        email: user.email,
        password: 'invalid-password',
      },
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Email or Password Incorrect');
  }
});


test('should login fail - unknown email', async () => {
  try {
    await global.config.client.rawRequest<Response, Variables>(query, {
      data: {
        email: 'unknown',
        password: 'password',
      },
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Email or Password Incorrect');
  }
});
