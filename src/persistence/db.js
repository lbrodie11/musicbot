const mongoose = require('mongoose');
import { getLogger } from 'log4js';

const logger = getLogger('Database');

mongoose.set('debug', logger.debug.bind(logger, 'EXEC'));

let connection;

export const initDb = async () => {
  if (!connection) {
    logger.info('CONNECTING...');
    connection = await mongoose.connect(
      `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}`
    );
    logger.info('CONNECTION OK');
  }
  return connection;
};
