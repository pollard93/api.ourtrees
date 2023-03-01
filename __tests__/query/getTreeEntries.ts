import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { GetTreeEntriesInput, TreeEntryProfilesPayLoad } from '../../src/resolvers/query/getTreeEntries';


const query = gql`
  query getTreeEntries($data: GetTreeEntriesInput!){
    getTreeEntries(data: $data){
      entries {
        id
      }
      count
    }
  }
`;

type Response = { getTreeEntries: TreeEntryProfilesPayLoad };
type Variables = { data?: GetTreeEntriesInput };


test('should succeed', async () => {
  /**
   * Create user and tree
   */
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();

  /**
   * Create tree entries
   */
  const treeEntry1 = await global.config.db.treeEntry.create({
    data: {
      notes: TestUtils.randomString(),
      treeId: tree.id,
    },
  });

  const treeEntry2 = await global.config.db.treeEntry.create({
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
        treeId: tree.id,
        take: 2,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getTreeEntries.entries.length).toEqual(2);
  expect(data.data?.getTreeEntries.count).toEqual(2);
  expect(data.data?.getTreeEntries.entries.find((e) => e.id === treeEntry1.id)).toBeTruthy();
  expect(data.data?.getTreeEntries.entries.find((e) => e.id === treeEntry2.id)).toBeTruthy();
});
