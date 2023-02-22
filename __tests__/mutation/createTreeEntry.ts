import { gql } from 'graphql-request';
import '../../global-variables';
import path from 'path';
import { createReadStream } from 'fs-extra';
import TestUtils from '../utils';
import { CreateTreeEntryInput } from '../../src/resolvers/mutation/createTreeEntry';
import { TreeProfile } from '../../src/types/TreeProfile';
import { FileHandler } from '../../src/modules/FileHandler';


const query = gql`
  mutation createTreeEntry($data: CreateTreeEntryInput!){
    createTreeEntry(data: $data) {
      id
      entries {
        id
        notes
        image {
          id
          url {
            full
          }
          mime
          author {
            id
          }
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

test('should succeed with image', async () => {
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
        image: createReadStream(path.join(__dirname, '/../support/files/test.image.jpeg')) as any,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test resolvers
  expect(data?.createTreeEntry.entries?.[0].image.mime).toEqual('image/jpeg');
  expect(data?.createTreeEntry.entries?.[0].image.url.full).toEqual(`${FileHandler.config.siteUrl}/public/trees/${data?.createTreeEntry.id}/entries/${data?.createTreeEntry.entries?.[0].id}.jpeg`);
  expect(data?.createTreeEntry.entries?.[0].image.author?.id).toEqual(user.user.id);
});

test('should fail if user does not own tree', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();
  const notes = await TestUtils.randomString();
  const createdAt = new Date(0).toISOString();

  try {
    await global.config.client.rawRequest<Response, Variables>(
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
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Unauthorized');
  }
});

test('should fail if tree does not exist', async () => {
  const user = await global.config.utils.createUser();
  const notes = await TestUtils.randomString();
  const createdAt = new Date(0).toISOString();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeId: 'unknown',
          notes,
          createdAt,
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
