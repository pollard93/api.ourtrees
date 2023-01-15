import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { GetTreeDatasInput, TreeDataProfilesPayLoad } from '../../src/resolvers/query/getTreeDatas';


const query = gql`
  query getTreeDatas($data: GetTreeDatasInput!){
    getTreeDatas(data: $data){
      treeDatas {
        id
        taxon
        family
      }
      count
    }
  }
`;

type Response = { getTreeDatas: TreeDataProfilesPayLoad };
type Variables = { data: GetTreeDatasInput };


test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const countryName = await global.config.utils.createCountry();

  // Create 2 treeDatas, one should be received the other should not
  // Should receive
  await global.config.db.treeData.create({
    data: {
      id: TestUtils.getRandomInt(10000),
      taxon: TestUtils.randomString(),
      author: TestUtils.randomString(),
      family: TestUtils.randomString(),
      countries: {
        connect: {
          name: countryName,
        },
      },
    },
  });

  // Should not receive
  await global.config.db.treeData.create({
    data: {
      id: TestUtils.getRandomInt(10000),
      taxon: TestUtils.randomString(),
      author: TestUtils.randomString(),
      family: TestUtils.randomString(),
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        where: {
          countryName,
        },
        take: 10,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test response
  expect(data?.getTreeDatas.treeDatas.length).toEqual(1);
  expect(data?.getTreeDatas.count).toEqual(1);
});


test('should succeed to search taxon', async () => {
  const user = await global.config.utils.createUser();
  const countryName = await global.config.utils.createCountry();
  const nameSearch = TestUtils.randomString();

  // Create 2 treeDatas, one should be received the other should not
  // Should receive
  await global.config.db.treeData.create({
    data: {
      id: TestUtils.getRandomInt(10000),
      taxon: `${nameSearch}${TestUtils.randomString()}`,
      author: TestUtils.randomString(),
      family: TestUtils.randomString(),
      countries: {
        connect: {
          name: countryName,
        },
      },
    },
  });

  // Should not receive
  await global.config.db.treeData.create({
    data: {
      id: TestUtils.getRandomInt(10000),
      taxon: TestUtils.randomString(),
      author: TestUtils.randomString(),
      family: TestUtils.randomString(),
      countries: {
        connect: {
          name: countryName,
        },
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        where: {
          countryName,
          nameSearch,
        },
        take: 10,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test response
  expect(data?.getTreeDatas.treeDatas.length).toEqual(1);
  expect(data?.getTreeDatas.count).toEqual(1);
});


test('should succeed to search family', async () => {
  const user = await global.config.utils.createUser();
  const countryName = await global.config.utils.createCountry();
  const nameSearch = TestUtils.randomString();

  // Create 2 treeDatas, one should be received the other should not
  // Should receive
  await global.config.db.treeData.create({
    data: {
      id: TestUtils.getRandomInt(10000),
      taxon: TestUtils.randomString(),
      author: TestUtils.randomString(),
      family: `${nameSearch}${TestUtils.randomString()}`,
      countries: {
        connect: {
          name: countryName,
        },
      },
    },
  });

  // Should not receive
  await global.config.db.treeData.create({
    data: {
      id: TestUtils.getRandomInt(10000),
      taxon: TestUtils.randomString(),
      author: TestUtils.randomString(),
      family: TestUtils.randomString(),
      countries: {
        connect: {
          name: countryName,
        },
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        where: {
          countryName,
          nameSearch,
        },
        take: 10,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test response
  expect(data?.getTreeDatas.treeDatas.length).toEqual(1);
  expect(data?.getTreeDatas.count).toEqual(1);
});
