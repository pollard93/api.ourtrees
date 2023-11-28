import { gql } from 'graphql-request';
import '../../global-variables';
import { DeleteTreeDataCareHowToPlantSeedsContentInput } from '../../src/resolvers/mutation/deleteTreeDataHowToPlantSeedsContent';
import TestUtils from '../utils';

const query = gql`
  mutation deleteTreeDataCareHowToPlantSeedsContent(
    $data: DeleteTreeDataCareHowToPlantSeedsContentInput!
  ) {
    deleteTreeDataCareHowToPlantSeedsContent(data: $data)
  }
`;

type Response = { deleteTreeDataCareHowToPlantSeedsContent: boolean };
type Variables = { data: DeleteTreeDataCareHowToPlantSeedsContentInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = await global.config.db.treeDataCareHowToPlantSeedsContent.create({
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

  expect(data?.deleteTreeDataCareHowToPlantSeedsContent).toBeTruthy();
  expect(
    await global.config.db.treeDataCareHowToPlantSeedsContent.findUnique({
      where: { id: content.id },
    }),
  ).toBeFalsy();
});

test('should fail if user does not own content', async () => {
  const user = await global.config.utils.createUser();
  const requestor = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = await global.config.db.treeDataCareHowToPlantSeedsContent.create({
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
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
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
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Resource does not exist');
  }
});
