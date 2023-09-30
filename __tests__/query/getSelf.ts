import { gql } from 'graphql-request';
import '../../global-variables';
import { UserSelf } from '../../src/types/UserSelf';
import TestUtils from '../utils';


const query = gql`
  query getSelf {
    getSelf {
      id
      email
      profilePicture {
        id
        mime
        url {
          splash
          small
          large
          full
        }
        author {
          id
        }
      }
      unreadNotificationCount
      requiresUpdate {
        appStoreUrl
        playStoreUrl
      }
    }
  }
`;

type Response = { getSelf: UserSelf };
type Variables = undefined;


test('should suceed, tests profilePicture', async () => {
  const user = await global.config.utils.createUser();
  const file = await global.config.db.file.create({
    data: {
      path: 'path',
      mime: 'mime',
      author: {
        connect: {
          id: user.user.id,
        },
      },
      userProfilePictures: {
        connect: [{
          id: user.user.id,
        }],
      },
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    undefined,
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getSelf.profilePicture.id).toEqual(file.id);
  expect(data?.getSelf.profilePicture.mime).toEqual(file.mime);
  expect(data?.getSelf.profilePicture.url.full).toBeTruthy();
  expect(data?.getSelf?.profilePicture?.author?.id).toEqual(user.user.id);
});


test('should suceed, tests unreadNotificationCount', async () => {
  const user = await global.config.utils.createUser();

  // Create 2 notifications, one read one not
  await global.config.db.notification.create({
    data: {
      type: 'PASSWORD_CHANGED',
      onOpenType: 'SOME_TYPE_TO_OPEN',
      message: TestUtils.randomString(),
      receiver: {
        connect: {
          id: user.user.id,
        },
      },
      sender: {
        connect: {
          id: user.user.id,
        },
      },
      readDate: new Date(),
    },
  });

  await global.config.db.notification.create({
    data: {
      type: 'PASSWORD_CHANGED',
      onOpenType: 'SOME_TYPE_TO_OPEN',
      message: TestUtils.randomString(),
      receiver: {
        connect: {
          id: user.user.id,
        },
      },
      sender: {
        connect: {
          id: user.user.id,
        },
      },
      readDate: null,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    undefined,
    { authorization: `Bearer ${user.token}` },
  );

  expect(data?.getSelf.id).toEqual(user.user.id);
  expect(data?.getSelf.email).toEqual(user.user.email);
  expect(data?.getSelf.unreadNotificationCount).toEqual(1);
});


test('should succeed, tests requiresUpdate', async () => {
  const user = await global.config.utils.createUser();
  {
  /**
   * requiresUpdate should be null if no client-version header is not sent
   */
    const { data } = await global.config.client.rawRequest<Response, Variables>(
      query,
      undefined,
      { authorization: `Bearer ${user.token}` },
    );

    expect(data?.getSelf.requiresUpdate).toEqual(null);
  }
  {
  /**
   * requiresUpdate should return correct urls if client-version is sent
   */
    const { data } = await global.config.client.rawRequest<Response, Variables>(
      query,
      undefined,
      {
        authorization: `Bearer ${user.token}`,
        'client-version': '0.0.0',
      },
    );

    expect(data?.getSelf.requiresUpdate.appStoreUrl).toEqual(process.env.APP_STORE_URL);
    expect(data?.getSelf.requiresUpdate.playStoreUrl).toEqual(process.env.PLAY_STORE_URL);
  }
});
