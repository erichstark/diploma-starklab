var ldap = require('ldapjs');

module.exports = function (req, res) {
    console.log("login", req.body);
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
                res.redirect('/dashboard');

            }
        });

    } else {
        res.redirect('/');
    }
};