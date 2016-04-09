(function (angular) {
    "use strict";
    angular.module("starkLab.controllers", [])
        .controller('TableCtrl', ['$scope', '$http', '$cookies', 'socketio', 'ProjectileDataObject', function ($scope, $http, $cookies, socketio, ProjectileDataObject) {
            $scope.hideFullTable = true;

            $scope.rows = [];

            $scope.data = [];

            $scope.fullData = [];




            //insertAllData();



            var loggedUser = $cookies.get('username');
            console.log("cookies: ", loggedUser);

            socketio.on('message', function (msg) {
                console.log("ANGULAR SOCKET: ", msg);

                if (msg.result.status === "running" && Array.isArray(msg.result.data.time)) {

                    $scope.canvasRun = true;

                    $scope.data.push(msg.result.data);

                    myLiveChart.addData([msg.result.data.y[0]], msg.result.data.x[0]);
                    //console.log("live: ", myLiveChart.datasets[0].points);

                    $scope.rows.push({
                        time: msg.result.data.time[0],
                        x: msg.result.data.x[0],
                        y: msg.result.data.y[0],
                        vy: msg.result.data.vy[0]
                    });
                    
                    //$scope.cnvsX = msg.result.data.x[0];
                    //$scope.cnvsY = msg.result.data.y[0];
                    
                    $scope.redrawCanvas(msg.result.data.x[0], msg.result.data.y[0]);

                    //console.log("DATA ALL: ", $scope.data);

                } else if (msg.result.status === "stopped") {
                    console.log("STOPPED");

                    $scope.canvasRun = false;

                    var time = [],
                        x = [],
                        y = [],
                        vy = [];


                    for (var i = 0; i < $scope.data.length; i++) {
                        for (var j = 0; j < $scope.data[i].time.length; j++) {
                            time.push($scope.data[i].time[j]);
                            x.push($scope.data[i].x[j]);
                            y.push($scope.data[i].y[j]);
                            vy.push($scope.data[i].vy[j]);

                            $scope.fullData.push({
                                time: $scope.data[i].time[j],
                                x: $scope.data[i].x[j],
                                y: $scope.data[i].y[j],
                                vy: $scope.data[i].vy[j]
                            });
                        }
                    }

                    // var obj = {
                    //     user: loggedUser,
                    //     experiment: 'projectile',
                    //     executed: new Date(),
                    //     time: time,
                    //     x: x,
                    //     y: y,
                    //     vy: vy
                    // };

                    var obj = new ProjectileDataObject(loggedUser, time, x, y, vy);

                    insertDataToDatabase(obj);
                    // need cleanup after insert

                    // added last x data to complete chart
                    myLiveChart.addData([0], $scope.fullData[$scope.fullData.length - 1].x);

                    $scope.hideFullTable = false;
                    console.log("Data full: ", $scope.fullData);
                }
            });

            $scope.showFullDataTable = function () {
                $scope.fullDataTableAvailable = true;
                console.log("clicked");
            };

            function insertDataToDatabase(obj) {
                console.log("insertAllData started...");
                
                // then function if sends correctly
                $http.post('/mongo/insert/all', obj);
            }
            
        }]);
})(angular);