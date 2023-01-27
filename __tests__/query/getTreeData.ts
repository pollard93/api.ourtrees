import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { GetTreeDataInput } from '../../src/resolvers/query/getTreeData';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';


const query = gql`
  query getTreeData($data: GetTreeDataInput!){
    getTreeData(data: $data){
      id
      careDifficultyResult {
        count
        easy
        moderate
        hard
      }
      careWaterResult {
        count
        weekly
        biweekly
        triweekly
      }
      careSunlightResult {
        count
        indirect
        partial
        direct
      }
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
      careGerminationDifficultyResult {
        count
        easy
        moderate
        hard
      }
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
      careObtainingSeedsResult {
        content {
          id
        }      
      }
      careHowToPlantSeedsResult {
        content {
          id
        }      
      }
    }
  }
`;

type Response = { getTreeData: TreeDataProfile | null };
type Variables = { data: GetTreeDataInput };


test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.id).toEqual(treeData.id);
});


test('should resolve careDifficultyResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careDifficultyResult: {
      create: {
        count: 1,
        easy: 2,
        moderate: 3,
        hard: 4,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.careDifficultyResult).toEqual({
    count: 1,
    easy: 2,
    moderate: 3,
    hard: 4,
  });
});


test('should resolve careWaterResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careWaterResult: {
      create: {
        count: 1,
        weekly: 2,
        biweekly: 3,
        triweekly: 4,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.careWaterResult).toEqual({
    count: 1,
    weekly: 2,
    biweekly: 3,
    triweekly: 4,
  });
});


test('should resolve careSunlightResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careSunlightResult: {
      create: {
        count: 1,
        indirect: 2,
        partial: 3,
        direct: 4,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.careSunlightResult).toEqual({
    count: 1,
    indirect: 2,
    partial: 3,
    direct: 4,
  });
});


test('should resolve carePlantingResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    carePlantingResult: {
      create: {
        count: 1,
        jan: 2,
        feb: 3,
        mar: 4,
        apr: 5,
        may: 6,
        jun: 7,
        jul: 8,
        aug: 9,
        sep: 10,
        oct: 11,
        nov: 12,
        dec: 13,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.carePlantingResult).toEqual({
    count: 1,
    jan: 2,
    feb: 3,
    mar: 4,
    apr: 5,
    may: 6,
    jun: 7,
    jul: 8,
    aug: 9,
    sep: 10,
    oct: 11,
    nov: 12,
    dec: 13,
  });
});


test('should resolve careGerminationDifficultyResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careGerminationDifficultyResult: {
      create: {
        count: 1,
        easy: 2,
        moderate: 3,
        hard: 4,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.careGerminationDifficultyResult).toEqual({
    count: 1,
    easy: 2,
    moderate: 3,
    hard: 4,
  });
});


test('should resolve careWhenToReleaseResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData({
    careWhenToReleaseResult: {
      create: {
        count: 1,
        jan: 2,
        feb: 3,
        mar: 4,
        apr: 5,
        may: 6,
        jun: 7,
        jul: 8,
        aug: 9,
        sep: 10,
        oct: 11,
        nov: 12,
        dec: 13,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.careWhenToReleaseResult).toEqual({
    count: 1,
    jan: 2,
    feb: 3,
    mar: 4,
    apr: 5,
    may: 6,
    jun: 7,
    jul: 8,
    aug: 9,
    sep: 10,
    oct: 11,
    nov: 12,
    dec: 13,
  });
});


test('should resolve careObtainingSeedsResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = await global.config.db.treeDataCareObtainingSeedsContent.create({
    data: {
      content: TestUtils.randomString(),
      treeDataId: treeData.id,
      userId: user.user.id,
    },
  });

  await global.config.db.treeData.update({
    where: {
      id: treeData.id,
    },
    data: {
      careObtainingSeedsResult: {
        update: {
          content: {
            connect: {
              id: content.id,
            },
          },
        },
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.careObtainingSeedsResult?.content?.id).toEqual(content.id);
});


test('should resolve careHowToPlantSeedsResult', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = await global.config.db.treeDataCareHowToPlantSeedsContent.create({
    data: {
      content: TestUtils.randomString(),
      treeDataId: treeData.id,
      userId: user.user.id,
    },
  });

  await global.config.db.treeData.update({
    where: {
      id: treeData.id,
    },
    data: {
      careHowToPlantSeedsResult: {
        update: {
          content: {
            connect: {
              id: content.id,
            },
          },
        },
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeData.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData?.careHowToPlantSeedsResult?.content?.id).toEqual(content.id);
});


test('should fail', async () => {
  const user = await global.config.utils.createUser();
  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: TestUtils.getRandomInt(10000),
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getTreeData).toEqual(null);
});
