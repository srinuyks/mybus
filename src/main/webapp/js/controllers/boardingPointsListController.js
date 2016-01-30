/**
 * Created by skandula on 5/19/15.
 */

'use strict';
/*global angular,_*/

angular.module('myBus.boardingPointModule', [])
            .controller('BoardingPointsListController', function ($scope, $http, $log, ngTableParams, $routeParams,$modal, $filter, cityManager) {
            $log.debug('BoardingPointsListController');
            $scope.headline = "Boarding Points";
            $scope.cityId = $routeParams.id;
            $scope.currentPageOfBoardingPoints = [];
                var loadTableData = function (tableParams, $defer) {
                var data=cityManager.getCity($scope.cityId, function(data) {
                    $scope.city = data;
                    console.log("found city"+angular.toJson($scope.city));
                    var orderedData = tableParams.sorting() ? $filter('orderBy')($scope.city.boardingPoints, tableParams.orderBy()) : $scope.city.boardingPoints;
                    tableParams.total($scope.city.boardingPoints.length);
                    if (angular.isDefined($defer)) {
                        $defer.resolve(orderedData);
                    }
                    $scope.currentPageOfBoardingPoints = orderedData.slice((tableParams.page() - 1) * tableParams.count(), tableParams.page() * tableParams.count());
                });

            };
            $scope.boardingPointContentTableParams = new ngTableParams({
                page: 1,
                count: 25,
                sorting: {
                    state: 'asc',
                    name: 'asc'
                }
            }, {
                total: $scope.currentPageOfBoardingPoints.length,
                getData: function ($defer, params) {
                loadTableData(params);
                }
            });
        //-------------------------------------------------------------------------------------------
         $scope.handleDeleteButtonClicked = function(id) {
                var modalInstance = $modal.open({
                templateUrl: 'delete-city-state-modal.html',
                controller: 'DeleteCityStateController',
                resolve: {
                    deleteCityId: function () {
                        return id;
                    }
                }
            })
        };
        $scope.handleClickAddBoardingPoint = function () {
            var modalInstance = $modal.open({
                templateUrl: 'add-boardingpoint-to-city-state-modal.html',
                controller: 'AddBoardingPointController',
                resolve: {
                    cityId:function(){
                        return $scope.cityId;
                    }
                }
            })
        },
        $scope. updateBpOnClick = function(id) {
                var modalInstance = $modal.open({
                templateUrl: 'update-boardingPt.html',
                controller: 'UpdateBoardingPtController',
                resolve: {
                    cityId: function () {
                        return $scope.cityId;
                    },
                    BpId:function(){
                        return id;
                    }
                }
            })
        },
        $scope. deleteBpOnClick = function(id) {
            console.log("delete btn clicked "+ id);
            var modalInstance = $modal.open({
                templateUrl: 'delete-boardingPt.html',
                controller: 'DeleteBpController',
                resolve:{
                    cityId:function() {
                        return $scope.cityId;
                    },
                    BpId:function(){
                        return id;
                    }
                }

            })
        }

    })
    // ========================== Modal - Boarding point controller =================================
    .controller('AddBoardingPointController', function ($scope, $modalInstance, $http,$log,$route,cityId, cityManager) {
        $scope.boardingPoint = {};
        $scope.ok = function () {
            if ($scope.boardingPoint.name === null || $scope.boardingPoint.contact === null || $scope.boardingPoint.landmark === null) {
                $log.error("null name or contact or landmark.  nothing was added.");
                $modalInstance.close(null);
            }
            cityManager. createBordingPoint(cityId,$scope.boardingPoint, function(data){
                $route.reload();
                $modalInstance.close(data);
            });
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
        $scope.isInputValid = function () {
            return ($scope.boardingPoint.name || '') !== '' &&
                ($scope.boardingPoint.landmark || '') !== '' &&
                ($scope.boardingPoint.contact || '') !== '';
        };
    })

    //======================Model - DeleteCityStateController=============================================
    .controller('DeleteCityStateController', function ($scope, $modalInstance, $http, $log,$route, deleteCityId, cityManager) {
        $scope.id = deleteCityId;
        $scope.ok = function (id) {
        cityManager.deleteCity(id,function(data) {
            $modalInstance.close(data);
        })
    }
        $scope.cancel = function () {
         $modalInstance.dismiss('cancel');
     };
})
//======================Model - updateBpController=============================================
    .controller('UpdateBoardingPtController', function ($scope, $modalInstance, $http,$route,BpId,cityId, $log,cityManager) {
        $scope.setBpIntoView = function(cityId,BpId){
            cityManager.getBp(cityId,BpId,function(data){
                    $scope.boardingPoint=data;
            })
        };
        $scope.setBpIntoView (cityId,BpId);
        $scope.ok = function (BpId) {
                    cityManager.updateBp(cityId,$scope.boardingPoint, function(data) {
                        $route.reload();
                        $modalInstance.close(data);
                    })
        }
        $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
        };
    })
//======================Model - DeleteBpController=============================================
    .controller('DeleteBpController', function ($scope, $modalInstance,cityId,$route, $http,BpId,$log, cityManager) {
        $scope.ok = function () {
            cityManager.deleteBp(cityId,BpId ,function(data) {
                 $route.reload();
                $modalInstance.close(data);
            })
        }
        $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        };
    });

