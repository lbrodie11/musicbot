import schedule from 'node-schedule';
import { getLogger } from 'log4js';

import { tweetNewAlbumReleases } from './twitter';

const logger = getLogger('Release Service');

const releases = {};
let counterExec = 0;
let counterRelease = 0;

export const runReleaseWatcher = cronSchedule => {
    logger.info('Setup scheduler with schedule', cronSchedule);
    console.log('getting ready to tweet')
    schedule.scheduleJob(cronSchedule, async () => {
        console.log('tweeting')
        await tweetNewAlbumReleases();
    })     
};

// export const runReleaseWatcher = cronSchedule => {
//     logger.info('Setup scheduler with schedule', cronSchedule);
//     schedule.scheduleJob(cronSchedule, async () => {
//         // try {
//         // logger.info(`Execution #${++counterExec} starts`);
//         await tweetNewAlbumReleases();
//         // counterRelease++;
//         // } catch (err) {
//         //     logger.error(err);
//         // }
//     }     
// }