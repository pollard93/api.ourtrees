import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import { ExpressPublicProxy } from 'node-filehandler';
import cors from 'cors';
import minify from 'express-minify';
import compression from 'compression';
import mustacheExpress from 'mustache-express';
import express from 'express';
import path from 'path';
import { formatError } from 'apollo-errors';
import * as tq from 'type-graphql';
import { GraphQLScalarType } from 'graphql';
import { DateTimeResolver } from 'graphql-scalars';
import { graphqlUploadExpress } from 'graphql-upload';
import { TREE_CARE_DIFFICULTY_TYPE, TREE_CARE_GERMINATION_DIFFICULTY_TYPE, TREE_CARE_SUNLIGHT_TYPE, TREE_CARE_WATER_TYPE } from '@prisma/client';
import shareRoute from './routes/shareRoute';
import linkRoute from './routes/linkRoute';
import { InitFileHandler } from './modules/FileHandler';
import NotificationEmitter from './events/notification/NotificationEmitter';
import NotificationListener from './events/notification/NotificationListener';
import EmailEmitter from './events/email/EmailEmitter';
import EmailListener from './events/email/EmailListener';
import Prisma from './prisma';
import { SortOrder } from './resolvers/query/getNotifications';
import { SocialProvider } from './resolvers/mutation/loginWithSocial';


dotenv.config();


/**
 * Init FileHandler
 */
InitFileHandler();


/**
 * Init Prisma
 */
export const db = Prisma();


/**
 * Init event emitters and listeners
 */
export const notificationEvents = new NotificationEmitter();
new NotificationListener(db, notificationEvents); // eslint-disable-line no-new

export const emailEvents = new EmailEmitter();
new EmailListener(emailEvents); // eslint-disable-line no-new


/**
 * Register enums
 */
tq.registerEnumType(SortOrder, {
  name: 'SortOrder',
});
tq.registerEnumType(SocialProvider, {
  name: 'SocialProvider',
});
tq.registerEnumType(TREE_CARE_DIFFICULTY_TYPE, {
  name: 'TREE_CARE_DIFFICULTY_TYPE',
});
tq.registerEnumType(TREE_CARE_WATER_TYPE, {
  name: 'TREE_CARE_WATER_TYPE',
});
tq.registerEnumType(TREE_CARE_SUNLIGHT_TYPE, {
  name: 'TREE_CARE_SUNLIGHT_TYPE',
});
tq.registerEnumType(TREE_CARE_GERMINATION_DIFFICULTY_TYPE, {
  name: 'TREE_CARE_GERMINATION_DIFFICULTY_TYPE',
});


/**
 * Create server
 */
export const app = express();
export const apolloServer = new ApolloServer({
  uploads: false,
  formatError: formatError as any,
  schema: tq.buildSchemaSync({
    resolvers: [
      path.join(__dirname, '/resolvers/**/*.ts'),
    ],
    scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
  }),
  context: (c) => ({
    ...c,
    db,
    notificationEvents,
    emailEvents,
  }),
});


/**
 * Handle uploads
 */
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));


/**
 * Parse cookies
 */
app.use(cookieParser());


/**
 * Gzip and minify
 */
app.use(compression());
app.use(minify());


/**
 * Serve static files
 */
app.use(express.static(path.join(__dirname, '../public')));


/**
 * Setup mustache
 */
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, './views'));


/**
 * Views
 */
shareRoute(app);
linkRoute(app);


/**
 * Enable public s3 proxy for all paths /public/
 */
ExpressPublicProxy(app);


/**
 * Define cores for non /graphql requests
 */
app.use(cors({
  origin: [process.env.CLIENT_URL_WEB],
  credentials: true,
}));


/**
 * Expose custom headers
 */
app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Expose-Headers', 'general_token');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,general_token');
  next();
});


/**
 * Required for mobile applications
 */
apolloServer.applyMiddleware({
  app,
  cors: {
    origin: [process.env.CLIENT_URL_WEB],
    credentials: true,
  },
});
