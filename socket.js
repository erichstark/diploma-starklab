var express = require('express');
var app = express();
var fs = require("fs");

var server = app.listen(3000);
var io = require('socket.io').listen(server);

var bodyParser = require('body-parser');
app.use(bodyParser());
app.use("/", express.static(__dirname + '/app/'));

app.get('/', function(req, res){
    console.log("DIRNAME: ", __dirname);
    res.sendFile(__dirname + '/app/views/index.html');
});

app.get('/listUsers', function (req, res) {
    fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
        console.log(data);
        res.end(data);
    });

    console.log("GET Access from outside...");
});

app.post('/test', function (req, res) {
    var data = "";

    io.sockets.emit("message", req.body);
    res.writeHead(200, "OK", {'Content-Type': 'text/html'});
    res.end();
    res.send({});

    //req.on('data', function (chunk) {
    //    //console.log("Received body data:");
    //    //console.log(chunk.toString());
    //    data = data + chunk.toString();
    //});
    //
    //req.on('end', function () {
    //    // empty 200 OK response for now
    //    var parsed = JSON.stringify(data);
    //
    //    //io.on('connection', function(socket){
    //    //    socket.send(parsed);
    //    //    //io.emit('chat message', data);
    //    //    //console.log("socket.io");
    //    //});
    //
    //    res.writeHead(200, "OK", {'Content-Type': 'text/html'});
    //    res.end();
    //});



    //console.log("Data: ", parsed);


    //console.log("POST Access from outside...");
});

//var server = app.listen(8081, function () {
//
//    var host = server.address().address;
//    var port = server.address().port;
//
//    console.log("Example app listening at http://%s:%s", host, port)
//
//});