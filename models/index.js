var mongoose = require('mongoose'),
    config   = require('config');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
	username: String,
	password: String
});

var User = mongoose.model('User', UserSchema);

module.exports.User = User;