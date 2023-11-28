import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { CreateTreeInput } from '../../src/resolvers/mutation/createTree';
import { TreeProfile } from '../../src/types/TreeProfile';

const query = gql`
  mutation createTree($data: CreateTreeInput!) {
    createTree(data: $data) {
      id
      name
      cultivationDate
      treeData {
        id
      }
      creator {
        id
      }
    }
  }
`;

type Response = { createTree: TreeProfile };
type Variables = { data: CreateTreeInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const name = await TestUtils.randomString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        name,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.createTree.name).toEqual(name);
  expect(data?.createTree.cultivationDate).toBeTruthy();
  expect(data?.createTree.treeData.id).toEqual(treeData.id);
  expect(data?.createTree.creator.id).toEqual(user.user.id);
});

test('should succeed with cultivation date', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const cultivationDate = new Date(0).toISOString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        name: await TestUtils.randomString(),
        cultivationDate,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.createTree.cultivationDate).toEqual(cultivationDate);
});
