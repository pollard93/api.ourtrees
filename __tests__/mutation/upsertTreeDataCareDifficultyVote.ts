import { gql } from 'graphql-request';
import '../../global-variables';
import { TREE_CARE_DIFFICULTY_TYPE } from '@prisma/client';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';
import { UpsertTreeDataCareDifficultyVoteInput } from '../../src/resolvers/mutation/upsertTreeDataCareDifficultyVote';

const query = gql`
  mutation upsertTreeDataCareDifficultyVote($data: UpsertTreeDataCareDifficultyVoteInput!) {
    upsertTreeDataCareDifficultyVote(data: $data) {
      id
      careDifficultyResult {
        count
        easy
        moderate
        hard
      }
    }
  }
`;

type Response = { upsertTreeDataCareDifficultyVote: TreeDataProfile };
type Variables = { data: UpsertTreeDataCareDifficultyVoteInput };

test('should create result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        type: TREE_CARE_DIFFICULTY_TYPE.EASY,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.count).toBe(1);
  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.easy).toBe(1);
  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.moderate).toBe(0);
  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.hard).toBe(0);
});

test('should update result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careDifficultyResult: {
      create: {
        count: 0,
        easy: 0,
        moderate: 0,
        hard: 0,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        type: TREE_CARE_DIFFICULTY_TYPE.EASY,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.count).toBe(1);
  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.easy).toBe(1);
  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.moderate).toBe(0);
  expect(data?.upsertTreeDataCareDifficultyVote.careDifficultyResult.hard).toBe(0);
});
