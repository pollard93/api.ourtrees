import { gql } from 'graphql-request';
import '../../global-variables';
import { ReportTreeInput } from '../../src/resolvers/mutation/reportTree';
import TestUtils from '../utils';

const query = gql`
  mutation reportTree($data: ReportTreeInput!) {
    reportTree(data: $data)
  }
`;

type Response = { reportTree: boolean };
type Variables = { data: ReportTreeInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: tree.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.reportTree).toBeTruthy();
  expect(
    (await global.config.db.tree.findUnique({ where: { id: tree.id } }))?.reportedAt,
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
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Resource does not exist');
  }
});
