import { gql } from 'graphql-request';
import '../../global-variables';
import path from 'path';
import { createReadStream } from 'fs-extra';
import TestUtils from '../utils';
import { UpdateTreeEntryInput } from '../../src/resolvers/mutation/updateTreeEntry';
import { FileHandler } from '../../src/modules/FileHandler';
import { TreeEntryProfile } from '../../src/types/TreeEntryProfile';


const query = gql`
  mutation updateTreeEntry($data: UpdateTreeEntryInput!){
    updateTreeEntry(data: $data) {
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
    }
  }
`;

type Response = { updateTreeEntry: TreeEntryProfile };
type Variables = { data: UpdateTreeEntryInput };


test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
  });
  const treeEntry = await global.config.db.treeEntry.create({
    data: {
      notes: TestUtils.randomString(),
      treeId: tree.id,
    },
  });

  const notes = await TestUtils.randomString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeEntry.id,
        notes,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateTreeEntry.id).toEqual(treeEntry.id);
  expect(data?.updateTreeEntry.notes).toEqual(notes);
  expect(data?.updateTreeEntry.image).toEqual(null);
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
  const treeEntry = await global.config.db.treeEntry.create({
    data: {
      notes: TestUtils.randomString(),
      treeId: tree.id,
    },
  });

  const notes = await TestUtils.randomString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeEntry.id,
        notes,
        image: createReadStream(path.join(__dirname, '/../support/files/test.image.jpeg')) as any,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateTreeEntry.id).toEqual(treeEntry.id);
  expect(data?.updateTreeEntry.notes).toEqual(notes);
  expect(data?.updateTreeEntry.image.mime).toEqual('image/jpeg');
  expect(data?.updateTreeEntry.image.url.full).toEqual(`${FileHandler.config.siteUrl}/public/trees/${tree.id}/entries/${data?.updateTreeEntry.id}.full.jpeg`);
  expect(data?.updateTreeEntry.image.author?.id).toEqual(user.user.id);
});

test('should succeed with updating image', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
  });
  const treeEntry = await global.config.db.treeEntry.create({
    data: {
      notes: TestUtils.randomString(),
      treeId: tree.id,
      image: {
        create: {
          path: '',
          mime: '',
          author: {
            connect: {
              id: user.user.id,
            },
          },
        },
      },
    },
  });

  const notes = await TestUtils.randomString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: treeEntry.id,
        notes,
        image: createReadStream(path.join(__dirname, '/../support/files/test.image.jpeg')) as any,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateTreeEntry.id).toEqual(treeEntry.id);
  expect(data?.updateTreeEntry.notes).toEqual(notes);
  expect(data?.updateTreeEntry.image.mime).toEqual('image/jpeg');
  expect(data?.updateTreeEntry.image.url.full).toEqual(`${FileHandler.config.siteUrl}/public/trees/${tree.id}/entries/${data?.updateTreeEntry.id}.full.jpeg`);
  expect(data?.updateTreeEntry.image.author?.id).toEqual(user.user.id);
});

test('should fail if user does not own tree', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();
  const notes = await TestUtils.randomString();
  const treeEntry = await global.config.db.treeEntry.create({
    data: {
      notes: TestUtils.randomString(),
      treeId: tree.id,
    },
  });

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          id: treeEntry.id,
          notes,
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

test('should fail if tree entry does not exist', async () => {
  const user = await global.config.utils.createUser();
  const notes = await TestUtils.randomString();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          id: 'unknown',
          notes,
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
