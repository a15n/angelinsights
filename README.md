Angel Insights *beta
=========
[Angel Insights](http://angelinsights.herokuapp.com/) sheds light on the hiring needs of the different companies on Angel List. Want to make yourself more marketable? Find out what skills are currently in demand.

This app was built using Javascript, MongoDB, Express, Angular, Node, and High Charts.

Primary Features
---------
* **High Charts**: [High Charts](http://www.highcharts.com/) is a charting library written in pure JavaScript, offering an easy way of adding interactive charts to your web site or web application.
![](client/assets/images/high-charts.png?raw=true)
* **API calls**: With a single click every job on Angel List (over 23,000) are gathered, scrubbed, and stored in a MongoDB.
```
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

request('https://api.angel.co/1/jobs?page=1', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var lastPage = JSON.parse(body).last_page;
    var pageArray = [];
    for (var i = 1; i <= lastPage; i++) {
      pageArray.push(i);
    }
    pageArray.forEach(populateJobs);
  }
})
```