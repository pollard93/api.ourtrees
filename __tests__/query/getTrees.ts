import { gql } from 'graphql-request';
import '../../global-variables';
import { GetTreesInput, TreeProfilesPayLoad } from '../../src/resolvers/query/getTrees';


const query = gql`
  query getTrees($data: GetTreesInput!){
    getTrees(data: $data){
      trees {
        id
      }
      count
    }
  }
`;

type Response = { getTrees: TreeProfilesPayLoad };
type Variables = { data: GetTreesInput };


test('should succeed with creator', async () => {
  const user = await global.config.utils.createUser();
  const tree = await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        where: {
          creatorId: user.user.id,
        },
        take: 10,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test response
  expect(data?.getTrees.trees.length).toEqual(1);
  expect(data?.getTrees.trees[0].id).toEqual(tree.id);
  expect(data?.getTrees.count).toEqual(1);
});


test('should succeed with treeData', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const tree = await global.config.utils.createTree({
    treeData: {
      connect: {
        id: treeData.id,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        where: {
          treeDataId: treeData.id,
        },
        take: 10,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test response
  expect(data?.getTrees.trees.length).toEqual(1);
  expect(data?.getTrees.trees[0].id).toEqual(tree.id);
  expect(data?.getTrees.count).toEqual(1);
});


test('should succeed with both', async () => {
  const user = await global.config.utils.createUser();
  const treeData = await global.config.utils.createTreeData();
  const tree = await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
    treeData: {
      connect: {
        id: treeData.id,
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        where: {
          creatorId: user.user.id,
          treeDataId: treeData.id,
        },
        take: 10,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test response
  expect(data?.getTrees.trees.length).toEqual(1);
  expect(data?.getTrees.trees[0].id).toEqual(tree.id);
  expect(data?.getTrees.count).toEqual(1);
});
