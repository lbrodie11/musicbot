require('dotenv').config();
import 'now-env';
import yargs from 'yargs';
import express from 'express';
import { configure, getLogger } from 'log4js';
const passport = require('./persistence/passport');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');

import { tweet, tweetWithMedia } from './api/twitter';

import { removeAllTweets, tweetNewAlbumReleases } from './services/twitter';
import { runReleaseWatcher } from './services/release';

const logger = getLogger('App');

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
            }
        },
        async ({ twitter, database, project, debug }) => {
            configureLogger(debug);
            if (twitter) {
                await removeAllTweets();
            }
            if (database) {
                await removeAllProjectData();
            }
            if (project) {
                await removeProjectLastVersion(project);
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
        'tweet-twitter',
        'Tweet artist album info',
        {
            twitter: {
                type: 'boolean',
                description: 'Makes a tweet about album info'
            }
        },
        async ({ twitter }) => {
            await tweet("Hi");
        }
    )

    .command('get', 'make a get HTTP request', function (yargs) {
        return yargs.option('url', {
          alias: 'u',
          default: 'http://yargs.js.org/'
        })
      })

    .command(
        ['start'],
        'Run releasebot app, check for and tweet about new releases of projects',
        {
            schedule: {
                alias: 's',
                type: 'string',
                description: 'Cron style schedule',
                default: '*/1 * * * *'
            }
        },
        ({ debug, schedule }) => {
            configureLogger(debug);
            runReleaseWatcher(schedule);



            const app = express();
            app.use(express.static('public'));
            app.use(cookieParser());
            app.use(bodyparser.json());
            app.use(methodOverride());
            app.use(session({
                secret: 'testsecret',
                saveUninitialized: true,
                resave: false,
            }));
            app.use(passport.initialize());
            app.use(passport.session());
            app.get(
                'https://musiclackey.now.sh', passport.authenticate(
                    'spotify',
                    { scope: ['user-follow-read'], showDialog: false },
                ),
                () => { },
            );
            app.listen(8080);
            logger.info('Server started, port:', 8080);
        }
    )
    .option('debug', { type: 'boolean', description: 'Set debug log level' })
    .help().argv;
