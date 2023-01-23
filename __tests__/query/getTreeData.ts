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
