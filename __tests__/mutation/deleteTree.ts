import { gql } from 'graphql-request';
import '../../global-variables';
import { DeleteTreeInput } from '../../src/resolvers/mutation/deleteTree';

const query = gql`
  mutation deleteTree($data: DeleteTreeInput!) {
    deleteTree(data: $data)
  }
`;

type Response = { deleteTree: boolean };
type Variables = { data: DeleteTreeInput };

test('should succeed', async () => {
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

  expect(data?.deleteTree).toBeTruthy();

  const treeAfter = await global.config.db.tree.findUnique({
    where: {
      id: tree.id,
    },
  });
  expect(treeAfter).toBeFalsy();
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
