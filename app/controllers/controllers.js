(function (angular) {
    'use strict';
    angular.module('starkLab.controllers', [])
        .controller('TableCtrl', ['$scope', '$http', '$cookies', '$interval', 'socketio', 'ProjectileDataObject', function ($scope, $http, $cookies, $interval, socketio, ProjectileDataObject) {
            $scope.hideFullTable = true;

            $scope.rows = [];

            $scope.data = [];

            var concatedTimeData = [];
            var concatedXData = [];
            var concatedYData = [];
            var concatedVyData = [];

            $scope.fullData = [];

            var timeoutId;
            var update = 0;

            var loggedUser = $cookies.get('username');

            socketio.on('message:' + loggedUser, function (msg) {

                // register interval when array from matlab is empty
                if (msg.result.status === 'running' && !angular.isArray(msg.result.data.time)) {
                    console.log('Simulation status running...');

                    timeoutId = $interval(function () {

                        // run animation when some data is available
                        if (concatedXData && concatedXData.length > 300) {
                            if (update + 20 >= concatedXData.length) {
                                console.log('OUT');
                                $scope.myLiveChart.addData([concatedYData[concatedYData.length - 1]], concatedXData[concatedXData.length - 1]);
                                $scope.redrawCanvas(concatedXData[concatedXData.length - 1], concatedYData[concatedYData.length - 1]);

                                $scope.rows.push({
                                    x: concatedXData[concatedXData.length - 1],
                                    y: concatedYData[concatedYData.length - 1],
                                    vy: concatedVyData[concatedVyData.length - 1],
                                    time: concatedTimeData[concatedTimeData.length - 1]
                                });

                                $interval.cancel(timeoutId);
                            } else {
                                $scope.myLiveChart.addData([concatedYData[update]], '');
                                $scope.redrawCanvas(concatedXData[update], concatedYData[update]);
                                $scope.rows.push({
                                    x: concatedXData[update],
                                    y: concatedYData[update],
                                    vy: concatedVyData[update],
                                    time: concatedTimeData[update]
                                });
                                update = update + 20;
                            }
                        }

                    }, 200);
                }

                if (msg.result.status === 'running' && angular.isArray(msg.result.data.time)) {

                    if ($scope.$parent.showOverlay) {
                        $scope.$parent.showOverlay = false;
                    }

                    concatedTimeData = concatedTimeData.concat(msg.result.data.time);
                    concatedXData = concatedXData.concat(msg.result.data.x);
                    concatedYData = concatedYData.concat(msg.result.data.y);
                    concatedVyData = concatedVyData.concat(msg.result.data.vy);

                } else if (msg.result.status === 'stopped') {
                    console.log('Simulation status stopped...');

                    var obj = new ProjectileDataObject(loggedUser, concatedTimeData, concatedXData, concatedYData, concatedVyData);

                    $http.post('/mongo/insert/one', obj);
                }
            });
        }])
        .controller('ResultsCtrl', ['$scope', '$http', '$cookies', '$interval', function ($scope, $http, $cookies, $interval) {
            $scope.dashboardAvailable = false;
            $scope.results = [];
            $scope.detailResult = [];
            $scope.sampling = 1;

            $http.get('/mongo/' + $cookies.get('username') + '/projectile').then(function (response) {
                $scope.results = response.data;

            }, function (response) {
                console.log('error: ', response);
            });

            $scope.showDetails = function (detail) {
                $scope.detailResult = detail;
                $scope.rows = [];

                var i;
                for (i = 0; i < $scope.detailResult.time.length; i++) {
                    $scope.rows.push({
                        x: $scope.detailResult.x[i],
                        y: $scope.detailResult.y[i],
                        vy: $scope.detailResult.vy[i],
                        time: $scope.detailResult.time[i]
                    });
                }

                $scope.dashboardAvailable = true;

                $scope.data = {
                    repeatSelect: 1,
                    availableOptions: []
                };

                var array = $scope.detailResult.y;
                var numId = 0;
                for (i = 0; i < array.length; i++) {
                    // pocet rozumnych cisel pre vzorkovanie, aby posledna hodnota y bola blizko 0
                    var num = (array.length - ( Math.floor(array.length / i) * i));
                    // i by malo byt mensie ako 1/3 z pola, cize aby sa dali vykreslit aspon 3 vysledky
                    if (num < 6 && i < (array.length / 3)) {
                        $scope.data.availableOptions.push({id: i, name: i});
                    }
                }

                setTimeout(function () {
                    var element = document.getElementById('simulation-view');
                    element.scrollIntoView();
                }, 500);
            };

            $scope.removeSimulation = function (sim) {
                var index = $scope.results.indexOf(sim);
                var simId = sim._id;

                $scope.results.splice(index, 1);

                $http.delete('/mongo/delete/' + simId).then(function (response) {
                }, function (response) {
                });
            };

            $scope.startGraph = function () {
                $scope.refreshData();

                var timeoutId;
                var timeoutNumber;
                var update = 0;

                var sampling = 1;
                var timeCount = 0;
                var timeFinished = 0;

                if ($scope.data.repeatSelect) {
                    sampling = parseInt($scope.data.repeatSelect);
                }

                if ($scope.detailResult && $scope.detailResult.time) {
                    timeCount = $scope.detailResult.time.length;
                    timeFinished = $scope.detailResult.time[timeCount - 1];

                    // vypocet, aby vzdy trvala simulacia rovnako, nezalezi na cislo vzorkovania
                    timeoutNumber = (timeFinished / (timeCount / sampling)) * timeCount;
                }


                timeoutId = $interval(function () {
                    if (update < $scope.detailResult.x.length) {
                        $scope.myResultsChart.addData([$scope.detailResult.y[update]], $scope.detailResult.x[update]);

                        update = update + sampling;
                    } else {
                        $interval.cancel(timeoutId);
                    }

                }, timeoutNumber);
            };

            $scope.showGraph = function () {

                $scope.refreshData();

                var sampling = 1;
                var tmpX = [];
                var tmpY = [];

                if ($scope.data.repeatSelect) {
                    sampling = parseInt($scope.data.repeatSelect);

                    var i;
                    if ($scope.data.repeatSelect > 25) {
                        for (i = 0; i < $scope.detailResult.x.length; i = i + sampling) {
                            tmpX.push($scope.detailResult.x[i]);
                            tmpY.push($scope.detailResult.y[i]);
                        }
                    } else {
                        for (i = 0; i < $scope.detailResult.x.length; i = i + sampling) {
                            tmpX.push('');
                            tmpY.push($scope.detailResult.y[i]);
                        }
                    }

                }

                $scope.showCanvas(tmpX, tmpY);
            };

            $scope.startAnimation2 = function () {
                var timeoutId;
                var timeoutNumber;
                var update = 0;

                var sampling = 1;
                var timeCount = 0;
                var timeFinished = 0;

                if ($scope.data.repeatSelect) {
                    sampling = parseInt($scope.data.repeatSelect);
                }

                if ($scope.detailResult && $scope.detailResult.time) {
                    timeCount = $scope.detailResult.time.length;
                    timeFinished = $scope.detailResult.time[timeCount - 1];

                    // vypocet, aby vzdy trvala simulacia rovnako, nezalezi na cislo vzorkovania
                    timeoutNumber = (timeFinished / (timeCount / sampling)) * timeCount;
                }

                timeoutId = $interval(function () {
                    if (update < $scope.detailResult.x.length) {
                        $scope.redrawCanvas($scope.detailResult.x[update], $scope.detailResult.y[update]);
                        update = update + sampling;
                    } else {
                        $interval.cancel(timeoutId);
                    }

                }, timeoutNumber);
            };

            $scope.refreshData = function () {
                $scope.myResultsChart.destroy();
                $scope.myResultsChart.clear();

                console.log('scope ctrl: ', $scope);
                $scope.resetCanvas();
            };

            $scope.exportHTMLTable = function () {
                $('#export-2').tableToCSV($scope.detailResult.executed);
            };
        }])
        .controller('SectionsCtrl', ['$scope', '$cookies', function ($scope, $cookies) {
            $scope.loggedUser = $cookies.get('username');
            $scope.showOverlay = false;

            this.selected = 0;
            this.headerName = 'Simulácia šikmého vrhu';

            this.selectSection = function (selected, headerName) {
                this.selected = selected;
                this.headerName = headerName;
            };

            this.isSelected = function (checkNumber) {
                return this.selected === checkNumber;
            };
        }])
        .controller('SimulationCtrl', ['$scope', '$http', function ($scope, $http) {
            $scope.runMatlabWithParams = function (v0, alfa_deg) {
                if (v0 && alfa_deg) {
                    var data = {
                        'v0': v0,
                        'alfa_deg': alfa_deg
                    };

                    $http.post('/matlab/run', data).then(function (response) {

                        // vybrat prvy tab kde sa zobrazia data
                        $scope.$parent.section.selectSection(1, 'Realtime údaje');
                        $scope.$parent.showOverlay = true;

                    }, function (response) {
                        console.log('error: ', response);
                    });
                }
            };


        }]);
})(angular);