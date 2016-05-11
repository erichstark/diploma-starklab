var ObjectId = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/test';
var _db;

module.exports = {

    connectToServer: function (callback) {
        MongoClient.connect(url, function (err, db) {
            _db = db;
            console.log('Connected to MongoDB!');
            return callback(err);
        });
    },

    getDb: function () {
        return _db;
    },

    closeDb: function () {
        _db.close();
    },

    insertSimulation: function (obj, callback) {
        _db.collection('projectile').insertOne(obj, function (err, result) {
            //_db.close();
            callback(err, result);
        });
    },

    removeSimulation: function (id, callback) {
        var col = _db.collection('projectile');
        col.findOneAndDelete({_id: ObjectId(id)}, function (err, result) {
            //_db.close();
            callback(err, result);
        });
    },

    findSimulation: function (sim, callback) {
        var query = {};
        var user = sim.user;
        var simType = sim.experiment;
        var simulationId = sim.id;
        if (simulationId) {
            query = {
                '_id': ObjectId(simulationId),
                'user': user
            }
        } else {
            query = {
                'user': user
            }
        }
        var cursor = _db.collection('projectile').find(query).toArray(function (err, results) {
            //_db.close();

            callback(err, results);
        });
    }
};