import { getLogger } from 'log4js';
import { log } from 'util';
import {
  getTweets,
  deleteTweet,
  tweet
} from '../api/twitter';

// import {
//   getFollowedArtists,
//   setAccessToken,
//   getUser,
//   getSpotifyToken,
//   getArtistAlbums
// } from '../api/spotify'

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

// export async function tweetNewAlbumReleases() {
//   logger.info('Setting Access Token')
//   // const spotifyAPIToken = await getSpotifyAPIToken()
//   // console.log(spotifyAPIToken);
//   await setAccessToken(process.env.CODE);
//   logger.info('Access Token Set')
//   return await getFollowedArtists()
//     .then(async function (data) {
//       logger.info('I am following ', data.body.artists.total, ' artists!');
//       var objArray = await data.body.artists.items;
//       var artistIds = await objArray.map(a => a.id);
//       return artistIds;
//     }, function (err) {
//       logger.info(`Get Followed Artists has an issue!....Message: ${err.message}, Status: ${err.statusCode}`);
//     }).then(async function (artistIds) {
//       logger.info('Get Artist albums initialized')
//       var newRelease = [];
//       for (var i = 0; i < artistIds.length; i++) {
//         var artistAlbum = await getArtistAlbums(artistIds[i]);
//         var date = await artistAlbum.body.items[0].release_date;
//         var releaseDate = new Date(date);
//         var currentDate = new Date();
//         var testDate = new Date('2018-06-9');
//         if (releaseDate >= testDate) {
//           newRelease.push(artistAlbum);
//         }
//       }
//       return await newRelease;
//     }, function (err) {
//       console.log(err)
//       logger.info(`Get Artist Albums has an issue!....Message: ${err.message}, Status: ${err.statusCode}`);
//     }).then(function (newRelease) {

//       newRelease.forEach((element, index, array) => {
//         setTimeout(function () {
//           var albumInfo = {
//             albumName: element.body.items[0].name,
//             releaseDate: element.body.items[0].release_date,
//             artistName: element.body.items[0].artists[0].name,
//             spotifyUrl: element.body.items[0].artists[0].external_urls.spotify
//           }
//           var currentDate = new Date();
//           logger.info('Preparing tweet for new album releases for: ' + currentDate);
//           logger.info(albumInfo);
//           // console.log(albumInfo);
//           const status = buildTweetStatus(albumInfo);
//           logger.info('Posting tweet for a new release');
//           logger.info(status);
//           // console.log(status);
//           tweet(status);
//           function buildTweetStatus(albumInfo) {
//             const { releaseDate, artistName, albumName, spotifyUrl } = albumInfo;
//             return `
//       🎵 New Album Releases 🔥 

//       📅 ${releaseDate}

//       🎙️ Artist: ${artistName}

//       💿 Album: ${albumName}

//       🔗 ${spotifyUrl}
//         #music #album #musiclackey #${artistName.replace(/ /g, '')}
//         `;
//           };
//         }, index * 10000);
//       });
//     }, function (err) {
//       console.log(err)
//       logger.info(`Posting tweet has an issue!....Message: ${err.message}, Status: ${err.statusCode}`);
//     })
//     .catch(function (err) {
//       logger.info(`Something went wrong with accessing the token!....Message: ${err.message}, Status: ${err.statusCode}`);
//       return;
//     });
// }

export const tweetNewAlbumReleases = async (albumInfo) => {
  var currentDate = new Date();
  logger.info('Preparing tweet for latest album releases for: ' + currentDate);
  const status = await buildTweetStatus(albumInfo);
  logger.info('Posting tweet for a new release');
  logger.info(status);
  // await console.log(status);
  // await tweet(status);
}

const buildTweetStatus = async (albumInfo) => {
  const { releaseDate, artistName, albumName, spotifyUrl } = albumInfo;
  return `
    🎵 New Album Releases 🔥 
  
    📅 ${releaseDate}
  
    🎙️ Artist: ${artistName}
  
    💿 Album: ${albumName}
  
    🔗 ${spotifyUrl}
      #music #album #musiclackey #${artistName.replace(/ /g, '')}
      `;
};
