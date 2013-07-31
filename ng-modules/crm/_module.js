﻿angular.module('crm', ['ui.state', 'ui.select2', 'ui.date',  'crm.templates'])
    .config(['$routeProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider',
        function($routeProvider, $locationProvider, $stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/contracts');

            var contractList = {
                name: 'page2C.contractList',
                url: '/contracts',
                views: {
                    'sidebar': {
                        templateUrl: '/ng-modules/crm/contracts/list/contractListFilter.tpl.html'
                    },
                    'content': {
                        templateUrl: '/ng-modules/crm/contracts/list/contractListGrid.tpl.html'
                    }
                }
            },

                contractCommonTab = {
                    name: 'tabPage1C.contractCommonTab',
                    url: '/contracts/:contractid/common',
                    views: {
                        'tabbar': {
                            template: '<div ng-controller="contractTabsCtrl" tabbar="0"></div>'
                        },
                        'content': {
                            templateUrl: '/ng-modules/crm/contracts/commonTab/contractCommonTab.tpl.html'
                        }
                    }
                },

                contractTasksTab = {
                    name: 'tabPage2C.contractTasksTab',
                    url: '/contracts/:contractid/tasks',
                    views: {
                        'tabbar': {
                            template: '<div ng-controller="contractTabsCtrl" tabbar="1"></div>'
                        },
                        'sidebar': {
                            templateUrl: '/ng-modules/crm/contracts/tasksTab/contractTasksTabFilter.tpl.html'
                        },
                        'content': {
                            templateUrl: '/ng-modules/crm/contracts/tasksTab/contractTasksTabGrid.tpl.html'
                        }
                    }
                };

            $stateProvider
                .state(contractList)
                .state(contractCommonTab)
                .state(contractTasksTab);

        }
    ])
    .service("contractService", ['$q','$http',
        function($q, $http) {
            this.getContracts = function(filter) {
                var deferred = $q.defer();
                 $http.post("/api/v1", {
                    action: "get",
                    model: "project.contracts",
                    project: window.app.project,
                    filter: filter
                }).success(function (data, status, headers, config) {
                     deferred.resolve(data);
                }).error(function (data, status, headers, config) {
                    // TODO
                });
                return deferred.promise;
            };
        }
    ])


    .controller('contractListGridCtrl', ['$scope', 'contractService', 'pageConfig',
        function($scope, $contractService, $pageConfig) {
            $pageConfig.setConfig({
                breadcrumbs: [{
                        name: "Projects",
                        url: '/projects'
                    },{
                        name: window.app.project,
                        url: '/projects/'+window.app.project
                    },{
                        name: 'Contracts',
                        url: '#!/contracts'
                    }]
            });

            $scope.contracts=[];

            $contractService.getContracts({}).then(function (res) {
                $scope.contracts =  res.contracts;
            });
        }
    ])
    .controller('contractTabsCtrl', ['$scope', '$stateParams',
        function($scope, $stateParams) {
            $scope.tabs = [{
                name: 'Common',
                url: '#!/contracts/' + $stateParams.contractid + '/common'
            }, {
                name: 'Tasks',
                url: '#!/contracts/' + $stateParams.contractid + '/tasks'
            }];
        }
    ])
    .controller('contractCommonTabCtrl', ['$scope', '$stateParams', 'pageConfig',
        function($scope, $stateParams, $pageConfig) {
            var contractid = $stateParams.contractid;

            $pageConfig.setConfig({
                breadcrumbs: [{
                        name: "Projects",
                        url: '/projects'
                    },{
                        name: window.app.project,
                        url: '/projects/'+window.app.project
                    },{
                        name: 'contracts',
                        url: '#!/contracts'
                    }, {
                        name: contractid,
                        url: '#!/contracts/' + contractid + '/common'
                    }

                ]
            });
            $scope.contractid = contractid;
        }
    ])

// Edit
.controller('contractItemCtrl', ['$scope', '$q', '$timeout',
    function($scope, $q, $timeout) {

        var categories = [{
            id: 1,
            text: 'cat'
        }, {
            id: 2,
            text: 'dog'
        }, {
            id: 3,
            text: 'pet'
        }, {
            id: 4,
            text: 'rat'
        }, {
            id: 5,
            text: 'fat'
        }, {
            id: 6,
            text: 'zet'
        }];
        var contract = {
            name: 'contract-123',
            signedAt: new Date(2010, 01, 01),
            category: [{
                id: 1,
                text: 'cat'
            }]
        };

        $scope.categoryOptions = {
            multiple: true,
            query: function(query) {
                $timeout(function() {
                    var data = {
                        results: categories
                    };
                    query.callback(data);
                }, 400);
            }
        };
        $scope.mode = 'View';
        $scope.contract = angular.copy(contract);

        $scope.edit = function() {
            $scope.mode = 'Edit';
        };
        $scope.cancel = function() {
            $scope.contract = angular.copy(contract);
            $scope.mode = 'View';
        };
        $scope.update = function() {
            if (contractForm) {
                contract = angular.copy($scope.contract);
            }
            $scope.mode = 'View';
        };
        $scope.isChanged = function() {
            return !angular.equals($scope.contract, contract);
        };
    }
])
    .directive('requiredMultiple', function() {
        function isEmpty(value) {
            return angular.isUndefined(value) || (angular.isArray(value) && value.length === 0) || value === '' || value === null || value !== value;
        }

        return {
            require: '?ngModel',
            link: function(scope, elm, attr, ctrl) {
                if (!ctrl) {
                    return;
                }
                attr.required = true; // force truthy in case we are on non input element

                var validator = function(value) {
                    if (attr.required && (isEmpty(value) || value === false)) {
                        ctrl.$setValidity('required', false);
                        return;
                    } else {
                        ctrl.$setValidity('required', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('required', function() {
                    validator(ctrl.$viewValue);
                });
            }
        };
    })
    .directive('fakeServerValidation', ['$timeout',
        function($timeout) {
            return {
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                    var validator = function(viewValue) {
                        //fake call to server validation method
                        $timeout(function() {
                            if (viewValue && viewValue.indexOf('-') > 0) {
                                // it is valid
                                ctrl.$setValidity('fsv', true);
                                //return viewValue;
                            } else {
                                // it is invalid, return undefined (no model update)
                                ctrl.$setValidity('fsv', false);
                                //return viewValue;
                            }
                        }, 500);
                        return viewValue; //return must be synchronous because piped validators needs viewValue
                    };

                    ctrl.$formatters.push(validator);
                    ctrl.$parsers.unshift(validator);
                }
            };
        }
    ]);