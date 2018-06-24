const SpotifyWebApi = require('spotify-web-api-node');

// const spotifyApi = new SpotifyWebApi({
//   clientId: `'${process.env.SPOTIFYCLIENTID}'`,
//   clientSecret: `'${process.env.SPOTIFYSECRET}'`,
//   redirectUri: `${process.env.CALLBACKURL}`,
// });

var spotifyApi = new SpotifyWebApi({
    clientId,
    clientSecret
  });

const setAccessToken = (token) => {
  spotifyApi.setAccessToken(token);
};

const getArtists = () => (
  spotifyApi.getUserPlaylists()
    .then((data) => {
      data.body.items.forEach(item => item);
    })
    .then(data => data)
    .catch(err => err)
);

const getFollowedArtists = () => (
  spotifyApi.getFollowedArtists({ limit: 2 })
);

const getUser = () => (
  spotifyApi.getMe()
);

const getArtistAlbums = () => (
spotifyApi.getArtistAlbums(artistId, { limit: 1 })
);

exports.getArtists = getArtists;
exports.getFollowedArtists = getFollowedArtists;
exports.setAccessToken = setAccessToken;
exports.getUser = getUser;