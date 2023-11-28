import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { CreateTreeCommentInput } from '../../src/resolvers/mutation/createTreeComment';
import { TreeCommentProfile } from '../../src/types/TreeCommentProfile';

const query = gql`
  mutation createTreeComment($data: CreateTreeCommentInput!) {
    createTreeComment(data: $data) {
      comment
      createdAt
      creator {
        id
      }
    }
  }
`;

type Response = { createTreeComment: TreeCommentProfile };
type Variables = { data: CreateTreeCommentInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();
  const comment = await TestUtils.randomString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeId: tree.id,
        comment,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.createTreeComment.comment).toEqual(comment);
  expect(data?.createTreeComment.createdAt).toBeTruthy();
  expect(data?.createTreeComment.creator.id).toEqual(user.user.id);
});

test('should fail if tree does not exist', async () => {
  const user = await global.config.utils.createUser();
  const comment = await TestUtils.randomString();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeId: 'unknown',
          comment,
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
