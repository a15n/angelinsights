'use strict';

var _ = require('lodash');
var Job = require('./job.model');
var request = require("request");
var colors = require('colors');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;

var populateJobs = function (element, index, array) {
  request('https://api.angel.co/1/jobs?page=' + element, function (error, response, body) {
    var data = JSON.parse(body);
    var jobs = data.jobs;
    var jobsLength = jobs.length;
    for (var i = 0; i < jobsLength; i++) {
      var job = jobs[i];
      var jobObject = {};
      jobObject.title = job.title;
      jobObject.company = job.startup.name;
      jobObject.equityCliff = job.equity_cliff;
      jobObject.equityVest = job.equity_vest;
      jobObject.equityMin = job.equity_min;
      jobObject.equityMax = job.equity_max;
      jobObject.salaryMin = job.salary_min;
      jobObject.salaryMax = job.salary_max;
      jobObject.angelUrl = job.angellist_url;
      jobObject.companyUrl = job.startup.company_url;
      jobObject.logoUrl = job.startup.logo_url;
      jobObject.roleTags = [];
      jobObject.skillTags = [];
      jobObject.locationTags = [];
      var j = 0;
      var tagsLength = job.tags.length;
      for (j; j < tagsLength; j++) {
        switch(job.tags[j].tag_type) {
          case 'RoleTag':
            jobObject.roleTags.push(job.tags[j].display_name);
            break;
          case 'LocationTag':
            jobObject.locationTags.push(job.tags[j].display_name);
            break;
          case 'SkillTag':
            jobObject.skillTags.push(job.tags[j].display_name);
            break;
          default:
            console.log(job.tags[j].tag_type + " missing case statement");
        }
      }
      Job.create(jobObject, function(err, job) {
        if(err) { return handleError(res, err); }
        console.log((job.title + " added from page " + element).green);
      })
    }
  })
}

var beginPopulateJobs = function () {
  request('https://api.angel.co/1/jobs?page=1', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      var lastPage = data.last_page;
      var pageArray = [];
      for (var i = 1; i <= lastPage; i++) {
        pageArray.push(i);
      }
      pageArray.forEach(populateJobs);
    }
  })
}

//http://stackoverflow.com/questions/20499225/i-need-a-nodejs-scheduler-that-allows-for-tasks-at-different-intervals
var job = new CronJob({
  cronTime: '0 0 * * * *',
  // cronTime: '00 30 02 * * 0' // Runs every Sunday at 02:30:00 AM PT.
  onTick: function() {
    console.log('Beginning Cron. Deleting DB');
    Job.remove({},function(){
      console.log('DB deleted. Populating jobs.');
      beginPopulateJobs();
      console.log('Jobs populated. Cron finished. Will begin again in 7 days.');
    })
  },
  start: true,
  timeZone: "America/San_Francisco"
});
job.start();

// Get list of jobs
exports.index = function(req, res) {
  Job.find(function (err, jobs) {
    if(err) { return handleError(res, err); }
    return res.json(200, jobs);
  });
};

// Get a single job
exports.show = function(req, res) {
  var role = req.params.id;
  console.log(role);
  Job.find({roleTags: role}, function(error, data) {
    console.log(data + " sent to the front end");
    res.send(data);
  });
};

// Populate the whole database
exports.create = function(req, res) {
  console.log('hello from the jobs/create'.red);
  beginPopulateJobs();
};

// Updates an existing job in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Job.findById(req.params.id, function (err, job) {
    if (err) { return handleError(err); }
    if(!job) { return res.send(404); }
    var updated = _.merge(job, req.body);
    updated.save(function (err) {
      if (err) { return handleError(err); }
      return res.json(200, job);
    });
  });
};

// Deletes a job from the DB.
exports.delete = function(req, res) {
  Job.findById(req.params.id, function (err, job) {
    if(err) { return handleError(res, err); }
    if(!job) { return res.send(404); }
    job.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.destroy = function(req, res) {
  console.log('hello from destroy');
  Job.remove({}, function(err, res){
    console.log('everything deleted');
  });
}

function handleError(res, err) {
  return res.send(500, err);
}