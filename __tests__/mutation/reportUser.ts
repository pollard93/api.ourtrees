import { gql } from 'graphql-request';
import '../../global-variables';
import { ReportUserInput } from '../../src/resolvers/mutation/reportUser';
import TestUtils from '../utils';

const query = gql`
  mutation reportUser($data: ReportUserInput!) {
    reportUser(data: $data)
  }
`;

type Response = { reportUser: boolean };
type Variables = { data: ReportUserInput };

test('should succeed', async () => {
  const requestor = await global.config.utils.createUser();
  const user = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: user.user.id,
      },
    },
    { authorization: `Bearer ${requestor.token}` },
  );

  expect(data?.reportUser).toBeTruthy();
  expect(
    (await global.config.db.user.findUnique({ where: { id: user.user.id } }))?.reportedAt,
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
