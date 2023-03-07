import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { CreateTreeEntryCommentInput } from '../../src/resolvers/mutation/createTreeEntryComment';
import { TreeEntryCommentProfile } from '../../src/types/TreeEntryCommentProfile';


const query = gql`
  mutation createTreeEntryComment($data: CreateTreeEntryCommentInput!){
    createTreeEntryComment(data: $data) {
      comment
      createdAt
      creator {
        id
      }
    }
  }
`;

type Response = { createTreeEntryComment: TreeEntryCommentProfile };
type Variables = { data: CreateTreeEntryCommentInput };


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
  const comment = await TestUtils.randomString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeEntryId: treeEntry.id,
        comment,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.createTreeEntryComment.comment).toEqual(comment);
  expect(data?.createTreeEntryComment.createdAt).toBeTruthy();
  expect(data?.createTreeEntryComment.creator.id).toEqual(user.user.id);
});

test('should fail if treeEntry does not exist', async () => {
  const user = await global.config.utils.createUser();
  const comment = await TestUtils.randomString();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeEntryId: 'unknown',
          comment,
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
