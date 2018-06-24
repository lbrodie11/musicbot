const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

// mongoose.connect(`mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@ds131329.mlab.com:31329/nextshow`);

mongoose.connect(`mongodb://entbot:svnnZ0adVc5@ds263590.mlab.com:63590/zeitdb`);

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
  },
  password: String,
  spotifyId: String,
  spotifyAccessToken: String,
});

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);