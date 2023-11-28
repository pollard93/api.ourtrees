/* eslint-disable import/prefer-default-export */
import { Client } from 'onesignal-node';

export const OneSignalClient = () =>
  new Client({
    userAuthKey: process.env.OS_USER_AUTH_KEY,
    // note that "app" must have "appAuthKey" and "appId" keys
    app: { appAuthKey: process.env.OS_APP_AUTH_KEY, appId: process.env.OS_APP_ID },
  });
