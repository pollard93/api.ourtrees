import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { UpdateEmailInput } from '../../src/resolvers/mutation/updateEmail';

const query = gql`
  mutation updateEmail($data: UpdateEmailInput!) {
    updateEmail(data: $data)
  }
`;

type Response = { updateEmail: boolean };
type Variables = { data: UpdateEmailInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const email = TestUtils.randomEmail();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        email,
        password: 'password',
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateEmail).toBeTruthy();
  expect(global.config.emailEventsStubs.emitTransactionalEmail.callCount).toEqual(1);
});

test('should fail - Password Incorrect', async () => {
  const user = await global.config.utils.createUser();
  const email = TestUtils.randomEmail();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          email,
          password: 'incorrect-password',
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Password Incorrect');
  }
});

test('should fail - email already in use', async () => {
  const user = await global.config.utils.createUser();
  const {
    user: { email },
  } = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          email,
          password: 'incorrect-password',
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Invalid Email');
  }
});
