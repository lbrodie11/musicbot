const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('./db');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new SpotifyStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'https://musiclackey.now.sh',
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOrCreate(
      { spotifyId: profile.id },
      { spotifyAccessToken: accessToken },
      (err, userProfile) => {
        userProfile.spotifyAccessToken = accessToken;
        return done(null, userProfile);
      },
    );
  },
));

module.exports = passport;