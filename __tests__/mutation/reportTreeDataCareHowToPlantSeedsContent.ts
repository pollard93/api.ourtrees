import { gql } from 'graphql-request';
import '../../global-variables';
import { ReportTreeDataCareHowToPlantSeedsContentInput } from '../../src/resolvers/mutation/reportTreeDataCareHowToPlantSeedsContent';
import TestUtils from '../utils';

const query = gql`
  mutation reportTreeDataCareHowToPlantSeedsContent(
    $data: ReportTreeDataCareHowToPlantSeedsContentInput!
  ) {
    reportTreeDataCareHowToPlantSeedsContent(data: $data)
  }
`;

type Response = { reportTreeDataCareHowToPlantSeedsContent: boolean };
type Variables = { data: ReportTreeDataCareHowToPlantSeedsContentInput };

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

  expect(data?.reportTreeDataCareHowToPlantSeedsContent).toBeTruthy();
  expect(
    (
      await global.config.db.treeDataCareHowToPlantSeedsContent.findUnique({
        where: { id: content.id },
      })
    )?.reportedAt,
  ).toBeTruthy();
});

test('should remove content from top voted result', async () => {
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

  /**
   * Vote for content
   */
  await global.config.client.rawRequest(
    gql`
      mutation upsertTreeDataCareHowToPlantSeedsVote(
        $data: UpsertTreeDataCareHowToPlantSeedsVoteInput!
      ) {
        upsertTreeDataCareHowToPlantSeedsVote(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        contentId: content.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test is top voted
   */
  const treeDataBefore = await global.config.db.treeData.findUnique({
    where: {
      id: treeData.id,
    },
    include: {
      careHowToPlantSeedsResult: true,
    },
  });
  expect(treeDataBefore?.careHowToPlantSeedsResult.treeDataCareHowToPlantSeedsContentId).toEqual(
    content.id,
  );

  /**
   * Make request
   */
  await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        id: content.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test is not top voted
   */
  const treeDataAfter = await global.config.db.treeData.findUnique({
    where: {
      id: treeData.id,
    },
    include: {
      careHowToPlantSeedsResult: true,
    },
  });
  expect(treeDataAfter?.careHowToPlantSeedsResult.treeDataCareHowToPlantSeedsContentId).toEqual(
    null,
  );
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
