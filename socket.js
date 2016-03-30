var express = require('express');
var app = express();
var fs = require("fs");
var shell = require('shelljs');

var server = app.listen(3000);
var io = require('socket.io').listen(server);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//var bodyParser = require('body-parser');
//app.use(bodyParser());
app.use("/", express.static(__dirname + '/app/'));

app.get('/', function(req, res){
    console.log("DIRNAME: ", __dirname);
    res.sendFile(__dirname + '/app/views/index.html');
});

app.get('/matlab', function(req, res){
    res.sendFile(__dirname + '/app/views/matlab.html');
});

app.post('/matlab/run', function(req, res){
    console.log(req.body);

    shell.exec('\"\/Applications\/MATLAB_R2015b.app\/bin\/matlab\" -nosplash -nodesktop -noFigureWindows -r \"cd \/Users\/Erich\/Desktop\/DP\/Matlab\/diploma-matlab\/;Sikmy_vrh_par(' + req.body.v0 + ',' + req.body.alfa_deg +');projectile_sim;exit;\"',
        function(code, stdout, stderr) {
        });

    res.redirect('/');
});

app.post('/test', function (req, res) {
    io.sockets.emit("message", req.body);
    res.sendStatus(200);
});