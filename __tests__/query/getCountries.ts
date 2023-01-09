import { Country } from '@prisma/client';
import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';


const query = gql`
  query getCountries {
    getCountries {
      countries {
        name
      }
    }
  }
`;

type Response = { getCountries: { countries: Country[] } };
type Variables = undefined;


test('should suceed, tests profilePicture', async () => {
  const country = TestUtils.randomString();
  await global.config.db.country.create({
    data: {
      name: country,
    },
  });

  const user = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    undefined,
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getCountries.countries.find(({ name }) => name === country)).toBeTruthy();
});
