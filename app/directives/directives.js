(function (document, angular) {
    "use strict";
    angular.module("starkLab.directives", [])
        .directive('uiProjectile', ['$interval', 'dateFilter', function ($interval, dateFilter) {
            return {
                restrict: 'E',
                template: '<canvas width="600" height="300">Tento prehliadac nepodporuje canvas.</canvas>',
                // scope: {
                //     ngModel: '@'
                // },

                link: function(scope, element, attrs, ngModelCtrl) {
                    console.log("Start directive uiProjectile");
                    var format,
                        timeoutId;

                    console.log("Projectile canvas scope: ", scope.$parent, scope);
                    
                    // there is no ng-model in directive so data are pushed real-time
                    var inputData = scope.detailResult;

                    //if (scope.$parent.detailResult)


                    var x = 0;
                    var y = 0;
                    var update = 0;

                    // Parametre pre model so sikmym vrhom
                    var v0      = 50;    // [m/s] pociatocna rychlost v smere hodu
                    var alfa_deg= 60;    // [deg] uhol vrhu v stupnoch
                    var g = 9.81;        // [m/s^2] gravitacne zrychlenie
                    var alfa_rad = alfa_deg*2* Math.PI/360;   //% [rad] uhol vrhu v radianoch
                    var cas = 0;

                    //var canvas = document.getElementById("projectile"); // document.getElementById('projectile');
                    var canvas = element.find('canvas')[0];
                    console.log("get element ", canvas);
                    console.log("angular element ", element.find('canvas')[0]);


                    //if (canvas.getContext) {

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
                        //x += vx;
                        //y += vy;

                        ctx.beginPath();

                        // var retX = countX();
                        // var retY = countY();
                        //
                        // console.log("x, y: ", retX, retY);

                        // if (retY <= 0) {
                        //     //window.clearInterval(cycle);
                        //     $interval.cancel(timeoutId);
                        // }

                        ctx.arc(x + 25, y + 25, 5, 0, 2 * Math.PI);
                        ctx.fill();
                        //ctx.stroke();
                    }


                    function redrawCanvas() {

                        //console.log("reDraw:", inputData);

                        if (inputData === "undefined" && update < inputData.x.length) {
                            console.log("x:", x);
                            x = inputData.x[update];
                            y = inputData.y[update];
                            update++;
                        } else {
                            console.log("else");
                            $interval.cancel(timeoutId);
                        }

                        ctx.clearRect(0,0,600,300);
                        drawAxis(ctx);
                        drawBall(ctx);

                        cas += 0.05;

                    }
                    
                    scope.redrawCanvas = function(a, b) {
                        x = a;
                        y = b;
                        
                        //console.log("redrawCanvas: ", x, y);
                        
                        ctx.clearRect(0,0,600,300);
                        drawAxis(ctx);
                        drawBall(ctx);

                        cas += 0.05;
                    };


                    // counters

                    function countX() {
                        return cas*v0* Math.cos(alfa_rad);
                    }

                    function countY() {
                        return cas*v0* Math.sin(alfa_rad) - (g* Math.pow(cas, 2))/2;
                        //return x * Math.tan(alfa_rad) - g * x^2
                    }

                    function updateTime() {
                        //element.text(dateFilter(new Date(), format));
                        // console.log("SCOPE ROWS: ", scope.rows);
                        // console.log("SCOPE ROWS X: ", scope.rows[update].x);
                        // console.log("SCOPE ROWS Y: ", scope.rows[update].y);

                        // if (update == scope.fullData.length - 2) {
                        //     $interval.cancel(timeoutId);
                        // }
                        
                       

                        //x = scope.fullData[update].x;
                        //y = scope.fullData[update].y;
                        //x = scope.cnvsX;
                        //y = scope.cnvsY;
                        
                        // if (y <= 0) {
                        //     //$interval.cancel(timeoutId);
                        // }
                        console.log("update time");
                        
                        //update += 1;

                        //console.log("UPDT: ", update);
                        //console.log("UPDT length: ", scope.fullData.length);

                        redrawCanvas();
                    }

                    // scope.$watch("canvasRun", function (val) {
                    //     console.log("CANVAS CHANGE: ", val);
                    //     if (val === true) {
                    //         timeoutId = $interval(function() {
                    //
                    //
                    //             updateTime(); // update DOM
                    //             console.log("UPDATE");
                    //             //redrawCanvas();
                    //
                    //         }, 100);
                    //     } else if (val === false){
                    //         $interval.cancel(timeoutId);
                    //     }
                    // });

                    // scope.$watch(attrs.myCurrentTime, function(value) {
                    //     format = value;
                    //     updateTime();
                    // });

                    element.on('$destroy', function() {
                        $interval.cancel(timeoutId);
                    });

                    scope.startAnimation = function () {
                        console.log("run animation");
                        timeoutId = $interval(function() {


                            //updateTime(); // update DOM
                            console.log("UPDATE");
                            redrawCanvas();

                        }, 0.1);
                    };

                    // start the UI update process; save the timeoutId for canceling
                    // timeoutId = $interval(function() {
                    //
                    //
                    //         updateTime(); // update DOM
                    //         console.log("UPDATE");
                    //         //redrawCanvas();
                    //
                    // }, 1000);
                }
            };

        }])
        .directive('uiTable', ['$interval', function ($interval) {
            return {
                restrict: "E",
                templateUrl: './templates/table.html',
                link: function(scope, element, attrs, ctrl) {
                    console.log("started uiTable", scope.rows);

                    console.log("element ", element);

                    scope.$watchCollection("rows", function (val) {
                       if (val) {
                           element[0].scrollIntoView(false);
                       }
                    });
                }
            };
        }]);
})(document, angular);