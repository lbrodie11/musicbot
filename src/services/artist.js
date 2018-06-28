import { getLogger } from 'log4js';
import { findArtist, updateArtistAlbums, removeArtist, insertArtist, findArtistNames, addArtistAlbum, findArtists, findAlbumNames } from '../persistence/artist';
import { initDb } from '../persistence/db';
import { getNewReleases } from '../api/spotify';
const logger = getLogger('Artist Service');

export const initArtistData = async (
    artistName,
    album
) => {
    try {
        await initDb();
        // const names = await findArtistNames();
        // const artist = await findArtist(artistName);
        // const artists = await findArtists();
        // logger.info(artist)
        // logger.info(artists)
        // logger.info(artists.names);
        // const allAlbums = await findAlbumNames();
        // logger.info(allAlbums)
        // updateArtistAlbums(albums)
        await insertArtist(artistName, album);
        // if(!artist.includes(album)){
        //     logger.info('Adding artist new album');
        //     await addArtistAlbum(album);
        // }else{
        //     logger.info('Not a new album')
        //     // logger.info('Init new artist data', artistName, albums);
        //     // await insertArtist(artistName, albums);
        // }
        logger.info('Artist data initialized', artistName, album.length, 'albums');
    } catch (err) {
        logger.error('Artist data initialization failed', err);
    }
    process.exit(0);
};

export const removeAllArtistData = async () => {
    try {
        await initDb();
        logger.warn('Remove all artist data');
        const names = await findArtistNames();
        for (let name of names) {
            logger.warn('Removing artist data', name);
            await removeArtist(name);
        }
        logger.warn('Removed data of all', names.length, 'artists');
    } catch (err) {
        logger.error('Remove all artist data failed', err);
    }
    process.exit(0);
};

export const removeArtistLastAlbum = async artistName => {
    try {
        await initDb();
        logger.warn('Remove artist last album: ', artistName);
        const artist = await findArtist(artistName);
        const [removedAlbum, ...albums] = artist.albums;
        await updateArtistAlbums(artistName, albums);
        logger.warn('Remove artist last album: ', removedAlbum);
    } catch (err) {
        logger.error('Remove artist last album failed', err);
    }
    process.exit(0);
};
