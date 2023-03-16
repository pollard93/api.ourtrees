import { gql } from 'graphql-request';
import '../../global-variables';
import { ReportTreeCommentInput } from '../../src/resolvers/mutation/reportTreeComment';
import TestUtils from '../utils';


const query = gql`
  mutation reportTreeComment($data: ReportTreeCommentInput!){
    reportTreeComment(data: $data)
  }
`;

type Response = { reportTreeComment: boolean };
type Variables = { data: ReportTreeCommentInput };


test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();
  const comment = await global.config.db.treeComment.create({
    data: {
      creator: {
        connect: {
          id: user.user.id,
        },
      },
      tree: {
        connect: {
          id: tree.id,
        },
      },
      comment: 'Content',
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: comment.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.reportTreeComment).toBeTruthy();
  expect((await global.config.db.treeComment.findUnique({ where: { id: comment.id } }))?.reportedAt).toBeTruthy();
});


test('should fail if does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          id: TestUtils.randomString(),
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Resource does not exist');
  }
});
