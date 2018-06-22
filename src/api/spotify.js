var SpotifyWebApi = require('spotify-web-api-node');


var authorizationCode = 'BQDIdryS8OauvFJlkpWJFQAi6I5AN7BqH31dSDMUhOjk2dueDa8LqKjU8dmA63QsTKyTaCdeepbRQVMdVquNfs_jzkUQsy1kTzCLwCiG_06Xzc_bCwMHMLes1jbu_pL20qsSUSFmmwNH6RDVHBFrEOxzBYvFUioMqrD2yu0PTXANAj91V8twmdXefywbAbd8UgmA9ySHNhsLiYA0z_Y-7i881qnJ4tI5iowpf5UxFkZmkUSx13E0q7P8YkVQ7k2PknIkTa-VEF-A';

var spotifyApi = new SpotifyWebApi({
  clientId: '5e1e2cc3a0dd422eb11244d00e3bb9a1',
  clientSecret: 'dd40c479a6fc4ab089e26ec268fdfcb0'
});

export var newReleases = spotifyApi.clientCredentialsGrant(authorizationCode)
  .then(function (data) {
    spotifyApi.setAccessToken(data.body['access_token']);
    return spotifyApi.getNewReleases({ limit: 1, offset: 0, country: 'US' })
  })
  .then(function (data) {

    var albumName = data.body.albums.items[0].name;
    var releaseDate = data.body.albums.items[0].release_date;
    var artistName = data.body.albums.items[0].artists[0].name;
    var spotifyUrl = data.body.albums.items[0].artists[0].external_urls.spotify;

    async () => {
      logger.info('Preparing tweet for new album releases:');
      const status = await buildTweetStatus();
      logger.info('Posting tweet for a new release');
      console.log(status);
    };
    
    const buildTweetStatus = async () => {
      return `
    🔥 New Album Releases 🚀
    ${releaseDate}
  
    ${artistName}

    ${albumName}

    ${spotifyUrl}
    
    #releases #albums #musiclackey
    `;
    };

    console.log(data.body.albums.items[0].name);
    console.log(data.body.albums.items[0].release_date);
    console.log(data.body.albums.items[0].artists[0].name)
    console.log(data.body.albums.items[0].artists[0].external_urls.spotify);
  }, function (err) {
    console.log("Get Releases has an issue!", err);
  })
  .catch(function (err) {
    console.log('Something went wrong!', err.message);
  });
