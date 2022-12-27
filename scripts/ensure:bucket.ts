/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
/* eslint-disable no-void */
/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { InitFileHandler, FileHandler } from '../src/modules/FileHandler';

dotenv.config();

InitFileHandler();

/**
 * Ensures that a bucket for a stage exists, will remove all objects if the bucket already exists
 */
void (async function () {
  // Remove and create bucket
  const { bucketName } = FileHandler.config;

  try {
    if (!(await FileHandler.client.bucketExists(bucketName))) {
      await FileHandler.client.makeBucket(bucketName, '');
      console.log(chalk.green(`Created bucket (${bucketName}) successfully`));
    } else {
      const objectsList = [];

      // List all object paths in bucket my-bucketname.
      const objectsStream = FileHandler.client.listObjects(bucketName, '', true);

      objectsStream.on('data', (obj) => {
        objectsList.push(obj.name);
      });

      objectsStream.on('error', (e) => {
        console.error(chalk.red(e));
      });

      objectsStream.on('end', () => {
        // eslint-disable-next-line consistent-return
        FileHandler.client.removeObjects(bucketName, objectsList, (e) => {
          if (e) {
            return console.error(chalk.red('Unable to remove Objects ', e));
          }
          console.log(chalk.green(`Cleared bucket (${bucketName}) successfully`));
        });
      });
    }
  } catch (e) {
    console.error(chalk.red(e.message));
    process.exit(0);
  }
}());
