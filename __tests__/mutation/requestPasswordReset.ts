import { gql } from 'graphql-request';
import '../../global-variables';
import { RequestPasswordResetInput } from '../../src/resolvers/mutation/requestPasswordReset';
import { AuthPayload } from '../../src/types/AuthPayload';

const query = gql`
  mutation requestPasswordReset($data: RequestPasswordResetInput!) {
    requestPasswordReset(data: $data)
  }
`;

type Response = { requestPasswordReset: AuthPayload };
type Variables = { data: RequestPasswordResetInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(query, {
    data: { email: user.user.email },
  });

  expect(data?.requestPasswordReset).toBeTruthy();
  expect(global.config.emailEventsStubs.emitTransactionalEmail.callCount).toEqual(1);
});

test('should fail - User Does Not Exist', async () => {
  try {
    await global.config.client.rawRequest<Response, Variables>(query, {
      data: { email: 'unknown-email' },
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('User Does Not Exist');
  }
});
