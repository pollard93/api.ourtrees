/* eslint-disable no-console */
import { app } from './app';

app.listen({ port: process.env.PORT }, () => console.log(`
  Server is running on ${process.env.SITE_URL}
  env:${process.env.NODE_ENV}
`));
