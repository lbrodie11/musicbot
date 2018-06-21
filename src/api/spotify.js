var spotifyWebApi = require('spotify-web-api-node');

const {
  SPOTIFY_TOKEN,
} = process.env;

spotifyWebApi.setAccessToken(SPOTIFY_TOKEN);

// Retrieve new releases ArtistName, ReleaseDate, AlbumName
export const newReleases = spotifyWebApi.getNewReleases({ limit: 5, offset: 0, country: 'US' })
  .then(function (data) {
    console.log(data.body);
    done();
  }, function (err) {
    console.log("Something went wrong!", err);
  });

  // app.get('/newReleases', newReleases);