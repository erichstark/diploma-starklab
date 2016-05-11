var mongoUtil = require('../mongoUtil');

module.exports = function(req, res) {
    mongoUtil.connectToServer(function (err) {
        if (err == null) {
            var checkedId = undefined;

            if (req.params.id && req.params.id.length === 24) {
                checkedId = req.params.id;
            }

            var simulationParams = {
                user: req.params.user,
                experiment: req.params.simulation,
                id: checkedId
            };

            console.log("user:", simulationParams);

            mongoUtil.findSimulation(simulationParams, function (err, results) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(results));
            });

        } else {
            res.status(500).json(err);
        }
    });
};
