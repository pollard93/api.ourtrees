import { createReadStream } from 'fs-extra';
import path from 'path';
import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { FileHandler } from '../../src/modules/FileHandler';
import { UpdateSelfInput } from '../../src/resolvers/mutation/updateSelf';
import { UserSelf } from '../../src/types/UserSelf';


const query = gql`
  mutation updateSelf($data: UpdateSelfInput!){
    updateSelf(data: $data){
      name
      countryName
      profilePicture {
        id
        mime
        url {
          full
        }
      }
    }
  }
`;

type Response = { updateSelf: UserSelf };
type Variables = { data: UpdateSelfInput };


test('should succeed with data', async () => {
  const user = await global.config.utils.createUser();
  const name = TestUtils.randomString();
  const countryName = TestUtils.randomString();
  await global.config.db.country.create({
    data: {
      name: countryName,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        name,
        countryName,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateSelf.name).toEqual(name);
  expect(data?.updateSelf.countryName).toEqual(countryName);
});


test('should succeed without data', async () => {
  const user = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    { data: {} },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateSelf.name).toEqual(user.user.name);
});


test('should succeed updating profile picture', async () => {
  const user = await global.config.utils.createUser();

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        profilePicture: createReadStream(path.join(__dirname, '/../support/files/test.image.jpeg')) as any,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test resolvers
  expect(data?.updateSelf.profilePicture.mime).toEqual('image/jpeg');
  expect(data?.updateSelf.profilePicture.url.full).toEqual(`${FileHandler.config.siteUrl}/public/users/${user.user.id}/profile-picture.jpeg`);

  const { updateSelf: updateSelfAfter } = await global.config.client.request<Response, Variables>(
    query,
    {
      data: {
        profilePicture: createReadStream(path.join(__dirname, '/../support/files/test.image.jpeg')) as any,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.updateSelf.profilePicture.id).toEqual(updateSelfAfter.profilePicture.id);
});
