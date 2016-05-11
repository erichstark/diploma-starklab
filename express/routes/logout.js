module.exports = function (req, res) {
    if (req.session && req.session.user) {
        req.session.destroy(function () {
            res.clearCookie('username');
            res.clearCookie('userID');
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};