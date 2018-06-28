const mongoose = require('mongoose');

const Artist = mongoose.model('Artist', {
  artistName: String,
  albums: [String]
});

export const findArtistNames = () =>
  Artist.find()
    .exec()
    .then(artists => artists.map(a => a.artistName));

export const findAlbumNames = () =>
  Artist.find()
    .exec()
    .then(artists => artists.map(al => al.albums))

export const findArtists = () => Artist.find().exec();

export const findArtist = artistName => Artist.find({ artistName }).exec();

export const addArtistAlbum = (artistName, album) =>
  Artist.findOneAndUpdate( {artistName}, {$push: { albums: album } });

export const updateArtistAlbums = (artistName, albums) =>
  Artist.findOneAndUpdate({ artistName }, { albums });

export const insertArtist = (artistName, albums) =>
  Artist.create({
    artistName,
    albums
  });

export const removeArtist = artistName => Artist.remove({ artistName });
