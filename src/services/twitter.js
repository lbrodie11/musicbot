import { getLogger } from 'log4js';
import SpotifyWebApi from 'spotify-web-api-node';
import { log } from 'util';
import spotifyLogin from './spotifyLogin';
import {
  getTweets,
  deleteTweet,
  tweet
} from '../api/twitter';
import { ENGINE_METHOD_NONE } from 'constants';


const credentials = {
  clientId: '5e1e2cc3a0dd422eb11244d00e3bb9a1',
  clientSecret: '74b7469cf0d64223b3ccd91a86d1c10d',
  redirectUri: 'https://musiclackey.now.sh' // Your redirect uri
}

var spotifyApi = new SpotifyWebApi(credentials);

var code = process.env.CODE;

var scopes = ['user-follow-read'];
var state = 'test';

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



var tokenExpirationEpoch;

export async function tweetNewAlbumReleases() {
  console.log('Authenticating Code***************')
  console.log(process.env.CLIENT_SECRET);
  console.log(process.env.CODE);
  console.log('Authorization Url******************')
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, false);
  console.log(authorizeURL);
  return await spotifyApi.authorizationCodeGrant(code)
    .then(function (data) {
      console.log('Retrieved access token', data.body['access_token']);
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      tokenExpirationEpoch =
        new Date().getTime() / 1000 + data.body['expires_in'];
      console.log(
        'Retrieved token. It expires in ' +
        Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
        ' seconds!'
      );

      console.log("here");
      return data;
    }).then(function (data) {
      return spotifyApi.getFollowedArtists({ limit: 2, country: 'US' })
    }).then(function (artists) {
      console.log("here")
      console.log('This user is following ', artists.body.artists.total, ' artists!');
      console.log(artists.body.albums.items[0].id);

      var artistId = artists.body.albums.items[0].id;
      return artistId;

    }, function (err) {
      console.log("Get Followed Artists has an issue!", err);
    }).then(async function (artistId) {
      return await spotifyApi.getArtistAlbums(artistId, { limit: 1 });
      console.log("Artist Albums " + albums);

    }, function (err) {
      console.log("Get Artist Albums has an issue!", err);
    }).then(async function (albums) {

      var albumInfo = {

        albumName: albums.body.albums.items[0].name,
        releaseDate: albums.body.albums.items[0].release_date,
        artistName: albums.body.albums.items[0].artists[0].name,
        spotifyUrl: albums.body.albums.items[0].artists[0].external_urls.spotify,

      }
      logger.info('Preparing tweet for new album releases');
      const status = await buildTweetStatus(albumInfo);
      logger.info('Posting tweet for a new release');
      await tweet(status);
      function buildTweetStatus(albumInfo) {
        const { releaseDate, artistName, albumName, spotifyUrl } = albumInfo;
        return `
  🎵 New Album Releases 🔥 

  📅 ${releaseDate}

  🎙️ Artist: ${artistName}

  💿 Album: ${albumName}

  🔗 ${spotifyUrl}
    #releases #albums #musiclackey
    `;
      };

    })
    .catch(function (err) {
      console.log('Something went wrong!', err.message);
    });
}



// export function tweetNewAlbumReleases() {

//   spotifyApi.clientCredentialsGrant(authorizationCode)


//     .then(function (data) {
//       spotifyApi.setAccessToken(data.body['access_token']);

//       return spotifyApi.getNewReleases({ limit: 2, offset: 0, country: 'US' })
//     })
//     .then(function (data) {

//       //return an array so that you can parse the data
//       var otherdata = Object.values(data);

//       //Parse through items object to get my specific data
//       console.log(otherdata);
//       console.log(data.body.albums.items[0].name);
//       console.log(data.body.albums.items[0].release_date);
//       console.log(data.body.albums.items[0].artists[0].name)
//       console.log(data.body.albums.items[0].artists[0].external_urls.spotify);

//       return data;

//     }, function (err) {
//       console.log("Get Releases has an issue!", err);
//     }).then(async function (data) {
//       var albumInfo = {

//         albumName: data.body.albums.items[0].name,
//         releaseDate: data.body.albums.items[0].release_date,
//         artistName: data.body.albums.items[0].artists[0].name,
//         spotifyUrl: data.body.albums.items[0].artists[0].external_urls.spotify,

//       }
//       logger.info('Preparing tweet for new album releases');
//       const status = await buildTweetStatus(albumInfo);
//       logger.info('Posting tweet for a new release');
//       await tweet(status);
//       function buildTweetStatus(albumInfo) {
//         const { releaseDate, artistName, albumName, spotifyUrl } = albumInfo;
//         return `
//   🎵 New Album Releases 🔥 

//   📅 ${releaseDate}

//   🎙️ Artist: ${artistName}

//   💿 Album: ${albumName}

//   🔗 ${spotifyUrl}
//     #releases #albums #musiclackey
//     `;
//       };

//     })
//     .catch(function (err) {
//       console.log('Something went wrong!', err.message);
//     });
// }

// const puppeteer = require('puppeteer');

// async function run() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setViewport({ width: 1440, height: 810 });
//   await page.goto('https://accounts.spotify.com/en/login?continue=https:%2F%2Fartists.spotify.com%2Fc%2Fartist%2F3Zck7FW6CnWWdKMmZMYsyr%2Fsongs');
//   await page.click('body > div.container-fluid.login.ng-scope > div > div:nth-child(1) > div > a');
//   await page.waitFor(1000);
//   await page.type('#email', '');
//   await page.type('#pass', '');
//   await page.click('#loginbutton');
//   await page.waitFor(5000);
//   //await page.click('#timeline > div > div > div > div > span > span > a');

//   await page.screenshot({ path: './stats/github.png' });

//   browser.close();
// }

// run();

// export function tweetNewAlbumReleases() {

//   spotifyApi.clientCredentialsGrant(authorizationCode)

//     .then(function (data) {
//       spotifyApi.setAccessToken(data.body['access_token']);

//       return spotifyApi.getFollowedArtists()
//     })
//     .then(function (artists) {
//       console.log('This user is following ', artists.body.artists.total, ' artists!');
//       console.log(artists.body.albums.items[0].id);

//       var artistId = artists.body.albums.items[0].id;
//       return artistId;

//     }, function (err) {
//       console.log("Get Followed Artists has an issue!", err);
//     });
// }

// export function tweetNewAlbumReleases() {

//   spotifyApi.authorizationCodeGrant(authorizationCode)
//   .then(function(data) {
//     console.log('Retrieved access token', data.body['access_token']);

//     // Set the access token
//     spotifyApi.setAccessToken(data.body['access_token']);

//     // Use the access token to retrieve information about the user connected to it
//     return spotifyApi.getFollowedArtists()
//   })
//   .then(function(data) {
//     // "Retrieved data for Faruk Sahin"
//     console.log('Retrieved data for ' + data.body);

//     return data.body;

//   })
//   .catch(function(err) {
//     console.log('Something went wrong', err.message);
//   });
// }

// var authorizeURL = spotifyApi.createAuthorizeURL(scopes)
// console.log(authorizeURL);