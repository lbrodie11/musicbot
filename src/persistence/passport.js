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
    clientID: '5e1e2cc3a0dd422eb11244d00e3bb9a1',
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/callback',
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