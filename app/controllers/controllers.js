(function (angular) {
    "use strict";
    angular.module("starkLab.controllers", [])
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

            console.log("cookies: ", loggedUser);

            socketio.on('message:' + loggedUser, function (msg) {

                // register interval when array from matlab is empty
                if (msg.result.status === "running" && !angular.isArray(msg.result.data.time)) {
                    console.log("first data");

                    timeoutId = $interval(function () {
                        console.log("concatedXData: ", update, concatedXData, concatedXData.length);

                        // run animation when some data is available
                        if (concatedXData && concatedXData.length > 200) {
                            if (update + 20 > concatedXData.length) {
                                myLiveChart.addData([concatedYData[concatedYData.length - 1]], concatedXData[concatedXData.length - 1]);
                                $scope.redrawCanvas(concatedXData[concatedXData.length - 1], concatedYData[concatedYData.length - 1]);

                                $scope.rows.push({
                                    x: concatedXData[concatedXData.length - 1],
                                    y: concatedYData[concatedYData.length - 1],
                                    vy: concatedVyData[concatedVyData.length - 1],
                                    time: concatedTimeData[concatedTimeData.length - 1],
                                });

                                $interval.cancel(timeoutId);
                            } else {
                                myLiveChart.addData([concatedYData[update]], concatedXData[update]);
                                $scope.redrawCanvas(concatedXData[update], concatedYData[update]);
                                $scope.rows.push({
                                    x: concatedXData[update],
                                    y: concatedYData[update],
                                    vy: concatedVyData[update],
                                    time: concatedTimeData[update],
                                });
                                update = update + 20;
                            }
                        }

                    }, 200);
                }

                if (msg.result.status === "running" && angular.isArray(msg.result.data.time)) {

                    $scope.canvasRun = true;

                    console.log("partial data: ", msg.result.data.x);
                    concatedTimeData = concatedTimeData.concat(msg.result.data.time);
                    concatedXData = concatedXData.concat(msg.result.data.x);
                    concatedYData = concatedYData.concat(msg.result.data.y);
                    concatedVyData = concatedVyData.concat(msg.result.data.vy);

                } else if (msg.result.status === "stopped") {
                    console.log("STOPPED");

                    var obj = new ProjectileDataObject(loggedUser, concatedTimeData, concatedXData, concatedYData, concatedVyData);

                    // FIXME: uncoment to save to database
                    insertDataToDatabase(obj);
                    // need cleanup after insert

                    console.log("Data full: ", obj);
                }
            });

            function insertDataToDatabase(obj) {
                console.log("insertAllData started...");

                // then function if sends correctly
                $http.post('/mongo/insert/one', obj);
            }

        }])
        .controller("ResultsCtrl", ["$scope", "$http", "$cookies", "$interval", function ($scope, $http, $cookies, $interval) {
            console.log("ResultsCtrl started...");

            $scope.dashboardAvailable = false;

            $scope.results = [];

            $scope.detailResult = [];

            $scope.sampling = 1;

            $http.get('/mongo/' + $cookies.get('username') + '/projectile').then(function (response) {
                console.log("Mongo get all results: ", response.data);

                $scope.results = response.data;

            }, function (response) {
                console.log("error: ", response);
            });

            $scope.showDetails = function (detail) {
                console.log("detail ID: ", detail);

                $scope.detailResult = detail;
                $scope.detailData = [];

                for (var i = 0; i < $scope.detailResult.time.length; i++) {
                    $scope.detailData.push({
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
                for (var i = 0; i < array.length; i++) {
                    // pocet rozumnych cisel pre vzorkovanie, aby posledna hodnota y bola blizko 0
                    var num = (array.length - ( Math.floor(array.length / i) * i));
                    // i by malo byt mensie ako 1/3 z pola, cize aby sa dali vykreslit aspon 3 vysledky
                    if (num < 6 && i < (array.length / 3)) {
                        $scope.data.availableOptions.push({id: i, name: i});
                    }
                }

                // $http.get('/mongo/' + $cookies.get('username') + '/projectile/' + detail._id).then(function (response) {
                //     console.log("Mongo get selected result: ", response.data);
                //
                //     //$scope.results = response.data;
                //
                // }, function (response) {
                //     console.log("error: ", response);
                // });
            };

            $scope.startGraph = function () {

                var timeoutId;
                var timeoutNumber;
                var update = 0;

                var sampling = 1;
                var timeCount = 0;
                var timeFinished = 0;

                console.log("select: ", typeof $scope.data.repeatSelect);

                if ($scope.data.repeatSelect) {
                    sampling = parseInt($scope.data.repeatSelect); //$scope.sampling;
                }

                if ($scope.detailResult && $scope.detailResult.time) {
                    timeCount = $scope.detailResult.time.length;
                    timeFinished = $scope.detailResult.time[timeCount - 1];

                    // vypocet, aby vzdy trvala simulacia rovnako, nezalezi na cislo vzorkovania
                    timeoutNumber = (timeFinished / (timeCount / sampling)) * timeCount;
                }


                timeoutId = $interval(function () {

                    //console.log("run canvas", $scope.sampling, $scope.detailResult, $scope.detailResult.time[$scope.detailResult.time.length - 1], $scope.detailResult.time.length);
                    if (update < $scope.detailResult.x.length) {
                        //console.log("run canvas int inside", $scope.detailResult.y[update]);
                        myResultsChart.addData([$scope.detailResult.y[update]], $scope.detailResult.x[update]);

                        update = update + sampling;
                    } else {
                        $interval.cancel(timeoutId);
                    }

                }, timeoutNumber);


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

                    //console.log("run canvas", $scope.sampling, $scope.detailResult, $scope.detailResult.time[$scope.detailResult.time.length - 1], $scope.detailResult.time.length);
                    if (update < $scope.detailResult.x.length) {
                        //console.log("run canvas int inside", $scope.detailResult.y[update]);
                        $scope.redrawCanvas($scope.detailResult.x[update], $scope.detailResult.y[update]);
                        update = update + sampling;
                    } else {
                        $interval.cancel(timeoutId);
                    }

                }, timeoutNumber);
            };

        }])
        .controller("SectionsCtrl", ["$scope", "$cookies", function ($scope, $cookies) {
            console.log("SectionsCtrl started...");
            $scope.loggedUser = $cookies.get('username');

            this.selected = 0;
            this.headerName = "Simulácia šikmého vrhu";

            this.selectSection = function (selected, headerName) {
                this.selected = selected;
                this.headerName = headerName;
            };

            this.isSelected = function (checkNumber) {
                return this.selected === checkNumber;
            };
        }])
        .controller("SimulationCtrl", ["$scope", "$http", function ($scope, $http) {
            console.log("SimulationCtrl started...");

            $scope.runMatlabWithParams = function (v0, alfa_deg) {

                console.log("scope simulation: ", $scope);

                if (v0 && alfa_deg) {
                    var data = {
                        'v0': v0,
                        'alfa_deg' : alfa_deg
                    };

                    $http.post("/matlab/run", data).then(function (response) {
                        console.log("Express said: ", response.data);

                        // vybrat prvy tab kde sa zobrazia data
                        $scope.$parent.section.selectSection(1, 'Realtime údaje');

                        // nastavenie simulacie na spustenu a schovat dalsie spustenie pre usera kym sa neskoci prva

                    }, function (response) {
                        console.log("error: ", response);
                    });
                }
            };


        }]);
})(angular);