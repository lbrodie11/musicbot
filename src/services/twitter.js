import { getLogger } from 'log4js';
import {
  getTweets,
  deleteTweet,
  tweet
} from '../api/twitter';

const logger = getLogger('Twitter Service');
const { TWITTER_USER_ID } = process.env;

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

export const tweetNewAlbumReleases = async (albumInfo) => {
  var currentDate = await new Date();
  logger.info('Preparing tweet for latest album releases for: ' + currentDate);
  const status = await buildTweetStatus(albumInfo);
  logger.info('Posting tweet for a new release');
  logger.info(status);
  await tweet(status);
};

const buildTweetStatus = (albumInfo) => {
  const { releaseDate, artistName, albumName, spotifyUrl, albumType } = albumInfo;
  logger.info(`Album Type: ${albumType}`)
  if(albumType === 'album') {
    return `
    🎵 New Album Release 🔥 
    
    📅 ${releaseDate}
    🎙️ Artist: ${artistName}
    💿 Album: ${albumName}

    🏷️ #music #spotify #album #musiclackey #${artistName.replace(/ /g, '')}

    🔗 ${spotifyUrl}
    `;
  }else {
    return `
    🎵 New Single Release 🔥 
    
    📅 ${releaseDate}
    🎙️ Artist: ${artistName}
    💿 Single: ${albumName}

    🏷️ #music #spotify #single #musiclackey #${artistName.replace(/ /g, '')}

    🔗 ${spotifyUrl}
    `;
  }

};
