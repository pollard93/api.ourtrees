import { gql } from 'graphql-request';
import TestUtils from '../utils';
import '../../global-variables';
import { AuthPayload } from '../../src/types/AuthPayload';
import { RegisterInput } from '../../src/resolvers/mutation/register';


const query = gql`
  mutation register($data: RegisterInput!) {
    register(data: $data){
      token
      user {
        id
        email
      }
    }
  }
`;

type Response = { register: AuthPayload };
type Variables = { data: RegisterInput }


test('should succeed', async () => {
  const email = TestUtils.randomEmail();

  const { data: { register } } = await global.config.client.rawRequest<Response, Variables>(query, {
    data: {
      email,
      password: 'password',
    },
  });

  expect(typeof register.token).toEqual('string');
  expect(register.user.email).toEqual(email);
  expect(global.config.emailEventsStubs.emitTransactionalEmail.callCount).toEqual(1);
});


test('should fail if email already exists', async () => {
  const { user } = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(query, {
      data: {
        email: user.email,
        password: 'password',
      },
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('User Already Exists');
  }
});


test('should fail if email invalid', async () => {
  try {
    await global.config.client.rawRequest<Response, Variables>(query, {
      data: {
        email: 'invalid email',
        password: 'password',
      },
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Email Invalid');
  }
});


test('should fail if password invalid', async () => {
  try {
    await global.config.client.rawRequest<Response, Variables>(query, {
      data: {
        email: TestUtils.randomEmail(),
        password: 'in',
      },
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Password Invalid');
  }
});
