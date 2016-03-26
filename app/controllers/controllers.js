(function (angular) {
    "use strict";
    angular.module("starkLab.controllers", [])
        .controller('TableCtrl', ['$scope', 'socketio', function ($scope, socketio) {
            $scope.hideFullTable = true;

            $scope.rows = [];

            $scope.data = [];

            $scope.fullData = [];

            socketio.on('message', function (msg) {
                console.log("ANGULAR SOCKET: ", msg);

                if (msg.result.status === "running" && Array.isArray(msg.result.data.time)) {

                    $scope.data.push(msg.result.data);

                    myLiveChart.addData([msg.result.data.y[0]], msg.result.data.x[0]);
                    //console.log("live: ", myLiveChart.datasets[0].points);

                    $scope.rows.push({
                        time: msg.result.data.time[0],
                        x: msg.result.data.x[0],
                        y: msg.result.data.y[0],
                        vy: msg.result.data.vy[0]
                    });

                    //console.log("DATA ALL: ", $scope.data);

                } else if (msg.result.status === "stopped") {
                    console.log("STOPPED");
                    for (var i = 0; i < $scope.data.length; i++) {
                        for (var j = 0; j < $scope.data[i].time.length; j++) {
                            $scope.fullData.push({
                                time: $scope.data[i].time[j],
                                x: $scope.data[i].x[j],
                                y: $scope.data[i].y[j],
                                vy: $scope.data[i].vy[j]
                            });
                        }
                    }

                    $scope.hideFullTable = false;
                    console.log("Data full: ", $scope.fullData);
                }
            });

            $scope.showFullDataTable = function () {
                $scope.fullDataTableAvailable = true;
                console.log("clicked");
            };
        }]);
})(angular);