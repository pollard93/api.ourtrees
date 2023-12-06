import { gql } from 'graphql-request';
import '../../global-variables';
import { FollowUserInput } from '../../src/resolvers/mutation/followUser';
import { UserProfile } from '../../src/types/UserProfile';

const query = gql`
  mutation followUser($data: FollowUserInput!) {
    followUser(data: $data) {
      id
      following
    }
  }
`;

type Response = { followUser: UserProfile };
type Variables = { data: FollowUserInput };

test('should follow', async () => {
  const requestor = await global.config.utils.createUser();
  const user = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        userId: user.user.id,
      },
    },
    { authorization: `Bearer ${requestor.token}` },
  );

  expect(data?.followUser.following).toBeTruthy();
});

test('should unfollow', async () => {
  const requestor = await global.config.utils.createUser();
  const user = await global.config.utils.createUser({
    followers: {
      connect: {
        id: requestor.user.id,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        userId: user.user.id,
        unfollow: true,
      },
    },
    { authorization: `Bearer ${requestor.token}` },
  );

  expect(data?.followUser.following).toBeFalsy();
});
