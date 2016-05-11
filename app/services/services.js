(function (angular) {
    "use strict";
    angular.module("starkLab.services", [])
        .factory("socketio", ['$rootScope', function ($rootScope) {
            var socket = io.connect("http://localhost:4000");
            return {
                on: function (eventName, callback) {
                    socket.on(eventName, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            callback.apply(socket, args);
                        });
                    });
                },
                emit: function (eventName, data, callback) {
                    socket.emit(eventName, data, function () {
                        var args = arguments;
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args);
                            }
                        });
                    })
                }
            };
        }])
        .factory("ProjectileDataObject", ['$http', function ($http) {
            function ProjectileDataObject(user, time, x, y, vy) {
                this.user = user;
                this.experiment = 'projectile';
                this.executed = new Date();
                this.time = time;
                this.x = x;
                this.y = y;
                this.vy = vy;
            }

            // public function
            ProjectileDataObject.prototype.NazovMetody = function () {

            };

            return ProjectileDataObject;
        }]);
})(angular);