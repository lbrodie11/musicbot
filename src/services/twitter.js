import { getLogger } from 'log4js';

import {
  getTweets,
  deleteTweet,
} from '../api/twitter';

import {
  newReleases
} from '../api/spotify'

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

export const tweetNewAlbumReleases = async () => {
  logger.info('Preparing tweet for new album releases:');
  const status = await buildTweetStatus();
  logger.info('Posting tweet for a new release');
  console.log(status);
};

const buildTweetStatus = async () => {
  // const { date, artist, albumName, spotifyLink} = project;
  return `
🔥 New Album Releases 🚀

#releases #albums #musiclackey
`;
};

// ${releaseDate}

// ${artistName}
// ${albumName}
// ${spotifyUrl}