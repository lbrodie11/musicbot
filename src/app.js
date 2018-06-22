import 'now-env';
import yargs from 'yargs';
import express from 'express';
import { configure, getLogger } from 'log4js';

import { removeAllTweets, tweetNewAlbumReleases } from './services/twitter';
// import { runReleaseWatcher } from './services/release';
// import {
//   initProjectData,
//   removeAllProjectData,
//   removeProjectLastVersion
// } from './services/project';
// import { getChangelogAsImage } from './services/changelog';
// import { getChangelogImage } from './handlers/changelog';

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
        ['start'],
        'Run releasebot app, check for and tweet about new releases of projects',
        {
            schedule: {
                alias: 's',
                type: 'string',
                description: 'Cron style schedule',
                default: '*/30 * * * *'
            }
        },
        ({ debug, schedule }) => {
            configureLogger(debug);
            //   runReleaseWatcher(schedule);

            const app = express();
            app.use(express.static('public'));
            app.listen(8080);
            logger.info('Server started, port:', 8080);
        }
    )
    .option('debug', { type: 'boolean', description: 'Set debug log level' })
    .help().argv;
