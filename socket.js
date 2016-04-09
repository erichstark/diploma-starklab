"use strict";

var express = require('express');
var app = express();
var fs = require("fs");
var shell = require('shelljs');

var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var server = app.listen(3000);
var io = require('socket.io').listen(server);


var ldap = require('ldapjs');

var session = require('express-session');

// max age v sec * 1000
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 120000 }}));

var url = 'mongodb://localhost:27017/test';
// MongoClient.connect(url, function(err, db) {
//     assert.equal(null, err);
//     // console.log("Connected correctly to server.");
//     // db.close();
//
//     // insertDocument(db, function() {
//     //     db.close();
//     // });
//
//     findRestaurants(db, function () {
//         db.close();
//     });
// });

var insertDocument = function(db, callback) {
    db.collection('restaurants').insertOne( {
        "address" : {
            "street" : "2 Avenue",
            "zipcode" : "10075",
            "building" : "1480",
            "coord" : [ -73.9557413, 40.7720266 ]
        },
        "borough" : "Hlohovec",
        "cuisine" : "Italian",
        "grades" : [
            {
                "date" : new Date("2014-10-01T00:00:00Z"),
                "grade" : "A",
                "score" : 11
            },
            {
                "date" : new Date("2014-01-16T00:00:00Z"),
                "grade" : "B",
                "score" : 17
            }
        ],
        "name" : "Vella",
        "restaurant_id" : "41704620"
    }, function(err, result) {
        console.log("Res id: ", result.ok);
        assert.equal(err, null);
        console.log("Inserted a document into the restaurants collection.");
        callback();
    });
};

var findRestaurants = function(db, callback) {
    var cursor =db.collection('restaurants').find( { "borough": "Hlohovec"});
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            console.dir(doc);
        } else {
            callback();
        }
    });
};


var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


// Access the session as req.session
app.get('/vvv', function(req, res, next) {
    var sess = req.session;
    if (sess.views) {
        sess.views++;
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>views: ' + sess.views + '</p>');
        res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
        res.end();
    } else {
        sess.views = 1;
        res.end('welcome to the session demo. refresh!')
    }
});


app.use("/", express.static(__dirname + '/app/'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/app/views/login.html');
});



app.post('/login', function (req, res) {
    if (req.session && req.session.user) {
        // user logged
        res.redirect('/dashboard');
    } else {
        if (req.body.username && req.body.password) {
            var client = ldap.createClient({
                url: 'ldap://ldap.stuba.sk'
            });

            var rdn = "uid=" + req.body.username + ", ou=People, DC=stuba, DC=sk";
            var password = req.body.password;

            client.bind(rdn, password, function(err) {

                // If there is an error, tell the user about it. Normally we would
                // log the incident, but in this application the user is really an LDAP
                // administrator.
                if (err != null) {
                    //console.log("Login problem", err);
                    if (err.name === "InvalidCredentialsError") {
                        console.log("Credential error");
                        res.redirect('/');
                    }
                    else {
                        console.log("Unknown error: " + JSON.stringify(err));
                        res.redirect('/');
                        // problem with ldap, try later
                    }
                }
                else {
                    // client unbind? mozno uz mi netreba connection
                    console.log("Login successful!");
                    req.session.user = req.body.username;
                    res.redirect('/dashboard');
                }
            });


        } else {
            res.redirect('/');
        }
        // console.log("req body: ", req.body.username, req.body.password);
        // console.log("req session: ", req.session);
        // res.redirect('/dashboard');
    }
});

app.get('/dashboard', function (req, res) {
    if (req.session && req.session.user) {
        res.sendFile(__dirname + '/app/views/index.html');
    } else {
        res.redirect('/');
    }
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

app.get('/mongo/insert', function(req, res){
    res.sendStatus(200);
});

app.post('/mongo/insert/many', function(req, res){

    res.sendStatus(200);
});

app.get('/mongo/report/:id', function(req, res){

    res.sendStatus(200);
});
