(function (angular) {
    "use strict";
    angular.module("starkLab.filters", [])
        .filter('interpolate', ['version', function (version) {
            return function (text) {
                return String(text).replace(/\%VERSION\%/mg, version);
            }
        }]);
})(angular);