import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { UpdateTreeInput } from '../../src/resolvers/mutation/updateTree';
import { TreeProfile } from '../../src/types/TreeProfile';

const query = gql`
  mutation updateTree($data: UpdateTreeInput!) {
    updateTree(data: $data) {
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

type Response = { updateTree: TreeProfile };
type Variables = { data: UpdateTreeInput };

test('should succeed without data', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: tree.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateTree.name).toEqual(tree.name);
  expect(data?.updateTree.cultivationDate).toEqual(tree.cultivationDate.toISOString());
});

test('should succeed with data', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
  });
  const name = await TestUtils.randomString();
  const cultivationDate = new Date(0).toISOString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: tree.id,
        name,
        cultivationDate,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateTree.name).toEqual(name);
  expect(data?.updateTree.cultivationDate).toEqual(cultivationDate);
});

test('should fail if user does not own tree', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          id: tree.id,
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Unauthorized');
  }
});

test('should fail if tree does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          id: 'unknown',
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Tree does not exist');
  }
});
