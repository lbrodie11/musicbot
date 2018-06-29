require('dotenv').config();
// import 'now-env';
import yargs from 'yargs';
import express from 'express';
import { configure, getLogger } from 'log4js';
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');

import { initArtistData, removeAllArtistData, removeArtistLastAlbum } from './services/artist';

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
            app.listen(8080);
            logger.info('Server started, port:', 8080);
        }
    )
    .option('debug', { type: 'boolean', description: 'Set debug log level' })
    .help().argv;
