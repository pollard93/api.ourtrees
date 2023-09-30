import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { GetNotificationsInput, NotificationProfilesPayLoad } from '../../src/resolvers/query/getNotifications';


const query = gql`
  query getNotifications($data: GetNotificationsInput){
    getNotifications(data: $data){
      notifications {
        receiver {
          id
        }
        sender {
          id
        }
      }
      count
    }
  }
`;

type Response = { getNotifications: NotificationProfilesPayLoad };
type Variables = { data?: GetNotificationsInput };


test('should succeed', async () => {
  const receiver = await global.config.utils.createUser();
  const sender = await global.config.utils.createUser();

  // Create 2 notifications, one should be received the other should not
  // Should receive
  await global.config.db.notification.create({
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

  // Should not receive
  await global.config.db.notification.create({
    data: {
      type: 'PASSWORD_CHANGED',
      onOpenType: 'SOME_TYPE_TO_OPEN',
      message: TestUtils.randomString(),
      receiver: {
        connect: {
          id: sender.user.id,
        },
      },
      sender: {
        connect: {
          id: receiver.user.id,
        },
      },
      readDate: null,
    },
  });

  const { data } = await global.config.client.rawRequest<Response, Variables>(
    query,
    {},
    { authorization: `Bearer ${receiver.token}` },
  );

  // Test response
  expect(data?.getNotifications.notifications.length).toEqual(1);
  expect(data?.getNotifications.count).toEqual(1);

  // Test resolver
  expect(data?.getNotifications.notifications[0].receiver.id).toEqual(receiver.user.id);
  expect(data?.getNotifications.notifications[0].sender.id).toEqual(sender.user.id);
});
