import { gql } from 'graphql-request';
import '../../global-variables';
import { GetUserInput } from '../../src/resolvers/query/getUser';
import { UserProfile } from '../../src/types/UserProfile';
import { FileHandler } from '../../src/modules/FileHandler';

const query = gql`
  query getUser($data: GetUserInput!) {
    getUser(data: $data) {
      id
      profilePicture {
        id
        url {
          full
        }
        mime
        author {
          id
        }
      }
      following
    }
  }
`;

type Response = { getUser: UserProfile };
type Variables = { data?: GetUserInput };

test('should succeed', async () => {
  const requestor = await global.config.utils.createUser();
  const user = await global.config.utils.createUser();

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: user.user.id,
      },
    },
    { authorization: `Bearer ${requestor.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getUser.id).toEqual(user.user.id);
});

test('should succeed with profile picture', async () => {
  const requestor = await global.config.utils.createUser();
  const user = await global.config.utils.createUser({
    profilePicture: {
      create: {
        path: 'public/users/user-id/cover-image.jpeg',
        mime: 'test-mime',
        authorId: (await global.config.utils.createUser()).user.id,
      },
    },
  });

  /**
   * Get
   */
  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: user.user.id,
      },
    },
    { authorization: `Bearer ${requestor.token}` },
  );

  /**
   * Test
   */
  expect(data?.getUser.profilePicture.mime).toEqual('test-mime');
  expect(data?.getUser.profilePicture.url.full).toEqual(
    `${FileHandler.config.siteUrl}/public/users/user-id/cover-image.jpeg`,
  );
});

test('should succeed with following true', async () => {
  const requestor = await global.config.utils.createUser();
  const user = await global.config.utils.createUser({
    followers: {
      connect: {
        id: requestor.user.id,
      },
    },
  });

  /**
   * Get
   */
  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: user.user.id,
      },
    },
    { authorization: `Bearer ${requestor.token}` },
  );

  /**
   * Test
   */
  expect(data?.getUser.following).toEqual(true);
});

test('should succeed with following false', async () => {
  const requestor = await global.config.utils.createUser();
  const user = await global.config.utils.createUser();

  /**
   * Get
   */
  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: user.user.id,
      },
    },
    { authorization: `Bearer ${requestor.token}` },
  );

  /**
   * Test
   */
  expect(data?.getUser.following).toEqual(false);
});

test('should fail if entry does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          id: 'unknown',
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('User does not exist');
  }
});
