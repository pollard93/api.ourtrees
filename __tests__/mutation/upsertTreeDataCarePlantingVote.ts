import { gql } from 'graphql-request';
import '../../global-variables';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';
import { UpsertTreeDataCarePlantingVoteInput } from '../../src/resolvers/mutation/upsertTreeDataCarePlantingVote';


const query = gql`
  mutation upsertTreeDataCarePlantingVote($data: UpsertTreeDataCarePlantingVoteInput!){
    upsertTreeDataCarePlantingVote(data: $data) {
      id
      carePlantingResult {
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

type Response = { upsertTreeDataCarePlantingVote: TreeDataProfile };
type Variables = { data: UpsertTreeDataCarePlantingVoteInput };


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

  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.count).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.jan).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.feb).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.mar).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.apr).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.may).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.jun).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.jul).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.aug).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.sep).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.oct).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.nov).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.dec).toBe(0);
});


test('should update result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    carePlantingResult: {
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

  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.count).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.jan).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.feb).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.mar).toBe(1);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.apr).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.may).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.jun).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.jul).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.aug).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.sep).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.oct).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.nov).toBe(0);
  expect(data?.upsertTreeDataCarePlantingVote.carePlantingResult.dec).toBe(0);
});
