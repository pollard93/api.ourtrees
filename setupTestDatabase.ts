/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import util from 'util';
import mysql from 'mysql';
import dotenv from 'dotenv';
import child_process from 'child_process';

const exec = util.promisify(child_process.exec);

dotenv.config();


export default async () => {
  /**
   * Replace env for test database
   */
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL_WRITE = process.env.DATABASE_URL_WRITE!.replace(/development|production/g, 'test');
  process.env.DATABASE_URL_READ = process.env.DATABASE_URL_READ!.replace(/development|production/g, 'test');


  /**
   * Delete db
   */
  const deleteDatabase = () => new Promise((res, rej) => {
    const con = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    });

    con.connect((err) => {
      if (err) rej(err);
      con.query(`DROP DATABASE \`${global.process.env.DATABASE_URL_WRITE!.split('/').pop()}\``, (error, results) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          res(null);
        }

        res(results);
      });
    });
  });


  /**
   * If the command was `test:unit:reset` try and reset the db
   */
  const command = JSON.parse(process.env.npm_config_argv!).original[0];
  if (command === 'test:unit:reset') {
    await exec('NODE_ENV=test yarn dev:ensure:bucket');
    await deleteDatabase();
  }


  /**
   * Always push db
   */
  await exec('yarn prisma db push');


  /**
   * If the command was `test:unit:reset` seed the db
   */
  if (command === 'test:unit:reset') {
    // await exec('yarn seed:test');
  }
};
