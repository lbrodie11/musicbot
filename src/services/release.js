// Figure out a way to find if the artist database object inncludes the albumname that is passed in

import schedule from 'node-schedule';
import { getLogger } from 'log4js';

import { initDb } from '../persistence/db';
import { tweetNewAlbumReleases } from './twitter';
import { findArtist, updateArtistAlbums, insertArtist, addArtistAlbum, findArtistNames, findAlbumNames } from '../persistence/artist';

import {
    getFollowedArtists,
    setAccessToken,
    getUser,
    getSpotifyToken,
    getArtistAlbums
} from '../api/spotify';

const logger = getLogger('Release Service');

const releases = {};
let counterExec = 0;
let counterRelease = 0;

export const runReleaseWatcher = cronSchedule => {
    logger.info('Setup scheduler with schedule', cronSchedule);
    schedule.scheduleJob(cronSchedule, async () => {
        try {
            logger.info('Setting Access Token')
            // const spotifyAPIToken = await getSpotifyAPIToken()
            // console.log(spotifyAPIToken);
            await setAccessToken(process.env.CODE);
            logger.info('Access Token Set')
            await initDb();
            logger.info(`Execution #${++counterExec} starts`);
            const artists = await getFollowedArtists();
            logger.info(`Total Artists I'm Following: ${artists.body.artists.total}`);
            var objArray = await artists.body.artists.items;
            var artistIds = await objArray.map(a => a.id);
            logger.info('Get Artist albums initialized');
            const artistsNames = await findArtistNames();
            const albumNames = await findAlbumNames();
            logger.info(`Albums in Database:  ${albumNames}`);
            logger.info(`Artists in Database: ${artistsNames}`);
            var newRelease = [];
            for (var i = 0; i < artistIds.length; i++) {
                var artistAlbum = await getArtistAlbums(artistIds[i]);
                var date = await artistAlbum.body.items[0].release_date;
                var artistName = await artistAlbum.body.items[0].artists[0].name;
                var artistAlbumName = await artistAlbum.body.items[0].name;
                const artist = await findArtist(artistName);
                var releaseDate = new Date(date);
                var currentDate = new Date();
                var testDate = new Date('2018-05-9');
                if (releaseDate >= testDate && !artistsNames.includes(artistName)) {
                    logger.info(`Adding New Artist & New Album:  ${artistAlbum} `)
                    await newRelease.push(artistAlbum);
                    insertArtist(artistName, artistAlbumName)
                }else if (releaseDate >= testDate && !albumNames.find(el => el[0] === artistAlbumName)) {
                    logger.info(`Adding new Album to Database:  ${artistAlbumName}`);
                    await newRelease.push(artistAlbum);
                    await updateArtistAlbums(artistName, artistAlbumName)
                }
            }
            await newRelease.forEach((element, index, array) => {
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
                    console.log('tweeting')
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