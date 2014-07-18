'use strict';

//http://repl.it/VXf/13

angular.module('angelinsightsApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

////////////////////////////////////////////////

    var jobScrub = function (inputObject, skillsHash, role) {
      if (typeof inputObject !== "object" || typeof role !== "string"){
      throw "input object and/or role missing/incorrect";
      }
      var tagIndex = inputObject.skillTags.length;
      while(tagIndex--) {
        var skill = inputObject.skillTags[tagIndex];
        if (skillsHash[skill] > 0) {
          skillsHash[skill]++;
        } else {
          skillsHash[skill] = 1;
        }
      }
      return skillsHash;
    };

    var objToArray = function (inputObject) {
      var outputArray = [];
      for (var key in inputObject) {
        outputArray.push({name:key,value:inputObject[key]});
      }
      return outputArray;
    };

    // $scope.roles = [
    //   "Designer",
    //   "Developer",
    //   "Mobile Developer",
    //   "Operations",
    //   "Designer",
    //   "Finance",
    //   "Developer",
    //   "Marketing",
    //   "Product Manager",
    //   "Sales",
    //   "Human Resources"
    // ];

    $scope.roles = [
      {name:'Developer', shade:'light'},
      {name:'Designer', shade:'dark'},
      {name:'Mobile Developer', shade:'dark'},
      {name:'Operations', shade:'dark'},
      {name:'Finance', shade:'light'},
      {name:'Marketing', shade:'light'},
      {name:'Product Manager', shade:'light'},
      {name:'Sales', shade:'light'},
      {name:'Human Resources', shade:'light'}
    ];

    $scope.addAllJobs = function () {
      if (confirm("are you sure?") === true) {
        $http.post('/api/jobs');
      }
    };

    $scope.getSkills = function (role) {
      var chartObject = {};
      chartObject.role = role;
      $scope.current = {};

      $scope.skillsArray = [];
      $scope.loading = true;

      $http.get('/api/jobs/' + role)
      .success(function(data){
        data.forEach(function(element, index, array){
          jobScrub(data[index], $scope.current, role);
        });
        $scope.skillsArray = objToArray($scope.current);
        chartObject.jobsAnalyzed = $scope.skillsArray.length;
        chartObject.sortedArray = $scope.skillsArray.sort(function(a, b){
          return a.value-b.value;
        }).reverse();
        chartObject.topTen = [];
        chartObject.topTenTotal = 0;
        for (var i = 0; i < 10; i++) {
          var name = chartObject.sortedArray[i].name;
          var value = chartObject.sortedArray[i].value;
          chartObject.topTen.push([name, value]);
        }
        $scope.test = chartObject.topTen;
        makeChart(chartObject);
        $scope.loading = false;
      });
    };

    var makeChart = function (chartObject) {
      //deletes existing highchart
      if ($scope.chartExists) {
        $('#chartContainer').highcharts().destroy();
      }

      // Builds the (new) chart
      $('#chartContainer').highcharts({
          chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              events: {
                redraw: function() {
                  alert ('The chart is being redrawn');
                }
              }

          },
          title: {
            text: 'Top 10 in demand ' + chartObject.role + ' skills on Angel List'
          },
          subtitle: {
            text: chartObject.jobsAnalyzed + ' jobs analyzed'
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          plotOptions: {
              pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                      style: {
                          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                      },
                      connectorColor: 'silver'
                  }
              }
          },
          series: [{
              type: 'pie',
              name: 'Top 10 share',
              data: chartObject.topTen
          }]
      });
      $scope.chartExists = true;
    };
  });