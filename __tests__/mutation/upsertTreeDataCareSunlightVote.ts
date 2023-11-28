import { gql } from 'graphql-request';
import '../../global-variables';
import { TREE_CARE_SUNLIGHT_TYPE } from '@prisma/client';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';
import { UpsertTreeDataCareSunlightVoteInput } from '../../src/resolvers/mutation/upsertTreeDataCareSunlightVote';

const query = gql`
  mutation upsertTreeDataCareSunlightVote($data: UpsertTreeDataCareSunlightVoteInput!) {
    upsertTreeDataCareSunlightVote(data: $data) {
      id
      careSunlightResult {
        count
        indirect
        partial
        direct
      }
    }
  }
`;

type Response = { upsertTreeDataCareSunlightVote: TreeDataProfile };
type Variables = { data: UpsertTreeDataCareSunlightVoteInput };

test('should create result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        type: TREE_CARE_SUNLIGHT_TYPE.INDIRECT,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.count).toBe(1);
  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.indirect).toBe(1);
  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.partial).toBe(0);
  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.direct).toBe(0);
});

test('should update result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careSunlightResult: {
      create: {
        count: 0,
        indirect: 0,
        partial: 0,
        direct: 0,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        type: TREE_CARE_SUNLIGHT_TYPE.INDIRECT,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.count).toBe(1);
  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.indirect).toBe(1);
  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.partial).toBe(0);
  expect(data?.upsertTreeDataCareSunlightVote.careSunlightResult.direct).toBe(0);
});
