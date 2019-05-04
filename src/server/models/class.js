"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Class = new Schema({
  course_id: {type: String, required: true, unique: true },
  course_name: {type: String, required: true },
  students: [{type: Schema.Types.ObjectId, ref: "User"}],
  tutors: [{type: Schema.Types.ObjectId, ref: "User"}],
});

Class.pre("save",function(next) {
  //Sanitize strings
  this.course_id = this.course_id.replace(/<(?:.|\n)*?>/gm, "");
  this.course_name = this.course_name.replace(/<(?:.|\n)*?>/gm, "");
  next();
});

module.exports = Class;
