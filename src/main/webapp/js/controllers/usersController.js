"use strict";
/*global angular, _*/

angular.module('myBus.userModule', ['ngTable', 'ui.bootstrap'])

  //
  // ============================= List All ===================================
  //
    .controller('UsersController', function($scope, $http, $log, $filter, ngTableParams, $location, usSpinnerService,userManager,$rootScope) {
      console.log("in UsersController");
      $scope.headline = "Users";
      //$scope.users = [];
      $scope.userCount = 0;

      $scope.startSpin = function(){
        usSpinnerService.spin('spinner-1');
      };
      $scope.stopSpin = function(){
        usSpinnerService.stop('spinner-1');
      };

      $scope.currentPageOfUsers = [];
      var loadTableData = function (tableParams, $defer) {
          userManager.getUsers(function (data) {
              $scope.users = data;
              var orderedData = tableParams.sorting() ? $filter('orderBy')(data, tableParams.orderBy()) : data;
              $scope.allUsers = orderedData;
              tableParams.total(data.length);
              if (angular.isDefined($defer)) {
                  $defer.resolve(orderedData);
              }
              $scope.currentPageOfUsers = orderedData.slice((tableParams.page() - 1) * tableParams.count(), tableParams.page() * tableParams.count());
          });
      };
      $scope.userContentTableParams = new ngTableParams({
        page: 1,
        count: 50,
        sorting: {
          state: 'asc',
          name: 'asc'
        }
      }, {
        total: $scope.currentPageOfUsers.length,
        getData: function ($defer, params) {
          $scope.$on('UsersInitComplete', function (e, value) {
            loadTableData(params);
          });
        }
      });

        userManager.fetchAllUsers();

        $scope.$on('CreateUserCompleted',function(e,value){
            userManager.fetchAllUsers();
        });

      /*$scope.userContentTableParams = new ngTableParams(
          // merge default params with url
          angular.extend({
            page: 1,            // show first page
            count: 25,          // count per page
            sorting: {
              surname: 'asc'     // initial sorting
            }
          }, $location.search()), {
            total: $scope.users.length,
            getData: function($defer, params) {
              $location.search(params.url()); // put params in url
              $http.get('/api/v1/accounts')
                  .success(function (data) {
                    $scope.userCount = data.length || 0;
                    //$log.debug("user data: " + angular.toJson(data));
                    var orderedData = params.sorting ? $filter('orderBy')(data, params.orderBy()) : data;
                    params.total(data.length);
                    $scope.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    _.each($scope.users, function (u) {
                      if (angular.isArray(u.businesses)) {
                        u.businesses.sort();
                      }
                    });
                    $defer.resolve($scope.users);
                    $scope.stopSpin();
                  }).error(function (error) {
                    $log.info("Error getting users. " + error);
                    $scope.stopSpin();
                  });
            }
          });*/

      $scope.editUser = function (userEmail) {
        $location.url('/user?email=' + userEmail);
      };

        $scope.addUser = function () {
            $location.url('/users/'+'create');
        };

    })

    //
    // ============================= Add ========================================
    //
    .controller('UserAddController', function($scope,userManager) {
        $scope.headline = "Add New User";

        $scope.isAdd = false;

        $scope.user = {};

        $scope.usersFromManager=[];
        $scope.onMouseLeave = function(userNameFromUI){
            userManager.getUsers(function(data){
                $scope.usersFromManager=data;
            });
            angular.forEach($scope.usersFromManager,function(user){
                if(user.userName==userNameFromUI){
                    swal("oops!","Username already exist","error");
                }
            });
        };

        $scope.callBlurFunction = function(userPassword){
            $scope.user.password = userPassword;
        };

        $scope.passwordCheck = function(gotPassword){
            if (gotPassword != $scope.user.password) {
                swal("oops!", "Password should match", "error");
            }
        };

        $scope.saveButtonClicked = function(){
            userManager.createUser($scope.user,function(data){
                swal("success","User successfully added","success");
            })
        }
    })

    //
  // ======================== Edit User =====================================
  //
  .controller('UserEditController', function ($scope, $location, $http, $log, $modal, infoOverlay) {
    $scope.headline = "Edit User";
    $scope.isAdd = false;

    $scope.user = {customData: {}};
    $scope.businessesMinimal = [];

    $scope.fetchUser = function () {
      var userMail = $location.search().email;
      $http.get('/api/v1/account?email=' + userMail)
        .success(function (userData) {
          $scope.user = userData;
        })
        .error(function (err) {
          $log.error("Error fetching user.  href: " + userHref + ".  Error: " + err);
          $scope.user = {};
        });
    };

    $scope.fetchUser();

    $scope.fetchBusinessesMinimal = function () {
      $http.get('/api/v1/businessesMinimal')
        .success(function (data) {
          $scope.businessesMinimal = data;
        })
        .error(function (err) {
          $log.error("Error fetching businesses (minimal). " + err);
          $scope.businessesMinimal = [];
        });
    };

    $scope.fetchBusinessesMinimal();

    $scope.selectedBusinesses = function () {
      var selectedBusinesses = _.select($scope.businessesMinimal, function (bus) {
        return _.contains($scope.user.customData.businessIds, bus.id);
      });
      return _.sortBy(selectedBusinesses, 'displayName');
    };

    $scope.disassociateBusiness = function (businessId) {
      var idx = _.indexOf($scope.user.customData.businessIds, businessId);
      if (idx >= 0) {
        $scope.user.customData.businessIds.splice(idx, 1);
      }
      $scope.userForm.$setDirty(true);
    };

    $scope.handleAssociateBusinessesClicked = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'associated-businesses-modal.html',
        controller: 'UserAssociatedBusinessesModalController',
        size: size,
        resolve: {
          selectedIds: function () {
            return $scope.user.customData.businessIds;
          },
          businessList: function () {
            return $scope.businessesMinimal;
          }
        }
      });

      modalInstance.result.then(function (data) {
        $scope.user.customData.businessIds = data;
        $scope.userForm.$setDirty(true);
      }, function () {
        $log.debug('Modal dismissed at: ' + new Date());
      });

    };

    $scope.saveButtonClicked = function () {
      var customData = {email: $scope.user.email, businessIds: $scope.user.customData.businessIds};
      	$http.put('/api/v1/accountCustomData', customData)
        .success(function (data) {
          infoOverlay.displayInfo("Changes saved successfully");
        })
        .error(function (err) {
          var errorMsg = 'Error saving changes to account. ' + angular.toJson(err);
          $log.error(errorMsg);
          infoOverlay.displayInfo(errorMsg);
        });
    };

  })

  //
  // ============================= Modal - Conditions  ===============================
  //
  .controller('UserAssociatedBusinessesModalController', function ($scope, selectedIds, businessList, $modalInstance) {
    $scope.selectedIds = selectedIds;
    $scope.businessList = businessList;

    (function updateSelectedFlagInBusinessList() {
      if ($scope.selectedIds && $scope.selectedIds.length > 0) {
        _.each($scope.businessList, function (bus) {
          if (_.contains($scope.selectedIds, bus.id)) {
            bus.selected = true;
          }
        });
      }
    }());

    $scope.ok = function () {
      var selectedBusinessIds = [];
      _.select(businessList, function (bus) {
        if (bus.selected) {
          selectedBusinessIds.push(bus.id);
        }
      });
      $modalInstance.close(selectedBusinessIds);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });

