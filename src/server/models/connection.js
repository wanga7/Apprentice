const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserEmbeddedSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    }
});

let ConnectionSchema = new Schema({
    connector: UserEmbeddedSchema,
    connectee: UserEmbeddedSchema,
    status: {
        type: String,
        enum: [
            'REQUESTING_TUTOR',
            'DENIED',
            'ACCEPTED'
        ],
        default: 'REQUESTING_TUTOR'
    },
});

ConnectionSchema.index({
    connector: 1,
    connectee: 1,
},{unique: true});

ConnectionSchema.pre('save', function(next){
    this.connector.email= this.connector.email.replace(/<(?:.|\n)*?>/gm, "");
    this.connector.phone = this.connector.phone.replace(/<(?:.|\n)*?>/gm, "");
    this.connector.first_name = this.connector.first_name.replace(/<(?:.|\n)*?>/gm, "");
    this.connector.last_name = this.connector.last_name.replace(/<(?:.|\n)*?>/gm, "");

    this.connectee.email= this.connectee.email.replace(/<(?:.|\n)*?>/gm, "");
    this.connectee.phone = this.connectee.phone.replace(/<(?:.|\n)*?>/gm, "");
    this.connectee.first_name = this.connectee.first_name.replace(/<(?:.|\n)*?>/gm, "");
    this.connectee.last_name = this.connectee.last_name.replace(/<(?:.|\n)*?>/gm, "");

    this.status = this.status.replace(/<(?:.|\n)*?>/gm, "");
    next();
});

module.exports = ConnectionSchema;