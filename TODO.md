TODO

Check the number of jobs, companies, postings, etc.

Someday
Make a time stamped line chart after I've scrubbed the words
Add links to all list items
Secure sign in as administrator (maybe admin page, maybe admin toolbar)

WORD PLAY
* HTML/CSS/PHP/MYSQL	becomes HTML++ CSS++ PHP++ MYSQL++ (too opinionated)
* "Proven Leader With Demonstrated Success In Hiring And Growing A High Performing, Collaborative, And Results Oriented Technology Team" limits to ~100 characters.
* Limit To 50 (more if wanted)

Mobile optimze the entire site (especially the charts)

* **Node Task Scheduling**: As the landing page promises, the database is updated once a week. This is handled automatically using [Node Cron](https://github.com/ncb000gt/node-cron) and the following function which executes on the Node/Express server. (COMING SOON)
```
var job = new CronJob({
  cronTime: '00 30 02 * * 0' // Runs every Sunday at 02:30:00 AM PT.
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
```

https://devcenter.heroku.com/articles/scheduler