import { gql } from 'graphql-request';
import '../../global-variables';
import TestUtils from '../utils';
import { DeleteNotificationInput } from '../../src/resolvers/mutation/deleteNotification';


const query = gql`
  mutation deleteNotification($data: DeleteNotificationInput!){
    deleteNotification(data: $data)
  }
`;

type Response = { deleteNotification: boolean };
type Variables = { data: DeleteNotificationInput };


test('should succeed', async () => {
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

  expect(data?.deleteNotification).toBeTruthy();

  // Check notification has been deleted
  const after = await global.config.db.notification.findUnique({ where: { id } });
  expect(after).toBeFalsy();
});


test('should fail to delete notification that requestor is not a receiver of', async () => {
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
      readDate: new Date().toISOString(),
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
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});


test('should fail to delete notification that does not exist', async () => {
  const user = await global.config.utils.createUser();

  try {
    await global.config.client.rawRequest<Response, Variables>(
      query,
      { data: { id: '' } },
      { authorization: `Bearer ${user.token}` },
    );
    throw new Error();
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(error.response.errors[0].message).toEqual('Unauthorised');
  }
});
