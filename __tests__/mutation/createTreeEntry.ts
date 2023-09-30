import { gql } from 'graphql-request';
import '../../global-variables';
import path from 'path';
import { createReadStream } from 'fs-extra';
import TestUtils from '../utils';
import { CreateTreeEntryInput } from '../../src/resolvers/mutation/createTreeEntry';
import { FileHandler } from '../../src/modules/FileHandler';
import { TreeEntryProfile } from '../../src/types/TreeEntryProfile';


const query = gql`
  mutation createTreeEntry($data: CreateTreeEntryInput!){
    createTreeEntry(data: $data) {
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
`;

type Response = { createTreeEntry: TreeEntryProfile };
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

  expect(data?.createTreeEntry.notes).toEqual(notes);
  expect(data?.createTreeEntry.createdAt).toEqual(createdAt);
  expect(data?.createTreeEntry.image).toBeNull();
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
  expect(data?.createTreeEntry.image.mime).toEqual('image/jpeg');
  expect(data?.createTreeEntry.image.url.full).toEqual(`${FileHandler.config.siteUrl}/public/trees/${tree.id}/entries/${data?.createTreeEntry.id}.full.jpeg`);
  expect(data?.createTreeEntry.image.author?.id).toEqual(user.user.id);
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
