// Figure out a way to find if the artist database object inncludes the albumname that is passed in

import schedule from 'node-schedule';
import { getLogger } from 'log4js';

import { initDb } from '../persistence/db';
import { tweetNewAlbumReleases } from './twitter';
import { findArtistNames, findAlbumNames } from '../persistence/artist';

import {
    getFollowedArtists,
    setAccessToken,
    getNewReleases,
    getSpotifyToken
} from '../api/spotify';

const logger = getLogger('Release Service');

let counterExec = 0;
let counterRelease = 0;

export const runReleaseWatcher = cronSchedule => {
    logger.info('Setup scheduler with schedule', cronSchedule);
    schedule.scheduleJob(cronSchedule, async () => {
        try {
            logger.info('Setting Access Token')
            const getSpotifyAPIToken = await getSpotifyToken()
            logger.info(getSpotifyAPIToken);
            await setAccessToken(getSpotifyAPIToken);
            logger.info('Access Token Set')
            await initDb();
            logger.info(`Execution #${++counterExec} starts`);
            const artists = await getFollowedArtists();
            var artistIds = await artists.map(a => a.id);
            logger.info('Get Artist albums initialized');
            const artistsNames = await findArtistNames();
            const albumNames = await findAlbumNames();
            logger.info(`Albums in Database:  ${albumNames}`);
            logger.info(`Artists in Database: ${artistsNames}`);
            var newReleases = await getNewReleases(artistIds, artistsNames, albumNames);
            await newReleases.forEach((element, index, array) => {
                setTimeout(function () {
                    counterRelease++
                    var albumInfo = {
                        albumName: element.body.items[0].name,
                        releaseDate: element.body.items[0].release_date,
                        artistName: element.body.items[0].artists[0].name,
                        spotifyUrl: element.body.items[0].artists[0].external_urls.spotify
                    }
                    var currentDate = new Date();
                    logger.info('Preparing tweet for new album releases for: ' + currentDate);
                    logger.info(albumInfo);
                    logger.info('tweeting')
                    tweetNewAlbumReleases(albumInfo);
                }, index * 10000);
            });
            logger.info(`Albums Releases since deployment: ${counterRelease}`);
            logger.info(`Execution end\n`);
        } catch (err) {
            if (err.statusCode === 401) {
                logger.error(`Access token expired\n`);
            } else {
                logger.error(err);
            }

        }
    });

}