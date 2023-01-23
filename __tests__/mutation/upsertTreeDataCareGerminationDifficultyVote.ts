import { gql } from 'graphql-request';
import '../../global-variables';
import { TREE_CARE_GERMINATION_DIFFICULTY_TYPE } from '@prisma/client';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';
import { UpsertTreeDataCareGerminationDifficultyVoteInput } from '../../src/resolvers/mutation/upsertTreeDataCareGerminationDifficultyVote';


const query = gql`
  mutation upsertTreeDataCareGerminationDifficultyVote($data: UpsertTreeDataCareGerminationDifficultyVoteInput!){
    upsertTreeDataCareGerminationDifficultyVote(data: $data) {
      id
      careGerminationDifficultyResult {
        count
        easy
        moderate
        hard
      }
    }
  }
`;

type Response = { upsertTreeDataCareGerminationDifficultyVote: TreeDataProfile };
type Variables = { data: UpsertTreeDataCareGerminationDifficultyVoteInput };


test('should create result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        type: TREE_CARE_GERMINATION_DIFFICULTY_TYPE.EASY,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.count).toBe(1);
  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.easy).toBe(1);
  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.moderate).toBe(0);
  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.hard).toBe(0);
});


test('should update result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careGerminationDifficultyResult: {
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
        type: TREE_CARE_GERMINATION_DIFFICULTY_TYPE.EASY,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.count).toBe(1);
  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.easy).toBe(1);
  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.moderate).toBe(0);
  expect(data?.upsertTreeDataCareGerminationDifficultyVote.careGerminationDifficultyResult.hard).toBe(0);
});
