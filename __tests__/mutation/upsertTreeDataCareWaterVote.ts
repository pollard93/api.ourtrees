import { gql } from 'graphql-request';
import '../../global-variables';
import { TREE_CARE_WATER_TYPE } from '@prisma/client';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';
import { UpsertTreeDataCareWaterVoteInput } from '../../src/resolvers/mutation/upsertTreeDataCareWaterVote';

const query = gql`
  mutation upsertTreeDataCareWaterVote($data: UpsertTreeDataCareWaterVoteInput!) {
    upsertTreeDataCareWaterVote(data: $data) {
      id
      careWaterResult {
        count
        weekly
        biweekly
        triweekly
      }
    }
  }
`;

type Response = { upsertTreeDataCareWaterVote: TreeDataProfile };
type Variables = { data: UpsertTreeDataCareWaterVoteInput };

test('should create result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        type: TREE_CARE_WATER_TYPE.WEEKLY,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.count).toBe(1);
  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.weekly).toBe(1);
  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.biweekly).toBe(0);
  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.triweekly).toBe(0);
});

test('should update result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careWaterResult: {
      create: {
        count: 0,
        weekly: 0,
        biweekly: 0,
        triweekly: 0,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        type: TREE_CARE_WATER_TYPE.WEEKLY,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.count).toBe(1);
  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.weekly).toBe(1);
  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.biweekly).toBe(0);
  expect(data?.upsertTreeDataCareWaterVote.careWaterResult.triweekly).toBe(0);
});
