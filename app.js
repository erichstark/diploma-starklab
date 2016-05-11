var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');

// routes include
var rootRouter = require('./express/routes/index');
var loginRouter = require('./express/routes/login');
var logoutRouter = require('./express/routes/logout');
var dashboardRouter = require('./express/routes/dashboard');
var matlabExecRouter = require('./express/routes/matlabExec');
var matlabResultRouter = require('./express/routes/matlabResult');
var mongoInsertOneRouter = require('./express/routes/mongoInsertOne');
var mongoFindSimulationRouter = require('./express/routes/mongoFindSimulation');
var mongoDeleteOneRouter = require('./express/routes/mongoDeleteOne');

var app = express();

// max age v sec * 1000, nastavit unlimited, delete az po logout
app.use(session({key: 'userID', secret: 'starkLab mouse', cookie: { maxAge: 900000 }, rolling: true, resave: false, saveUninitialized: false }));

// increased limit because of Error: request entity too large
// support json encoded bodies
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));

app.use("/", express.static(__dirname + '/app/'));
app.use("/templates/", express.static(__dirname + '/app/directives/templates/'));
app.use("/node_modules/", express.static(__dirname + '/node_modules/'));
app.use("/assets/", express.static(__dirname + '/assets/'));


// routes
app.get('/', rootRouter);
app.post('/login', loginRouter);

// middleware to check logged user through browser or result from matlab
app.use(function (req, res, next) {
    if ((req.session && req.session.user) || req.body && req.body.result && req.body.result.user) {
        next();
    } else {
        res.redirect('/');
    }
});

app.get('/dashboard', dashboardRouter);
app.get('/logout', logoutRouter);
app.post('/matlab/run', matlabExecRouter);
app.post('/matlab/result', matlabResultRouter);
app.post('/mongo/insert/one', mongoInsertOneRouter);
app.get('/mongo/:user/:simulation?/:id?', mongoFindSimulationRouter);
app.delete('/mongo/delete/:id', mongoDeleteOneRouter);



module.exports = app;