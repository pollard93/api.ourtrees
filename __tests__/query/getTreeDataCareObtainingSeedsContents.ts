import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import {
  GetTreeDataCareObtainingSeedsContentsInput,
  TreeDataCareObtainingSeedsContentProfilesPayLoad,
} from '../../src/resolvers/query/getTreeDataCareObtainingSeedsContents';

const query = gql`
  query getTreeDataCareObtainingSeedsContents($data: GetTreeDataCareObtainingSeedsContentsInput!) {
    getTreeDataCareObtainingSeedsContents(data: $data) {
      notes {
        id
      }
      count
    }
  }
`;

type Response = {
  getTreeDataCareObtainingSeedsContents: TreeDataCareObtainingSeedsContentProfilesPayLoad;
};
type Variables = { data?: GetTreeDataCareObtainingSeedsContentsInput };

test('should succeed', async () => {
  /**
   * Create user and tree
   */
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  /**
   * Create tree notes
   */
  const notes1 = await global.config.db.treeDataCareObtainingSeedsContent.create({
    data: {
      user: {
        connect: {
          id: (await global.config.utils.createUser()).user.id,
        },
      },
      treeData: {
        connect: {
          id: treeData.id,
        },
      },
      content: TestUtils.randomString(),
    },
  });
  const notes2 = await global.config.db.treeDataCareObtainingSeedsContent.create({
    data: {
      user: {
        connect: {
          id: (await global.config.utils.createUser()).user.id,
        },
      },
      treeData: {
        connect: {
          id: treeData.id,
        },
      },
      content: TestUtils.randomString(),
    },
  });

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        take: 2,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getTreeDataCareObtainingSeedsContents.notes.length).toEqual(2);
  expect(data.data?.getTreeDataCareObtainingSeedsContents.count).toEqual(2);
  expect(
    data.data?.getTreeDataCareObtainingSeedsContents.notes.find((e) => e.id === notes1.id),
  ).toBeTruthy();
  expect(
    data.data?.getTreeDataCareObtainingSeedsContents.notes.find((e) => e.id === notes2.id),
  ).toBeTruthy();
});

test('should not return reported', async () => {
  /**
   * Create user and tree
   */
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  /**
   * Create tree notes
   */
  await global.config.db.treeDataCareObtainingSeedsContent.create({
    data: {
      reportedAt: new Date(),
      user: {
        connect: {
          id: (await global.config.utils.createUser()).user.id,
        },
      },
      treeData: {
        connect: {
          id: treeData.id,
        },
      },
      content: TestUtils.randomString(),
    },
  });

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        treeDataId: treeData.id,
        take: 2,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getTreeDataCareObtainingSeedsContents.notes.length).toEqual(0);
  expect(data.data?.getTreeDataCareObtainingSeedsContents.count).toEqual(0);
});

test('should fail if tree data does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          treeDataId: 0,
          take: 2,
        },
      },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Tree data does not exist');
  }
});
