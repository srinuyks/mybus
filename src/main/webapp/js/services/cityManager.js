'use strict';
/*global angular, _*/

var portalApp = angular.module('myBus');

portalApp.factory('cityManager', function ($rootScope, $http, $log, $window) {

  var cities = {}
    , rawChildDataWithGeoMap = {};

  return {
    fetchAllCities: function () {
        $log.debug("fetching cities data ...");
          $http.get('/api/v1/cities')
          .success(function (data) {
                  cities = data;
                 $rootScope.$broadcast('cityAndBoardingPointsInitComplete');
          })
          .error(function (error) {
            $log.debug("error retrieving cities");
          });
    },

    getAllData: function () {
      return cities;
    },

    getAllCities: function () {
        return cities;
    },

    getChildrenByParentId: function (parentId) {
      if (!parentId) {
        return [];
      }
      if (rawChildDataWithGeoMap[parentId]) {
        return rawChildDataWithGeoMap[parentId];
      }
      return _.select(rawDataWithGeo, function (value) {
        return value && value.parentId === parentId;
      });
    },

    getOneById: function (id) {
      return _.first(_.select(cities, function (value) {
        return value.id === id;
      }));
    },
    createCity : function (city, callback) {
        $http.post('/api/v1/city', city)
          .success(function (data) {
            callback(data);
            this.fetchAllCities();
          })
          .error(function (err) {
            var errorMsg = "error adding new city info. " + (err && err.error ? err.error : '');
            $log.error(errorMsg);
            alert(errorMsg);
          });
    },
    getCity: function (id, callback) {
      $http.get('/api/v1/city/' + id)
       .success(function (data) {
            callback(data);
       })
       .error(function (error) {
              alert("error finding city. " + angular.toJson(error));
       });
    },
    deleteCity: function(id, callback) {
      $http.delete('/api/v1/city/' + id)
        .success(function (data) {
          callback(data);
          $window.location = "#/cities";
        })
        .error(function (error) {
          alert("error finding city. " + angular.toJson(error));
        });
    }
  };
});

