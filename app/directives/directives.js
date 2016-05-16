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

                    redrawCanvas();

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

                    function drawArrowY() {
                        ctx.beginPath();
                        ctx.moveTo(20,30);
                        ctx.lineTo(30,30);
                        ctx.lineTo(25,20);
                        ctx.fill();
                    }

                    function drawArrowX() {
                        ctx.beginPath();
                        ctx.moveTo(585,275);
                        ctx.lineTo(575,280);
                        ctx.lineTo(575,270);
                        ctx.fill();
                    }

                    function drawBall() {
                        ctx.beginPath();
                        ctx.arc(x + 25, y + 25, 5, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                    
                    function drawLegend() {
                        ctx.beginPath();
                        ctx.font = "15px Arial";
                        ctx.fillText("y [m]", 0, 12);
                        ctx.fillText("x [m]", 568, 295);
                    }

                    function drawPositionX() {
                        ctx.beginPath();
                        ctx.moveTo(25 + x, 30);
                        ctx.lineTo(25 + x, 20);
                        ctx.strokeStyle = "black";
                        ctx.stroke();
                    }

                    function drawPositionXValue() {
                        ctx.beginPath();
                        ctx.font = "10px Arial";

                        if (x < 100) {
                            ctx.fillText(Math.floor(x), 20 + x, 290);
                        } else {
                            ctx.fillText(Math.floor(x), 17 + x, 290);
                        }

                    }

                    function drawPositionY() {
                        ctx.beginPath();
                        ctx.moveTo(20, 25 + y);
                        ctx.lineTo(30, 25 + y);
                        ctx.strokeStyle = "black";
                        ctx.stroke();
                    }

                    function drawPositionYValue() {
                        ctx.beginPath();
                        ctx.font = "10px Arial";

                        if (y < 100) {
                            ctx.fillText(Math.floor(y), 5, 278 - y);
                        } else {
                            ctx.fillText(Math.floor(y), 0, 278 - y);
                        }
                    }

                    function redrawCanvas() {
                        if (inputData === 'undefined' && update < inputData.x.length) {
                            x = inputData.x[update];
                            y = inputData.y[update];
                            update++;
                        } else {
                            $interval.cancel(timeoutId);
                        }

                        // transform x,y to down - default is up
                        // http://stackoverflow.com/questions/4335400/in-html5-canvas-can-i-make-the-y-axis-go-up-rather-than-down
                        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/transform
                        ctx.transform(1, 0, 0, -1, 0, canvas.height);

                        ctx.clearRect(0, 0, 600, 300);
                        drawAxis(ctx);
                        drawBall(ctx);
                        drawPositionX();
                        drawPositionY();

                        // reset transform to 1 0 0 1 0 0
                        ctx.resetTransform();
                        drawPositionXValue();
                        drawPositionYValue();
                        drawArrowY();
                        drawArrowX();
                        drawLegend();
                    }

                    scope.redrawCanvas = function (a, b) {
                        x = a;
                        y = b;

                        ctx.transform(1, 0, 0, -1, 0, canvas.height);
                        ctx.clearRect(0, 0, 600, 300);
                        drawAxis(ctx);
                        drawBall(ctx);
                        drawPositionX();
                        drawPositionY();
                        ctx.resetTransform();
                        drawPositionXValue();
                        drawPositionYValue();
                        drawArrowY();
                        drawArrowX();
                        drawLegend();
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
                template: '<div class="ui-graph-master"><div class="ui-graph-left">y [m]</div><canvas width="600" height="300"></canvas><div class="ui-graph-bottom">x [m]</div></div>',
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