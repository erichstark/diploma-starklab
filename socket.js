var express = require('express');
var app = express();
var shell = require('shelljs');
var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var server = app.listen(3000);
var io = require('socket.io').listen(server);
var ldap = require('ldapjs');
var session = require('express-session');

// max age v sec * 1000, nastavit unlimited, delete az po logout
app.use(session({key: 'userID', secret: 'starkLab mouse', cookie: { maxAge: 900000 }, rolling: true, resave: false, saveUninitialized: false }));


var url = 'mongodb://localhost:27017/test';

var insertDocument = function (db, obj, res) {
    db.collection('projectile').insertOne(obj).then(function (r) {
        // test.equal(1, r.insertedCount);
        // Finish up test
        db.close();
        res.sendStatus(200);
    });
};

var findSimulation = function (db, sim, callback) {
    var query = {};
    var user = sim.user;
    var simType = sim.experiment;
    var simulationId = sim.id;
    if (simulationId) {
        query = {
            "_id": ObjectId(simulationId),
            "user": user
        }
    } else {
        query = {
            "user": user
        }
    }
    var cursor = db.collection("projectile").find(query).toArray(function (err, results) {
        callback(results);
    });
};


var bodyParser = require('body-parser');
// increased limit because of Error: request entity too large
// support json encoded bodies
app.use(bodyParser.json({limit: '2mb'}));
// support encoded bodies
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));

app.use("/", express.static(__dirname + '/app/'));
app.use("/templates/", express.static(__dirname + '/app/directives/templates/'));
app.use("/node_modules/", express.static(__dirname + '/node_modules/'));
app.use("/assets/", express.static(__dirname + '/assets/'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/app/views/login.html');
});

app.get('/results', function (req, res) {
    res.sendFile(__dirname + '/app/views/results.html');
});

app.get('/dash', function (req, res) {
    res.sendFile(__dirname + '/app/views/dashboard.html');
});

app.post('/login', function (req, res) {
    if (req.body.username && req.body.password) {
        var client = ldap.createClient({
            url: 'ldap://ldap.stuba.sk'
        });

        var rdn = "uid=" + req.body.username + ", ou=People, DC=stuba, DC=sk";
        var password = req.body.password;

        // TODO: dont delete code for production!!!!
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
                res.redirect('/dash');

            }
        });

    } else {
        res.redirect('/');
    }
});

// delete session
app.get('/logout', function (req, res) {
    if (req.session && req.session.user) {
        req.session.destroy(function () {
            res.clearCookie('username');
            res.clearCookie('userID');
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
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
    console.log("matlab v0: ", req.body.v0);
    console.log("matlab alfa_deg: ", req.body.alfa_deg);
    console.log("matlab sesstion: ", req.session.user);

    var cmd = '\/Applications\/MATLAB_R2015b.app\/bin\/matlab -nosplash -nodesktop -noFigureWindows -r \"cd \/Users\/Erich\/Desktop\/DP\/Matlab\/diploma-matlab\/;Sikmy_vrh_par(' + req.body.v0 + ',' + req.body.alfa_deg + ',\'' + req.session.user + '\');projectile_sim;exit;\"';

    shell.exec(cmd, function (code, stdout, stderr) {
        console.log("exec now");
    });

    // nerobit tu ale na frontende
    //res.redirect('/dashboard');
    res.sendStatus(200);
});

app.post('/matlab/result', function (req, res) {
    console.log(req.body.result.user);
    io.sockets.emit("message:" + req.body.result.user, req.body);
    res.sendStatus(200);
});

app.post('/mongo/insert/one', function (req, res) {
    console.log("mongo insert one");

    MongoClient.connect(url, function (err, db) {
        if (err === null) {
            console.log("Connected correctly to server.");
            insertDocument(db, req.body, res);
        }
    });
});

app.get('/mongo/simulation/:id', function (req, res) {
    console.log("simulation one", req.params.id);
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log(err);
            return res(err);
        } else {
            console.log("Connected correctly to server.");
            //findSimulation(db, simulation, data);

            var simulation = {
                user: 'xstark',
                type: 'projectile'
            };

            findSimulation(db, simulation, function (para) {
                console.log(":para", para);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(para));
                db.close();
            });

        }
    });
});

app.get('/mongo/:user/:simulation?/:id?', function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log("Connected correctly to server.");
            var checkedId = undefined;

            if (req.params.id && req.params.id.length === 24) {
                checkedId = req.params.id;
                // shoud be send bad param
            }

            var simulationParams = {
                user: req.params.user,
                experiment: req.params.simulation,
                id: checkedId
            };

            findSimulation(db, simulationParams, function (results) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(results));
                db.close();
            });
        }
    });
});
