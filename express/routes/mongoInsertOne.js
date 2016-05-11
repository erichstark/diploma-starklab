var mongoUtil = require('../mongoUtil');

module.exports = function (req, res) {

    mongoUtil.connectToServer(function (err) {
        if (err == null) {
            mongoUtil.insertSimulation(req.body, function (insertErr, result) {
                if (insertErr == null) {
                    res.sendStatus(200);
                } else {
                    console.error('Problem with insert simulation.', insertErr);
                    res.sendStatus(500);
                }
            });
        }
    });
};