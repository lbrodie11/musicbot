import { getLogger } from 'log4js';

const mongoose = require('mongoose');
const logger = getLogger('Database');
const { DB_URL, DB_USER, DB_PASSWORD } = process.env;

mongoose.set('debug', logger.debug.bind(logger, 'EXEC'));

let connection;

export const initDb = async () => {
  if (!connection) {
    logger.info('CONNECTING...');
    connection = await mongoose.connect(
      `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URL}`, { useNewUrlParser: true }
    );
    logger.info('CONNECTION OK');
  }
  return connection;
};
