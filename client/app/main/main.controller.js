'use strict';

function c (input) {
  console.log(input);
}

//http://repl.it/VXf/13

angular.module('angelinsightsApp')
  .controller('MainCtrl', function ($scope, $http, $interval) {
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

    var targetWords = {
        "Angular.JS": ["AngularJS", "Angular", "Angular JS"],
        "Node.js": ["NodeJS", "Node.js Developer", "Node", "NodeJS/Express", "Node.js development", "Node.js (Socket.io)", "Real time Applications (node.js, stream.io)"],
        "MongoDB": ["NoSQL (MongoDB)"],
        "Backbone.js": ["BackboneJS", "Backbone", "Backbone.Marionette"],
        "ExpressJs": ["Express.js"]
    };

    var combineSimilarWords = function (originalObject, role) {
      if (role === "Developer") {
        var targetObject = targetWords;
        for (var originalWord in originalObject) {
          for (var targetWord in targetObject) {
            if (targetObject[targetWord].indexOf(originalWord) > -1) {
              originalObject[targetWord] = originalObject[targetWord] + originalObject[originalWord];
              delete originalObject[originalWord];
            }
          }
        }
      }
      return originalObject;
    };

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

    $scope.roles = [
      {name:'Developer'},
      {name:'Designer'},
      {name:'Mobile Developer'},
      {name:'Operations'},
      {name:'Finance'},
      {name:'Marketing'},
      {name:'Product Manager'},
      {name:'Sales'},
      {name:'Human Resources'}
    ];

    $scope.addAllJobs = function () {
      if (confirm("are you sure?") === true) {
        $http.post('/api/jobs');
      }
    };

    $scope.getSkills = function (role) {
      setChartSize();
      $scope.limit = 50;
      $scope.limitReached = false;
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
        $scope.skillsArray = objToArray(combineSimilarWords($scope.current, role));
        chartObject.jobsAnalyzed = $scope.skillsArray.length;
        chartObject.sortedArray = $scope.skillsArray.sort(function(a, b){
          return a.value-b.value;
        }).reverse();
        chartObject.topFifteen = [];
        // chartObject.topFifteenTotal = 0;
        for (var i = 0; i < 15; i++) {
          var name = chartObject.sortedArray[i].name;
          var value = chartObject.sortedArray[i].value;
          chartObject.topFifteen.push([name, value]);
        }
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
              plotShadow: false
          },
          title: {
            text: 'Top 15 in demand ' + chartObject.role + ' skills on Angel List'
          },
          subtitle: {
            text: chartObject.jobsAnalyzed + ' skills analyzed'
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
                      format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                      style: {
                          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                      },
                      connectorColor: 'silver'
                  }
              }
          },
          series: [{
              type: 'pie',
              name: 'Top 15 share',
              data: chartObject.topFifteen
          }]
      });
      $scope.chartExists = true;
    };

    $scope.increaseLimit = function() {

      $scope.limit += 50;
      c($scope.limit);
      c($scope.skillsArray.length);
      if ($scope.limit >= $scope.skillsArray.length) {
        $scope.limitReached = true;
      }
    }
    $scope.seeAll = function() {
      $scope.limit = $scope.skillsArray.length;
      $scope.limitReached = true;
    }

    $scope.delete = function () {
      $http.delete('/api/jobs');
    }

    function setChartSize () {
      var chartWidth = Math.max($('#parentContainer').width(), 600);
      if ($('#parentContainer').width() < 600) {
        $scope.tooSmall = true;
      } else {
        $scope.tooSmall = false;
      }
      var chartHeight = chartWidth * 0.5;
      $('#chartContainer').css({
        'height': chartHeight + 'px',
        'width':  chartWidth + 'px'
      });
    }
    $(window).resize(setChartSize);

  });