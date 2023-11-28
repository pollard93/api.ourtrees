/* eslint-disable import/no-extraneous-dependencies */
import * as http from 'http';
import sinon, { SinonStub } from 'sinon';
import { PrismaClient } from '@prisma/client';
import { GraphQLClient } from 'graphql-request';
import crossFetch from 'cross-fetch';
import { httpServer, db, startApolloServer, apolloServer } from './src/app';
import NotificationEmitter from './src/events/notification/NotificationEmitter';
import EmailEmitter from './src/events/email/EmailEmitter';
import TestUtils from './__tests__/utils';
import './global-variables';
import { InitFileHandler } from './src/modules/FileHandler';

export type Config = {
  server: http.Server;
  db: PrismaClient;
  utils: TestUtils;
  client: GraphQLClient;
  baseUrl: string;
  notificationEventsStubs: {
    emitDBNotification: SinonStub;
    emitPushNotification: SinonStub;
    emitNotification: SinonStub;
  };
  emailEventsStubs: {
    emitRawEmail: SinonStub;
    emitTransactionalEmail: SinonStub;
    emitInternalEmail: SinonStub;
  };
};

jest.setTimeout(10000);

beforeAll(async () => {
  /**
   * Setup server on 0 (find empty port)
   */
  await startApolloServer();
  const server = await httpServer.listen({ port: 0 });
  // eslint-disable-next-line global-require
  const fetch = require('fetch-cookie')(crossFetch);

  /**
   * Init FileHandler
   */
  InitFileHandler();

  /**
   * Setup config
   */
  global.config = {
    server,
    db: db.write as any,
    utils: new TestUtils(db.write as any),
    client: new GraphQLClient(`http://localhost:${(server.address() as any).port}/graphql`, {
      fetch,
    }),
    baseUrl: `http://localhost:${(server.address() as any).port}`,
    notificationEventsStubs: {
      emitDBNotification: sinon.stub(NotificationEmitter.prototype, 'emitDBNotification'),
      emitPushNotification: sinon.stub(NotificationEmitter.prototype, 'emitPushNotification'),
      emitNotification: sinon.stub(NotificationEmitter.prototype, 'emitNotification'),
    },
    emailEventsStubs: {
      emitRawEmail: sinon.stub(EmailEmitter.prototype, 'emitRawEmail'),
      emitTransactionalEmail: sinon.stub(EmailEmitter.prototype, 'emitTransactionalEmail'),
      emitInternalEmail: sinon.stub(EmailEmitter.prototype, 'emitInternalEmail'),
    },
  };
});

// eslint-disable-next-line jest/no-done-callback
afterAll((done) => {
  global.config.server.close(async () => {
    await apolloServer.stop();
    await db.read.$disconnect();
    await db.write.$disconnect();
    done();
  });
});
