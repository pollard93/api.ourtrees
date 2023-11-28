import { gql } from 'graphql-request';
import '../../global-variables';
import { CountryProfilesPayload } from '../../src/resolvers/query/getCountries';

const query = gql`
  query getCountries {
    getCountries {
      countries {
        name
      }
    }
  }
`;

type Response = { getCountries: CountryProfilesPayload };
type Variables = Record<string, unknown>;

test('should succeed', async () => {
  const user = await global.config.utils.createUser();
  const country = await global.config.utils.createCountry();

  const { data } = await global.config.client.rawRequest<Response, Variables>(query, undefined, {
    authorization: `Bearer ${user.token}`,
  });

  expect(data?.getCountries.countries.find(({ name }) => name === country)).toBeTruthy();
});
