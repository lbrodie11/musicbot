import mongoose from 'mongoose';

const Artist = mongoose.model('Project', {
  artistName: String,
  albumName: String,
  releaseDate: String,
  spotifyUrl: [String]
});

export const findArtistNames = () =>
  Artist.find()
    .exec()
    .then(artists => artists.map(a => a.name));

export const findProjects = () => Project.find().exec();

export const findProject = name => Project.findOne({ name }).exec();

export const updateProjectVersions = (name, versions) =>
  Project.findOneAndUpdate({ name }, { versions });

export const insertProject = (name, repo, type, hashtags, versions) =>
  Project.create({
    name,
    repo,
    type,
    hashtags: hashtags.split(',').map(h => h.trim()),
    versions
  });

export const removeProject = name => Project.remove({ name });
