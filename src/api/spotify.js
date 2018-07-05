import { getLogger } from 'log4js';
const SpotifyWebApi = require('spotify-web-api-node');
import { insertArtist, updateArtistAlbums } from '../persistence/artist';
const logger = getLogger('Spotify Service');

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

var spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: SPOTIFY_REDIRECT_URI
});

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

export const refreshAccessToken = () => (
  spotify.refreshAccessToken()
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
  logger.info('Get Followed Artists data initialized')
  const limit = 50
  const type = 'artist';

  const response = await spotifyApi.getFollowedArtists({ limit, after })
  logger.info(`Total Artists I'm Following: ${response.body.artists.total}`);
  const nextAfter = response.body.artists.cursors.after
  const artists = response.body.artists.items

  if (nextAfter) {
    return [].concat(artists, await getFollowedArtists(nextAfter))
  } else {
    return artists
  }
};

// Future Feature

export const getFeaturedPlaylists = async () => (
  spotifyApi.getFeaturedPlaylists()
);

export const getUser = () => (
  spotifyApi.getMe()
);

export const getArtistAlbums = (artistId) => (
  // Future Feature. Get Singles as well
  spotifyApi.getArtistAlbums(artistId, { album_type: 'album,single', limit: 1 })
);

export const getNewReleases = async (artistIds, artistsNames, albumNames) => {
  var newReleases = [];
  for (var i = 0; i < artistIds.length; i++) {
    var artistAlbum = await getArtistAlbums(artistIds[i]);
    var date = await artistAlbum.body.items[0].release_date;
    var artistName = await artistAlbum.body.items[0].artists[0].name;
    var artistAlbumName = await artistAlbum.body.items[0].name;
    var releaseDate = new Date(date);
    var currentDate = new Date('2018-6-27');
    if (releaseDate >= currentDate && !artistsNames.includes(artistName)) {
      logger.info(`Adding New Artist & New Album:  ${artistAlbum} `)
      await newReleases.push(artistAlbum);
      insertArtist(artistName, artistAlbumName)
    } else if (releaseDate >= currentDate && !albumNames.find(el => el[0] === artistAlbumName)) {
      logger.info(`Adding new Album to Database:  ${artistAlbumName}`);
      await newRelease.push(artistAlbum);
      await updateArtistAlbums(artistName, artistAlbumName)
    }
  }
  return newReleases;
};