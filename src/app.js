// require('dotenv').config();
import 'now-env';
import bodyParser from 'body-parser';
import yargs from 'yargs';
import express from 'express';
import { configure, getLogger } from 'log4js';
import { initArtistData, removeAllArtistData, removeArtistLastAlbum } from './services/artist';
import { removeAllTweets, tweetNewAlbumReleases } from './services/twitter';
import { runReleaseWatcher } from './services/release';
const logger = getLogger('App');
const randomString = require('./randomString');

import {
    createAuthorizeURL,
    authorizationCodeGrant,
    setAccessToken,
    setRefreshToken,
    refreshAccessToken,
    getAccessToken
} from './api/spotify';

var stateKey = 'spotify_auth_state';

const configureLogger = debug =>
    configure({
        appenders: {
            out: {
                type: 'stdout',
                layout: { type: 'pattern', pattern: '%[[%p] %c - %]%m' }
            }
        },
        categories: {
            default: { appenders: ['out'], level: debug ? 'debug' : 'info' }
        }
    });

const argv = yargs
    .command(
        'remove',
        'Removes application data',
        {
            twitter: {
                type: 'boolean',
                description: 'Removes all tweets from user timeline'
            },
            database: {
                type: 'boolean',
                description: 'Removes all artist data from database'
            },
            artist: {
                type: 'string',
                description: 'Removes last album of a artist'
            }
        },
        async ({ twitter, database, artist, debug }) => {
            configureLogger(debug);
            if (twitter) {
                await removeAllTweets();
            }
            if (database) {
                await removeAllArtistData();
            }
            if (artist) {
                await removeArtistLastAlbum(artist);
            }
        }
    )

    .command(
        'tweet',
        'Tweet artist album info',
        {
            twitter: {
                type: 'boolean',
                description: 'Makes a tweet about album info'
            }
        },
        async ({ twitter }) => {
            await tweetNewAlbumReleases();
        }
    )

    .command(
        'init',
        'Adds artists and initial albums to the database',
        {
            artistName: {
                type: 'string',
                description: 'Artistname, eg: Kanye West',
                demandOption: true
            },
            albums: {
                type: 'string',
                description: 'Artist albums, eg: The Life of Pablo, Yeezus',
                demandOption: true
            }
        },
        async ({ artistName, albums, debug }) => {
            configureLogger(debug);
            await initArtistData(artistName, albums);
        }
    )

    .command(
        ['start'],
        'Run musicbot app, check for and tweet about new album releases of artists',
        ({ debug }) => {
            configureLogger(debug);

            // When our access token will expire
            var tokenExpirationEpoch;
            var numberOfTimesUpdated = 0;

            const app = express();
            app.use('/', express.static('public'));
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            app.get('/', function (req, res) {
                logger.info("Checking login......")
                if (getAccessToken()) {
                    logger.info('Logged in.')
                    return res.send('Logged in.');
                }
                logger.info('Not logged in')
                return res.send('/login');
            });
            app.get('/login', async function (req, res) {
                var state = randomString(16);
                var scopes = ['user-follow-read'];
                res.cookie(stateKey, state);
                var authURL = await createAuthorizeURL(scopes, state);
                res.redirect(authURL);
            });
            app.get('/callback', function (req, res) {
                authorizationCodeGrant(req.query.code)
                    .then(function (data) {
                        logger.info(data.body['access_token']);
                        setAccessToken(data.body['access_token']);
                        logger.info(data.body['refresh_token']);
                        setRefreshToken(data.body['refresh_token']);
                        // Save the amount of seconds until the access token expired
                        tokenExpirationEpoch =
                            new Date().getTime() / 1000 + data.body['expires_in'];
                        logger.info(
                            'Retrieved token. It expires in ' +
                            Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
                            ' seconds!'
                        );
                        runReleaseWatcher();
                        return res.redirect('/');
                    }, function (err) {
                        return res.send(err);
                    });
            });
            app.listen(8080);
            logger.info('Server started, port:', 8080);
        }
    )
    .option('debug', { type: 'boolean', description: 'Set debug log level' })
    .help().argv;
