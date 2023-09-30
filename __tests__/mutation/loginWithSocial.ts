import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { LoginWithSocialInput, SocialProvider } from '../../src/resolvers/mutation/loginWithSocial';
import { AuthPayload } from '../../src/types/AuthPayload';


const query = gql`
  mutation loginWithSocial($data: LoginWithSocialInput!){
    loginWithSocial(data: $data){
      token
      user {
        id
        email
      }
    }
  }
`;

type Response = { loginWithSocial: AuthPayload };
type Variables = { data: LoginWithSocialInput };


/**
 * FACEBOOK
 */

test('(facebook) - should succeed and return general access token for new user', async () => {
  const email = TestUtils.randomEmail();

  const { data } = await global.config.client.rawRequest<Response, Variables>(query,
    {
      data: {
        provider: SocialProvider.FACEBOOK,
      },
    },
    {
      authorization: `Bearer ${JSON.stringify({
        id: TestUtils.randomString(),
        email,
      })}`,
    });

  expect(typeof data?.loginWithSocial.token).toEqual('string');
  expect(data?.loginWithSocial.user.email).toEqual(email);

  // User should be verified
  const user = await global.config.db.user.findUnique({ where: { id: data?.loginWithSocial.user.id } });
  expect(user?.verified).toBeTruthy();
});

test('(facebook) - should succeed and return general access token for existing user', async () => {
  const { user } = await global.config.utils.createUser();

  /**
   * Asign a facebook id to user
   */
  await global.config.db.user.update({
    where: {
      id: user.id,
    },
    data: {
      facebookId: user.id,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(query,
    {
      data: {
        provider: SocialProvider.FACEBOOK,
      },
    },
    {
      authorization: `Bearer ${JSON.stringify(user)}`,
    });

  expect(typeof data?.loginWithSocial.token).toEqual('string');
  expect(data?.loginWithSocial.user.id).toEqual(user.id);
  expect(data?.loginWithSocial.user.email).toEqual(user.email);
});


/**
 * GOOGLE
 */

test('(google) - should succeed and return general access token for new user', async () => {
  const email = TestUtils.randomEmail();

  const { data } = await global.config.client.rawRequest<Response, Variables>(query,
    {
      data: {
        provider: SocialProvider.GOOGLE,
      },
    },
    {
      authorization: `Bearer ${JSON.stringify({
        sub: TestUtils.randomString(),
        email,
      })}`,
    });

  expect(typeof data?.loginWithSocial.token).toEqual('string');
  expect(data?.loginWithSocial.user.email).toEqual(email);

  // User should be verified
  const user = await global.config.db.user.findUnique({ where: { id: data?.loginWithSocial.user.id } });
  expect(user?.verified).toBeTruthy();
});

test('(google) - should succeed and return general access token for existing user', async () => {
  const { user } = await global.config.utils.createUser();

  /**
   * Asign a facebook id to user
   */
  await global.config.db.user.update({
    where: {
      id: user.id,
    },
    data: {
      googleId: user.id,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(query,
    {
      data: {
        provider: SocialProvider.GOOGLE,
      },
    },
    {
      authorization: `Bearer ${JSON.stringify({
        sub: user.id,
        email: user.email,
      })}`,
    });

  expect(typeof data?.loginWithSocial.token).toEqual('string');
  expect(data?.loginWithSocial.user.id).toEqual(user.id);
  expect(data?.loginWithSocial.user.email).toEqual(user.email);
});

/**
 * BOTH
 */

test('should succeed with same email across both social platforms', async () => {
  const email = TestUtils.randomEmail();
  {
    const { data } = await global.config.client.rawRequest<Response, Variables>(query,
      {
        data: {
          provider: SocialProvider.FACEBOOK,
        },
      },
      {
        authorization: `Bearer ${JSON.stringify({
          id: TestUtils.randomString(),
          email,
        })}`,
      });

    expect(data?.loginWithSocial.token).toBeTruthy();
  }

  {
    const { data } = await global.config.client.rawRequest<Response, Variables>(query,
      {
        data: {
          provider: SocialProvider.GOOGLE,
        },
      },
      {
        authorization: `Bearer ${JSON.stringify({
          sub: TestUtils.randomString(),
          email,
        })}`,
      });

    expect(data?.loginWithSocial.token).toBeTruthy();
  }

  const user = await global.config.db.user.findUnique({ where: { email } });
  expect(user?.facebookId).toBeTruthy();
  expect(user?.googleId).toBeTruthy();
});
