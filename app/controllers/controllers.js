(function (angular) {
    "use strict";
    angular.module("starkLab.controllers", [])
        .controller('TableCtrl', ['$scope', 'socketio', function ($scope, socketio) {
            $scope.counter = 'Hola!';

            $scope.rows = [];

            socketio.on('message', function (msg) {
                console.log("ANGULAR SOCKET: ", msg);

                if (Array.isArray(msg.data.time)) {
                    myLiveChart.addData([msg.data.y[0]], msg.data.x[0]);
                    console.log("live: ", myLiveChart.datasets[0].points);

                    $scope.rows.push({
                        time: msg.data.time[0],
                        x: msg.data.x[0],
                        y: msg.data.y[0],
                        vy: msg.data.vy[0]
                    });

                }
            });
        }]);
})(angular);