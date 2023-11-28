/* eslint-disable no-console */
import { httpServer, startApolloServer } from './app';

startApolloServer().then(() => {
  httpServer.listen({ port: process.env.PORT }, () =>
    console.log(`
    Server is running on ${process.env.SITE_URL}
    env:${process.env.NODE_ENV}
  `),
  );
});
