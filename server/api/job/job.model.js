'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var JobSchema = new Schema({
  title: String,
  company: String,
  equityCliff: Number,
  equityVest:Number,
  equityMin: Number,
  equityMax: Number,
  salaryMin: Number,
  salaryMax: Number,
  angelUrl: String,
  companyUrl: String,
  logoUrl: String,
  roleTags: [String],
  skillTags: [String],
  locationTags: [String]
});

module.exports = mongoose.model('Job', JobSchema);