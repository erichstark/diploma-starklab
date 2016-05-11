var io = require('socket.io').listen(4000);

module.exports = function (req, res) {
    io.sockets.emit('message:' + req.body.result.user, req.body);
    res.sendStatus(200);
};