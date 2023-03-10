import { gql } from 'graphql-request';
import '../../global-variables';
import { TreeDataProfile } from '../../src/types/TreeDataProfile';
import { UpsertTreeDataCareGerminationNotesVoteInput } from '../../src/resolvers/mutation/upsertTreeDataCareGerminationNotesVote';
import TestUtils from '../utils';


const query = gql`
  mutation upsertTreeDataCareGerminationNotesVote($data: UpsertTreeDataCareGerminationNotesVoteInput!){
    upsertTreeDataCareGerminationNotesVote(data: $data) {
      id
      careGerminationNotesResult {
        content {
          id
          content
          voteCount
        }     
      }
    }
  }
`;

type Response = { upsertTreeDataCareGerminationNotesVote: TreeDataProfile };
type Variables = { data: UpsertTreeDataCareGerminationNotesVoteInput };


test('should create result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const content = await global.config.db.treeDataCareGerminationNotesContent.create({
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
      content: 'Content',
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        contentId: content.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareGerminationNotesVote?.careGerminationNotesResult?.content?.id).toBe(content.id);
});


test('should upsert result', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();

  /**
   * User votes for one content
   */
  const content1 = await global.config.db.treeDataCareGerminationNotesContent.create({
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
      content: 'Content 1',
    },
  });

  await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        contentId: content1.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );


  /**
   * Same user votes for another
   */
  const content2 = await global.config.db.treeDataCareGerminationNotesContent.create({
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
      content: 'Content 2',
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        contentId: content2.id,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.upsertTreeDataCareGerminationNotesVote?.careGerminationNotesResult?.content?.id).toBe(content2.id);
});


test('should fail if content does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      {
        data: {
          contentId: TestUtils.randomString(),
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
