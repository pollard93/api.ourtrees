import { gql } from 'graphql-request';
import '../../global-variables';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';
import { UpsertTreeDataCareWhenToReleaseVoteInput } from '../../src/resolvers/mutation/upsertTreeDataCareWhenToReleaseVote';

const query = gql`
  mutation upsertTreeDataCareWhenToReleaseVote($data: UpsertTreeDataCareWhenToReleaseVoteInput!) {
    upsertTreeDataCareWhenToReleaseVote(data: $data) {
      id
      careWhenToReleaseResult {
        count
        jan
        feb
        mar
        apr
        may
        jun
        jul
        aug
        sep
        oct
        nov
        dec
      }
    }
  }
`;

type Response = { upsertTreeDataCareWhenToReleaseVote: TreeDataProfile };
type Variables = { data: UpsertTreeDataCareWhenToReleaseVoteInput };

test('should create result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        months: [1, 2, 3],
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.count).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.jan).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.feb).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.mar).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.apr).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.may).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.jun).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.jul).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.aug).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.sep).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.oct).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.nov).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.dec).toBe(0);
});

test('should update result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careWhenToReleaseResult: {
      create: {
        count: 0,
        jan: 0,
        feb: 0,
        mar: 0,
        apr: 0,
        may: 0,
        jun: 0,
        jul: 0,
        aug: 0,
        sep: 0,
        oct: 0,
        nov: 0,
        dec: 0,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        months: [1, 2, 3],
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.count).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.jan).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.feb).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.mar).toBe(1);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.apr).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.may).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.jun).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.jul).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.aug).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.sep).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.oct).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.nov).toBe(0);
  expect(data?.upsertTreeDataCareWhenToReleaseVote.careWhenToReleaseResult.dec).toBe(0);
});
