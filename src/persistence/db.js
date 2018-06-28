const mongoose = require('mongoose');
import { getLogger } from 'log4js';

const logger = getLogger('Database');

const { DB_URL, DB_USER, DB_PASSWORD } = process.env;

mongoose.set('debug', logger.debug.bind(logger, 'EXEC'));

let connection;

export const initDb = async () => {
  if (!connection) {
    logger.info('CONNECTING...');
    connection = await mongoose.connect(
      `mongodb://musicbot:musicbot123@ds219191.mlab.com:19191/musiclackey`
    );
    logger.info('CONNECTION OK');
  }
  return connection;
};
