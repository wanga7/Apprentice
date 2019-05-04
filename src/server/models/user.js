"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let User = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  school: {type: String, required: true },
  profile_picture: {type: Boolean },
  majors: [{type: String}],
  minors: [{type: String}],
  graduation_year: {type: Number},
  interests: [{type: String}],
  classes_tutor: [{type: Schema.Types.ObjectId, ref: "Class"}],
  classes_learn: [{type: Schema.Types.ObjectId, ref: "Class"}],
  phone: {type: String},
  email: {type: String, index: true/*required: true*/ },
  blurb: {type: String},
  //rating: [{type: Number}],
  avgRating: {type: Number}
});

User.path("email").validate(function(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}, "malformed email address");

User.pre("save",function(next) {
  // Sanitize strings
  this.first_name = this.first_name.replace(/<(?:.|\n)*?>/gm, "");
  this.last_name = this.last_name.replace(/<(?:.|\n)*?>/gm, "");
  if (this.phone) {this.phone.replace(/<(?:.|\n)*?>/gm, "");}
  if (this.blurb) {this.blurb = this.blurb.replace(/<(?:.|\n)*?>/gm, "");}

  if (this.majors.length!==undefined) {
    for (let i=0;i<this.majors.length;i++) {
      this.majors[i]=this.majors[i].replace(/<(?:.|\n)*?>/gm, "");
    }
  }
  if (this.minors.length!==undefined) {
    for (let i=0;i<this.minors.length;i++) {
      this.minors[i]=this.minors[i].replace(/<(?:.|\n)*?>/gm, "");
    }
  }

  // if (this.rating === undefined)
  //   this.rating = [];
  if (this.avgRating === undefined) {
    this.avgRating=0;
  }

  next();
});

User.post('init',function(doc) {
  // we gotta check if it is undefined cause
  // if (doc.rating !== undefined) {
  //   let length = doc.rating.length;
  //   doc.rating = doc.rating.reduce((accum, val) => accum + val, 0) / length;
  //   return doc;
  // }
});

// export the schema
module.exports = User;
