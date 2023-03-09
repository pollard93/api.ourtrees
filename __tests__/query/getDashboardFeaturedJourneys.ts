import { gql } from 'graphql-request';
import '../../global-variables';
import { GetDashboardFeaturedJourneysPayload } from '../../src/resolvers/query/getDashboardFeaturedJourneys';


const query = gql`
  query getDashboardFeaturedJourneys {
    getDashboardFeaturedJourneys {
      treeDataId
      creatorId
      followerId
      countryName
    }
  }
`;

type Response = { getDashboardFeaturedJourneys: GetDashboardFeaturedJourneysPayload };
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
  expect(data.data?.getDashboardFeaturedJourneys).toEqual({
    countryName: null,
    creatorId: null,
    followerId: null,
    treeDataId: null,
  });
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
  expect(data.data?.getDashboardFeaturedJourneys).toEqual({
    countryName,
    creatorId: null,
    followerId: null,
    treeDataId: null,
  });
});
