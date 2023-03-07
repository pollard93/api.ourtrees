import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { GetTreeCommentsInput, TreeCommentProfilesPayLoad } from '../../src/resolvers/query/getTreeComments';


const query = gql`
  query getTreeComments($data: GetTreeCommentsInput!){
    getTreeComments(data: $data){
      comments {
        id
      }
      count
    }
  }
`;

type Response = { getTreeComments: TreeCommentProfilesPayLoad };
type Variables = { data?: GetTreeCommentsInput };


test('should succeed', async () => {
  /**
   * Create user and tree
   */
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();

  /**
   * Create tree comments
   */
  const treeComment1 = await global.config.db.treeComment.create({
    data: {
      comment: TestUtils.randomString(),
      treeId: tree.id,
      creatorId: user.user.id,
    },
  });

  const treeComment2 = await global.config.db.treeComment.create({
    data: {
      comment: TestUtils.randomString(),
      treeId: tree.id,
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
        treeId: tree.id,
        take: 2,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getTreeComments.comments.length).toEqual(2);
  expect(data.data?.getTreeComments.count).toEqual(2);
  expect(data.data?.getTreeComments.comments.find((e) => e.id === treeComment1.id)).toBeTruthy();
  expect(data.data?.getTreeComments.comments.find((e) => e.id === treeComment2.id)).toBeTruthy();
});


test('should fail if tree does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeId: 'unknown',
          take: 2,
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
