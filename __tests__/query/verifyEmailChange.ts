import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { generateToken } from '../../src/modules/Auth';
import { TokenType } from '../../src/modules/Auth/interfaces';
import { AuthPayload } from '../../src/types/AuthPayload';

const query = gql`
  query verifyEmailChange {
    verifyEmailChange {
      user {
        id
        email
      }
    }
  }
`;

type Response = { verifyEmailChange: AuthPayload };
type Variables = Record<string, unknown>;

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const email = await TestUtils.randomEmail();

  const token = generateToken({
    type: TokenType.EMAIL_UPDATE_VERIFICATION,
    data: {
      newEmail: email,
      existingEmail: user.user.email,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(query, undefined, {
    authorization: `Bearer ${token}`,
  });

  // Verify the users email was updated
  expect(data?.verifyEmailChange.user.email).toEqual(email);
});

/**
 * Tests the case that the user has requested 2 email updates, executes
 * one and then tries to execute the other which was requested on their
 * old email address.
 */
test('should fail - Token Invalid', async () => {
  const email = await TestUtils.randomEmail();

  const token = generateToken({
    type: TokenType.EMAIL_UPDATE_VERIFICATION,
    data: {
      newEmail: email,
      existingEmail: TestUtils.randomEmail(),
    },
  });

  try {
    await global.config.client.rawRequest<Response, Variables>(query, undefined, {
      authorization: `Bearer ${token}`,
    });
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Token Invalid');
  }
});
