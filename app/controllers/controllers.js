(function (angular) {
    "use strict";
    angular.module("starkLab.controllers", [])
        .controller('GreetingController', ['$scope', 'socket', function ($scope, socket) {
            $scope.counter = 'Hola!';

            socket.on('message', function (msg) {
                console.log("ANGULAR SOCKET: ", msg);
            });
        }]);
})(angular);