import { gql } from 'graphql-request';
import '../../global-variables';
import { FollowTreeInput } from '../../src/resolvers/mutation/followTree';
import { TreeProfile } from '../../src/types/TreeProfile';

const query = gql`
  mutation followTree($data: FollowTreeInput!) {
    followTree(data: $data) {
      id
      following
    }
  }
`;

type Response = { followTree: TreeProfile };
type Variables = { data: FollowTreeInput };

test('should follow', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeId: tree.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.followTree.following).toBeTruthy();
});

test('should unfollow', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree({
    followers: {
      connect: {
        id: user.user.id,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeId: tree.id,
        unfollow: true,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.followTree.following).toBeFalsy();
});
