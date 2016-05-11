(function (document, angular) {
    'use strict';
    angular.module('starkLab.directives', [])
        .directive('uiProjectile', ['$interval', function ($interval) {
            return {
                restrict: 'E',
                template: '<canvas width="600" height="300">Tento prehliadac nepodporuje canvas.</canvas>',

                link: function (scope, element, attrs, ngModelCtrl) {
                    console.log('Start directive uiProjectile');
                    var format,
                        timeoutId;

                    // there is no ng-model in directive so data are pushed real-time
                    var inputData = scope.detailResult;

                    var x = 0;
                    var y = 0;
                    var update = 0;

                    var canvas = element.find('canvas')[0];
                    var ctx = canvas.getContext('2d');

                    // transform x,y to down - default is up
                    // http://stackoverflow.com/questions/4335400/in-html5-canvas-can-i-make-the-y-axis-go-up-rather-than-down
                    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
                    ctx.transform(1, 0, 0, -1, 0, canvas.height);

                    redrawCanvas();


                    // asi by bolo lepsie presunut funkcie do controlleru pre tuto directivu
                    function drawAxis() {
                        // draw x line
                        ctx.beginPath();
                        ctx.moveTo(25, 25);
                        ctx.lineTo(575, 25);
                        ctx.stroke();

                        // draw y line
                        ctx.beginPath();
                        ctx.moveTo(25, 25);
                        ctx.lineTo(25, 275);
                        ctx.stroke();
                    }

                    function drawBall() {
                        ctx.beginPath();

                        ctx.arc(x + 25, y + 25, 5, 0, 2 * Math.PI);
                        ctx.fill();
                    }


                    function redrawCanvas() {
                        if (inputData === 'undefined' && update < inputData.x.length) {
                            x = inputData.x[update];
                            y = inputData.y[update];
                            update++;
                        } else {
                            $interval.cancel(timeoutId);
                        }

                        ctx.clearRect(0, 0, 600, 300);
                        drawAxis(ctx);
                        drawBall(ctx);
                    }

                    scope.redrawCanvas = function (a, b) {
                        x = a;
                        y = b;

                        ctx.clearRect(0, 0, 600, 300);
                        drawAxis(ctx);
                        drawBall(ctx);
                    };

                    element.on('$destroy', function () {
                        $interval.cancel(timeoutId);
                    });

                    scope.startAnimation = function () {
                        timeoutId = $interval(redrawCanvas(), 0.1);
                    };
                }
            };

        }])
        .directive('uiTable', ['$interval', function ($interval) {
            var uniqueId = 1;
            return {
                restrict: 'E',
                templateUrl: './templates/table.html',
                link: {
                    post: function (scope, element, attrs, ctrl) {
                        scope.uniqueId = 'export-' + uniqueId++;

                        // scope.$watchCollection('rows', function (val) {
                        //     if (val) {
                        //         element[0].scrollIntoView(false);
                        //     }
                        // });
                    }
                }
            };
        }])
        .directive('uiGraph', ['$interval', function ($interval) {
            return {
                restrict: 'E',
                template: '<canvas id="results-chart" width="600" height="300"></canvas>',
                scope: {

                },
                link: {
                    post: function (scope, element, attrs, ctrl) {

                        var canvasResults = element.find('canvas')[0],
                            ctxResults = canvasResults.getContext('2d'),
                            startingDataResults = {
                                labels: [1],
                                datasets: [
                                    {
                                        fillColor: 'rgba(220,220,220,0.2)',
                                        strokeColor: 'rgba(220,220,220,1)',
                                        pointColor: 'rgba(220,220,220,1)',
                                        pointStrokeColor: '#fff',
                                        data: {}
                                    }
                                ]
                            },
                            options = {
                                responsive: false,
                                animationEasing: 'easeOutBounce',
                                animationSteps: 15,
                                scaleGridLineColor: 'lightgray',
                                maintainAspectRatio: true
                            };

                        if (attrs['type'] == 'results') {
                            scope.$parent.myResultsChart = new Chart(ctxResults).Line(startingDataResults, options);
                        } else if (attrs['type'] == 'realtime') {
                            scope.$parent.myLiveChart = new Chart(ctxResults).Line(startingDataResults, options);
                        }

                        scope.$parent.resetCanvas = function () {
                            var ctx = canvasResults.getContext('2d');

                            var data = startingDataResults = {
                                    labels: [1],
                                    datasets: [
                                        {
                                            fillColor: 'rgba(220,220,220,0.2)',
                                            strokeColor: 'rgba(220,220,220,1)',
                                            pointColor: 'rgba(220,220,220,1)',
                                            pointStrokeColor: '#fff',
                                            data: {}
                                        }
                                    ]
                                };

                            if (attrs['type'] == 'results') {
                                scope.$parent.myResultsChart = new Chart(ctx).Line(data, options);
                            } else if (attrs['type'] == 'realtime') {
                                scope.$parent.myLiveChart = new Chart(ctx).Line(data, options);
                            }
                        };

                        scope.$parent.showCanvas = function (x, y) {
                            var ctx = canvasResults.getContext('2d');

                            var data = startingDataResults = {
                                labels: x,
                                datasets: [
                                    {
                                        fillColor: 'rgba(220,220,220,0.2)',
                                        strokeColor: 'rgba(220,220,220,1)',
                                        pointColor: 'rgba(220,220,220,1)',
                                        pointStrokeColor: '#fff',
                                        data: y
                                    }
                                ]
                            };

                            if (attrs['type'] == 'results') {
                                scope.$parent.myResultsChart = new Chart(ctx).Line(data, options);
                            } else if (attrs['type'] == 'realtime') {
                                scope.$parent.myLiveChart = new Chart(ctx).Line(data, options);
                            }

                        };

                    }
                }
            };
        }]);
})(document, angular);