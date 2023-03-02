import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { GetTreeInput } from '../../src/resolvers/query/getTree';
import { TreeProfile } from '../../src/types/TreeProfile';


const query = gql`
  query getTree($data: GetTreeInput!){
    getTree(data: $data){
      id
    }
  }
`;

type Response = { getTree: TreeProfile };
type Variables = { data?: GetTreeInput };


test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: tree.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getTree.id).toEqual(tree.id);
});


test('should fail if entry does not exist', async () => {
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
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Tree does not exist');
  }
});
