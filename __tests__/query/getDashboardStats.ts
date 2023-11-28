import { gql } from 'graphql-request';
import '../../global-variables';
import { DashboardStatsProfilesPayLoad } from '../../src/resolvers/query/getDashboardStats';

const query = gql`
  query getDashboardStats {
    getDashboardStats {
      items {
        header
        content
      }
    }
  }
`;

type Response = { getDashboardStats: DashboardStatsProfilesPayLoad };
type Variables = { data?: undefined };

test('should succeed', async () => {
  /**
   * Create user
   */
  const user = await global.config.utils.createUser({
    country: undefined,
  });

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {},
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getDashboardStats.items.length).toEqual(1);
  expect(data.data?.getDashboardStats.items[0].header).toBeTruthy();
  expect(data.data?.getDashboardStats.items[0].content).toEqual('Trees Planted');
});

test('should succeed with country', async () => {
  /**
   * Create country, user and tree
   */
  const countryName = await global.config.utils.createCountry();
  const user = await global.config.utils.createUser({
    country: {
      connect: {
        name: countryName,
      },
    },
  });
  await global.config.utils.createTree({
    creator: {
      connect: {
        id: user.user.id,
      },
    },
  });

  /**
   * Get
   */
  const data = await global.config.client.rawRequest<Response, Variables>(
    query,
    {},
    { authorization: `Bearer ${user.token}` },
  );

  /**
   * Test
   */
  expect(data.data?.getDashboardStats.items.length).toEqual(2);
  expect(data.data?.getDashboardStats.items[1].header).toEqual('1');
  expect(data.data?.getDashboardStats.items[1].content).toEqual('Trees Planted in the UK');
});
