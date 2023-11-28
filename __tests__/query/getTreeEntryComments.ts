import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import {
  GetTreeEntryCommentsInput,
  TreeEntryCommentProfilesPayLoad,
} from '../../src/resolvers/query/getTreeEntryComments';

const query = gql`
  query getTreeEntryComments($data: GetTreeEntryCommentsInput!) {
    getTreeEntryComments(data: $data) {
      comments {
        id
      }
      count
    }
  }
`;

type Response = { getTreeEntryComments: TreeEntryCommentProfilesPayLoad };
type Variables = { data?: GetTreeEntryCommentsInput };

test('should succeed', async () => {
  /**
   * Create user, tree and tree entry
   */
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();
  const treeEntry = await global.config.db.treeEntry.create({
    data: {
      notes: TestUtils.randomString(),
      treeId: tree.id,
    },
  });

  /**
   * Create treeEntry comments
   */
  const treeEntryComment1 = await global.config.db.treeEntryComment.create({
    data: {
      comment: TestUtils.randomString(),
      treeEntryId: treeEntry.id,
      creatorId: user.user.id,
    },
  });

  const treeEntryComment2 = await global.config.db.treeEntryComment.create({
    data: {
      comment: TestUtils.randomString(),
      treeEntryId: treeEntry.id,
      creatorId: user.user.id,
    },
  });

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeEntryId: treeEntry.id,
        take: 2,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getTreeEntryComments.comments.length).toEqual(2);
  expect(data.data?.getTreeEntryComments.count).toEqual(2);
  expect(
    data.data?.getTreeEntryComments.comments.find((e) => e.id === treeEntryComment1.id),
  ).toBeTruthy();
  expect(
    data.data?.getTreeEntryComments.comments.find((e) => e.id === treeEntryComment2.id),
  ).toBeTruthy();
});

test('should fail if tree entry does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeEntryId: 'unknown',
          take: 2,
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
