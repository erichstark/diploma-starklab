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
app.use(session({key: 'userID', secret: 'keyboard cat', cookie: {maxAge: 120000}}));

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

var insertDocument = function (db, obj, res) {
    db.collection('projectile').insertOne(obj).then(function(r) {
        test.equal(1, r.insertedCount);
        // Finish up test
        db.close();
        res.sendStatus(200);
    });
    //
    // var col = db.collection('insert_one_with_promise');
    // col.insertOne({a:1}).then(function(r) {
    //     test.equal(1, r.insertedCount);
    //     // Finish up test
    //     db.close();
    // });
};

var findRestaurants = function (db, callback) {
    var cursor = db.collection('restaurants').find({"borough": "Hlohovec"});
    cursor.each(function (err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            console.dir(doc);
        } else {
            callback();
        }
    });
};


var bodyParser = require('body-parser');
// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
// increased limit because of Error: request entity too large
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));


// Access the session as req.session
app.get('/vvv', function (req, res, next) {
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

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/app/views/login.html');
});

var sess;

app.post('/login', function (req, res) {
    // if (req.session && req.session.user) {
    //     // user logged
    //     res.redirect('/dashboard');
    // } else {
    if (req.body.username && req.body.password) {
        var client = ldap.createClient({
            url: 'ldap://ldap.stuba.sk'
        });

        var rdn = "uid=" + req.body.username + ", ou=People, DC=stuba, DC=sk";
        var password = req.body.password;

        client.bind(rdn, password, function (err) {

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
                res.cookie('username', req.body.username);
                res.redirect('/dashboard');
            }
        });


    } else {
        res.redirect('/');
    }
    // console.log("req body: ", req.body.username, req.body.password);
    // console.log("req session: ", req.session);
    // res.redirect('/dashboard');
    //}
});

app.post('/logout', function (req, res) {
    // delete session

    res.redirect('/');
});

app.get('/dashboard', function (req, res) {
    if (req.session && req.session.user) {
        console.log("User: ", req.session.user);
        res.sendFile(__dirname + '/app/views/index.html');
    } else {
        res.redirect('/');
    }
});

// middleware to check logged user through browser or result from matlab
app.use(function (req, res, next) {
    if ((req.session && req.session.user) || req.body && req.body.result && req.body.result.user) {
        next();
    } else {
        res.redirect('/');
    }
});

app.get('/matlab', function (req, res) {
    res.sendFile(__dirname + '/app/views/matlab.html');
});

app.post('/matlab/run', function (req, res) {

    shell.exec('\"\/Applications\/MATLAB_R2015b.app\/bin\/matlab\" -nosplash -nodesktop -noFigureWindows -r \"cd \/Users\/Erich\/Desktop\/DP\/Matlab\/diploma-matlab\/;Sikmy_vrh_par(' + req.body.v0 + ',' + req.body.alfa_deg + ',' + req.session.user + ');projectile_sim;exit;\"',
        function (code, stdout, stderr) {
        });

    res.redirect('/dashboard');
});

app.post('/matlab/result', function (req, res) {
    console.log(req.body.result.user);
    io.sockets.emit("message:" + req.body.result.user, req.body);
    res.sendStatus(200);
});

app.post('/mongo/insert/one', function (req, res) {
    console.log("mongo insert one");

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server.");
        // db.close();

        insertDocument(db, req.body, res);
    });
});


// app.post('/mongo/insert/all', function (req, res) {
//     console.log("mongo insert all", req.body);
//     res.sendStatus(200);
// });

app.get('/mongo/report/:id', function (req, res) {

    res.sendStatus(200);
});
