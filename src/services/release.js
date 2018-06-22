// import schedule from 'node-schedule';
// import { getLogger } from 'log4js';

// import { tweetNewRelease } from './twitter';

// const logger = getLogger('Release Service');

// const releases = {};
// let counterExec = 0;
// let counterRelease = 0;

// export const runReleaseWatcher = cronSchedule => {
//   logger.info('Setup scheduler with schedule', cronSchedule);
//   schedule.scheduleJob(cronSchedule, async () => {
//     try {
//       await initDb();
//       logger.info(`Execution #${++counterExec} starts`);
//       const projects = await findProjects();
//       logger.info('Projects:', projects.length);
//       for (let project of projects) {
//         const currentVersions = await getRepoVersions(project.repo);
//         const oldVersions = project.versions;
//         const newVersions = resolveNewVersions(oldVersions, currentVersions);
//         if (newVersions.length) {
//           logger.info('New versions:', project.name, newVersions.join(', '));
//           for (let newVersion of newVersions) {
//             try {
//               await tweetNewRelease(project, newVersion);
//               counterRelease++;
//               releases[project.name] = releases[project.name] || [];
//               releases[project.name].push(newVersion);
//             } catch (err) {
//               logger.error(
//                 'New version:',
//                 project.name,
//                 newVersion,
//                 'failed',
//                 err
//               );
//             }
//           }
//           await updateProjectVersions(project.name, currentVersions);
//         }
//       }
//       logger.info(`Releases since deployment: ${counterRelease}`);
//       Object.keys(releases).forEach(key =>
//         logger.info(
//           `${key}: ${releases[key].length} (${
//             releases[key][releases[key].length - 1]
//           })`
//         )
//       );
//       logger.info(`Execution end\n`);
//     } catch (err) {
//       logger.error(err);
//     }
//   });
// };

// const resolveNewVersions = (oldVersions, currentVersions) =>
//   currentVersions.filter(version => !oldVersions.includes(version));
