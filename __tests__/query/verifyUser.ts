import { gql } from 'graphql-request';
import '../../global-variables';
import { generateToken } from '../../src/modules/Auth';
import { TokenType } from '../../src/modules/Auth/interfaces';
import { AuthPayload } from '../../src/types/AuthPayload';

const query = gql`
  query verifyUser {
    verifyUser {
      user {
        verified
      }
    }
  }
`;

type Response = { verifyUser: AuthPayload };
type Variables = Record<string, unknown>;

test('should succeed', async () => {
  const user = await global.config.utils.createUser();

  const token = generateToken({
    type: TokenType.VERIFICATION,
    data: {
      id: user.user.id,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(query, undefined, {
    authorization: `Bearer ${token}`,
  });

  expect(data?.verifyUser.user.verified).toBeTruthy();
});

test('should fail - user doesn\'t exist', async () => {
  const token = generateToken({
    type: TokenType.VERIFICATION,
    data: {
      id: 'user.user.id',
    },
  });

  try {
    await global.config.client.rawRequest<Response, Variables>(query, undefined, {
      authorization: `Bearer ${token}`,
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});
