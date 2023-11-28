import { gql } from 'graphql-request';
import '../../global-variables';
import { ReportTreeEntryCommentInput } from '../../src/resolvers/mutation/reportTreeEntryComment';
import TestUtils from '../utils';

const query = gql`
  mutation reportTreeEntryComment($data: ReportTreeEntryCommentInput!) {
    reportTreeEntryComment(data: $data)
  }
`;

type Response = { reportTreeEntryComment: boolean };
type Variables = { data: ReportTreeEntryCommentInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();
  const comment = await global.config.db.treeEntryComment.create({
    data: {
      creator: {
        connect: {
          id: user.user.id,
        },
      },
      treeEntry: {
        create: {
          tree: {
            connect: {
              id: tree.id,
            },
          },
          notes: '',
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

  expect(data?.reportTreeEntryComment).toBeTruthy();
  expect(
    (await global.config.db.treeEntryComment.findUnique({ where: { id: comment.id } }))?.reportedAt,
  ).toBeTruthy();
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
