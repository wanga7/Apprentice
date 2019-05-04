"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Rating = new Schema({
  tutor_email: {type: String, required: true, unique: true, index: true},
  ratings: [{
    student_email: String,
    value: Number
  }],
  numOfRatings: {type: Number},
  avgRating: {type: Number}
});

Rating.path("tutor_email").validate(function(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}, "malformed email address");

// export the schema
module.exports = Rating;
