import { gql } from 'graphql-request';
import '../../global-variables';
import { DeleteTreeDataCareObtainingSeedsContentInput } from '../../src/resolvers/mutation/deleteTreeDataObtainingSeedsContent';
import TestUtils from '../utils';

const query = gql`
  mutation deleteTreeDataCareObtainingSeedsContent(
    $data: DeleteTreeDataCareObtainingSeedsContentInput!
  ) {
    deleteTreeDataCareObtainingSeedsContent(data: $data)
  }
`;

type Response = { deleteTreeDataCareObtainingSeedsContent: boolean };
type Variables = { data: DeleteTreeDataCareObtainingSeedsContentInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = await global.config.db.treeDataCareObtainingSeedsContent.create({
    data: {
      user: {
        connect: {
          id: user.user.id,
        },
      },
      treeData: {
        connect: {
          id: treeData.id,
        },
      },
      content: 'Content',
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: content.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.deleteTreeDataCareObtainingSeedsContent).toBeTruthy();
  expect(
    await global.config.db.treeDataCareObtainingSeedsContent.findUnique({
      where: { id: content.id },
    }),
  ).toBeFalsy();
});

test('should fail if user does not own content', async () => {
  const user = await global.config.utils.createUser();
  const requestor = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = await global.config.db.treeDataCareObtainingSeedsContent.create({
    data: {
      user: {
        connect: {
          id: user.user.id,
        },
      },
      treeData: {
        connect: {
          id: treeData.id,
        },
      },
      content: 'Content',
    },
  });

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          id: content.id,
        },
      },
      { authorization: `Bearer ${requestor.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Unauthorized');
  }
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
