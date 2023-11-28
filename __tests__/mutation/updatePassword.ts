import { gql } from 'graphql-request';
import '../../global-variables';
import { comparePassword } from '../../src/modules/Auth';
import { UpdatePasswordInput } from '../../src/resolvers/mutation/updatePassword';

const query = gql`
  mutation updatePassword($data: UpdatePasswordInput!) {
    updatePassword(data: $data)
  }
`;

type Response = { updatePassword: boolean };
type Variables = { data: UpdatePasswordInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        currentPassword: 'password',
        newPassword: 'new-password',
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updatePassword).toBeTruthy();
  expect(
    await comparePassword({
      pwd: 'new-password',
      hash: (await global.config.db.user.findUnique({ where: { id: user.user.id } }))?.password,
    }),
  ).toBeTruthy();
});

test('should fail - Invalid new password', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          currentPassword: 'password',
          newPassword: '',
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Invalid new password');
  }
});

test('should fail - Password Incorrect', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          currentPassword: 'incorrect-password',
          newPassword: 'new-password',
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Password Incorrect');
  }
});
