import { getLogger } from 'log4js';

import {
  getTweets,
  deleteTweet,
} from '../api/twitter';

// import { getChangelogAsImage } from './changelog';
// import {
//   getChangelogFileUrl,
//   getChangelogFileUrlHash,
//   getChangelogReleaseUrl
// } from './url';

const { TWITTER_USER_ID } = process.env;

const logger = getLogger('Twitter Service');

export const removeAllTweets = async () => {
  try {
    logger.info('Remove all tweets');
    const tweets = await getTweets(TWITTER_USER_ID);
    await Promise.all(tweets.map(tweet => deleteTweet(tweet.id_str)));
    logger.info(`Removed ${tweets.length} tweets`);
  } catch (err) {
    logger.error('Remove all tweets failed', err);
  }
  process.exit(0);
};