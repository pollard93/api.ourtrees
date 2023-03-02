import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { GetTreeEntryInput } from '../../src/resolvers/query/getTreeEntry';
import { TreeEntryProfile } from '../../src/types/TreeEntryProfile';


const query = gql`
  query getTreeEntry($data: GetTreeEntryInput!){
    getTreeEntry(data: $data){
      id
    }
  }
`;

type Response = { getTreeEntry: TreeEntryProfile };
type Variables = { data?: GetTreeEntryInput };


test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();

  /**
   * Create tree entry
   */
  const treeEntry = await global.config.db.treeEntry.create({
    data: {
      notes: TestUtils.randomString(),
      treeId: tree.id,
    },
  });

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeEntry.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getTreeEntry.id).toEqual(treeEntry.id);
});


test('should fail if entry does not exist', async () => {
  const user = await global.config.utils.createUser();

  /**
   * Test
   */

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
    expect(error.response.errors[0].message).toEqual('Tree entry does not exist');
  }
});
