import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { ReadNotificationInput } from '../../src/resolvers/mutation/readNotification';
import { NotificationProfile } from '../../src/types/NotificationProfile';

const query = gql`
  mutation readNotification($data: ReadNotificationInput!) {
    readNotification(data: $data) {
      id
      receiver {
        id
      }
      sender {
        id
      }
      readDate
    }
  }
`;

type Response = { readNotification: NotificationProfile };
type Variables = { data: ReadNotificationInput };

test('should read notification', async () => {
  const receiver = await global.config.utils.createUser();
  const sender = await global.config.utils.createUser();

  // Create notification
  const { id } = await global.config.db.notification.create({
    data: {
      type: 'PASSWORD_CHANGED',
      onOpenType: 'SOME_TYPE_TO_OPEN',
      message: TestUtils.randomString(),
      receiver: {
        connect: {
          id: receiver.user.id,
        },
      },
      sender: {
        connect: {
          id: sender.user.id,
        },
      },
      readDate: null,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    { data: { id } },
    { authorization: `Bearer ${receiver.token}` },
  );

  expect(data?.readNotification.readDate).toBeTruthy();
});

test('should unRead notification', async () => {
  const receiver = await global.config.utils.createUser();
  const sender = await global.config.utils.createUser();

  // Create notification
  const { id } = await global.config.db.notification.create({
    data: {
      type: 'PASSWORD_CHANGED',
      onOpenType: 'SOME_TYPE_TO_OPEN',
      message: TestUtils.randomString(),
      receiver: {
        connect: {
          id: receiver.user.id,
        },
      },
      sender: {
        connect: {
          id: sender.user.id,
        },
      },
      readDate: new Date(),
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    { data: { id, unRead: true } },
    { authorization: `Bearer ${receiver.token}` },
  );

  expect(data?.readNotification.readDate).toBeFalsy();
});

test('should fail to read notification that requestor is not a receiver of', async () => {
  const receiver = await global.config.utils.createUser();
  const sender = await global.config.utils.createUser();

  // Create notification
  const { id } = await global.config.db.notification.create({
    data: {
      type: 'PASSWORD_CHANGED',
      onOpenType: 'SOME_TYPE_TO_OPEN',
      message: TestUtils.randomString(),
      receiver: {
        connect: {
          id: receiver.user.id,
        },
      },
      sender: {
        connect: {
          id: sender.user.id,
        },
      },
      readDate: null,
    },
  });

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      { data: { id } },
      { authorization: `Bearer ${sender.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});

test('should fail to read notification that does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      { data: { id: '' } },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});
