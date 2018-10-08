import { getLogger } from 'log4js';
import { insertArtist, updateArtistAlbums } from '../persistence/artist';
import moment from 'moment';
const SpotifyWebApi = require('spotify-web-api-node');
const logger = getLogger('Spotify Service');

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

var spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: SPOTIFY_REDIRECT_URI
});

let lastRefresh = null;

export const refreshToken = () => {
  if (!lastRefresh || moment(lastRefresh).add(30, 'minutes') <= moment()) {
    return spotifyApi.refreshAccessToken()
      .then((data) => {
        lastRefresh = moment();
        logger.info('The access token has been refreshed!');
        setAccessToken(data.body.access_token);
      }, (err) => {
        logger.info('Could not refresh access token', err);
      });
  }
  return new Promise(r => r());
}

export const setAccessToken = (token) => (
  spotifyApi.setAccessToken(token)
);

export const setRefreshToken = (token) => (
  spotifyApi.setRefreshToken(token)
);

export const createAuthorizeURL = (scopes, state) => (
  spotifyApi.createAuthorizeURL(scopes, state)
);

export const authorizationCodeGrant = (code) => (
  spotifyApi.authorizationCodeGrant(code)
);

export const getAccessToken = () => (
  spotifyApi.getAccessToken()
);

export const getArtists = () => (
  spotifyApi.getUserPlaylists()
    .then((data) => {
      data.body.items.forEach(item => item);
    })
    .then(data => data)
    .catch(err => err)
);

export const getFollowedArtists = async (after) => {
  const limit = 50

  const response = await spotifyApi.getFollowedArtists({ limit, after })
  const nextAfter = response.body.artists.cursors.after
  const artists = response.body.artists.items

  if (nextAfter) {
    return [].concat(artists, await getFollowedArtists(nextAfter))
  }
  return artists
};

export const getFeaturedPlaylists = async () => (
  spotifyApi.getFeaturedPlaylists()
);

export const getUser = () => (
  spotifyApi.getMe()
);

export const getArtistAlbums = (artistId) => (
  spotifyApi.getArtistAlbums(artistId, { album_type: 'album,single', limit: 1, country: 'US' })
);

export const getNewReleases = async (artistIds, artistsNames, albumNames) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  var newReleases = [];
  for (var i = 0; i < artistIds.length; i++) {
    var artistAlbum = await getArtistAlbums(artistIds[i]);
    var date = await artistAlbum.body.items[0].release_date;
    var artistName = await artistAlbum.body.items[0].artists[0].name;
    var artistAlbumName = await artistAlbum.body.items[0].name;
    var releaseDate = new Date(date);
    var currentDate = new Date('2018-7-09');
    await delay(1000);
    if (releaseDate >= currentDate && !artistsNames.includes(artistName)) {
      logger.info(`Adding New Artist & New Album:  ${artistAlbum} `)
      await newReleases.push(artistAlbum);
      await insertArtist(artistName, artistAlbumName)
    } else if (releaseDate >= currentDate && !albumNames.find(el => el[0] === artistAlbumName)) {
      logger.info(`Adding new Album to Database:  ${artistAlbumName}`);
      await newReleases.push(artistAlbum);
      await updateArtistAlbums(artistName, artistAlbumName)
    }
  }
  return newReleases;
};