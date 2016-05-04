(function (window, document, console, angular) {
    "use strict";

    // Declare app level module which depends on filters, and services
    var app = angular.module('starkLab',
        [
            'starkLab.controllers',
            'starkLab.directives',
            'starkLab.services',
            'starkLab.filters',
            'ngCookies'
        ]);

    
    app.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);


})(window, document, console, angular);