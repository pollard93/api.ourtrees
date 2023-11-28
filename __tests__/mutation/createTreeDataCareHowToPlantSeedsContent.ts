import { gql } from 'graphql-request';
import '../../global-variables';
import { TreeDataCareHowToPlantSeedsContentProfile } from '../../src/types/TreeDataCareHowToPlantSeedsContentProfile';
import { CreateTreeDataCareHowToPlantSeedsContentInput } from '../../src/resolvers/mutation/createTreeDataHowToPlantSeedsContent';
import TestUtils from '../utils';

const query = gql`
  mutation createTreeDataCareHowToPlantSeedsContent(
    $data: CreateTreeDataCareHowToPlantSeedsContentInput!
  ) {
    createTreeDataCareHowToPlantSeedsContent(data: $data) {
      id
      content
      voteCount
    }
  }
`;

type Response = {
  createTreeDataCareHowToPlantSeedsContent: TreeDataCareHowToPlantSeedsContentProfile;
};
type Variables = { data: CreateTreeDataCareHowToPlantSeedsContentInput };

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = TestUtils.randomString();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        content,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.createTreeDataCareHowToPlantSeedsContent.id).toBeTruthy();
  expect(data?.createTreeDataCareHowToPlantSeedsContent.content).toBe(content);
  expect(data?.createTreeDataCareHowToPlantSeedsContent.voteCount).toBe(0);
});

test('should fail if user and tree are not unique', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = TestUtils.randomString();

  await global.config.db.treeDataCareHowToPlantSeedsContent.create({
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
      content,
    },
  });

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeDataId: treeData.id,
          content,
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual(
      'User already submitted content for this tree',
    );
  }
});

test('should fail if tree does not exist', async () => {
  const user = await global.config.utils.createUser();
  const content = TestUtils.randomString();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeDataId: TestUtils.getRandomInt(10000),
          content,
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
