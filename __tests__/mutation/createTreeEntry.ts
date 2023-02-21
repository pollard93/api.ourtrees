import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { CreateTreeEntryInput } from '../../src/resolvers/mutation/createTreeEntry';
import { TreeProfile } from '../../src/types/TreeProfile';


const query = gql`
  mutation createTreeEntry($data: CreateTreeEntryInput!){
    createTreeEntry(data: $data) {
      id
      entries {
        id
        notes
        image {
          id
        }
        createdAt
      }
    }
  }
`;

type Response = { createTreeEntry: TreeProfile };
type Variables = { data: CreateTreeEntryInput };


test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
  });
  const notes = await TestUtils.randomString();
  const createdAt = new Date(0).toISOString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeId: tree.id,
        notes,
        createdAt,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.createTreeEntry.entries?.length).toEqual(1);
  expect(data?.createTreeEntry.entries?.[0].notes).toEqual(notes);
  expect(data?.createTreeEntry.entries?.[0].createdAt).toEqual(createdAt);
  expect(data?.createTreeEntry.entries?.[0].image).toBeNull();
});
