const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
    // connection of which this message is a part of
    connection_id: {
        type: Schema.Types.ObjectId,
        ref: 'Connection',
    },

    // who sent the message?
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // who was the message to?
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // actual content of the message
    content: {
        type: String,
        required: true,
    },

    // was there any media sent? if so, what was the profile picture of the url?
    mediaUrl: {
        type: String,
        required: false,
    },

    date_created: {
        type: Date,
        required: true
    }
});

MessageSchema.pre('save', function(next){
    this.date_created = Date.now();
    this.content = this.content.replace(/<(?:.|\n)*?>/gm, "");
    this.mediaUrl = this.mediaUrl.replace(/<(?:.|\n)*?>/gm, "");
    next();
});

module.exports = MessageSchema;