let mongoose = require('mongoose'),
	UserSchema = require('./user'),
	ClassSchema = require('./class'),
	ConnectionSchema = require('./connection'),
	MessageSchema = require('./message'),
	RatingSchema = require('./rating');

module.exports = app => {
	app.models = {
		User: mongoose.model('User',UserSchema),
		Class: mongoose.model('Class',ClassSchema),
		Connection: mongoose.model('Connection',ConnectionSchema),
		Message: mongoose.model('Message',MessageSchema),
		Rating: mongoose.model('Rating',RatingSchema),
	};
};
