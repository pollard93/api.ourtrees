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

  const { data: { updateSelf } } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        name,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(updateSelf.name).toEqual(name);
});


test('should succeed without data', async () => {
  const user = await global.config.utils.createUser();

  const { data: { updateSelf } } = await global.config.client.rawRequest<Response, Variables>(
    query,
    { data: {} },
    { authorization: `Bearer ${user.token}` },
  );

  expect(updateSelf.name).toEqual(user.user.name);
});


test('should succeed updating profile picture', async () => {
  const user = await global.config.utils.createUser();

  const { data: { updateSelf } } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {
      data: {
        profilePicture: createReadStream(path.join(__dirname, '/../support/files/test.image.jpeg')) as any,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  // Test resolvers
  expect(updateSelf.profilePicture.mime).toEqual('image/jpeg');
  expect(updateSelf.profilePicture.url.full).toEqual(`${FileHandler.config.siteUrl}/public/users/${user.user.id}/profile-picture.jpeg`);

  const { updateSelf: updateSelfAfter } = await global.config.client.request<Response, Variables>(
    query,
    {
      data: {
        profilePicture: createReadStream(path.join(__dirname, '/../support/files/test.image.jpeg')) as any,
      },
    },
    { authorization: `Bearer ${user.token}` },
  );

  expect(updateSelf.profilePicture.id).toEqual(updateSelfAfter.profilePicture.id);
});
