/**
 * Created by Erich on 05/04/16.
 */

var ldap = require('ldapjs');
var client = ldap.createClient({
    url: 'ldap://ldap.stuba.sk'
});

// Bind as the administrator (or a read-only user), to get the DN for
// the user attempting to authenticate
client.bind("uid=xlogin, ou=People, DC=stuba, DC=sk", "password", function(err) {

    // If there is an error, tell the user about it. Normally we would
    // log the incident, but in this application the user is really an LDAP
    // administrator.
    if (err != null)
        console.log("Login problem", err);
    else
        console.log("Login successful!");
    // Search for a user with the correct UID.
    //     client.search(req.body.ldap_suffix, {
    //         scope: "sub",
    //         filter: "(uid=" + sessionData.uid + ")"
    //     }, function(err, ldapResult) {
    //         if (err != null)
    //             throw err;
    //         else {
    //             // If we get a result, then there is such a user.
    //             console.log("RES: ", ldapResult);
    //         }
    //
    //     });
});

// login data
// <?php
//
//
// // using ldap bind
//     $ldaprdn  = 'uid=xstark, ou=People, DC=stuba, DC=sk';     // ldap rdn or dn
// $ldappass = '';  // associated password
//
// // connect to ldap server
// $ldapconn = ldap_connect("ldap.stuba.sk")
// or die("Could not connect to LDAP server.");
//
// if ($ldapconn) {
//
//     // binding to ldap server
//     $ldapbind = ldap_bind($ldapconn, $ldaprdn, $ldappass);
//
//     // verify binding
//     if ($ldapbind) {
//         echo "LDAP bind successful...";
//     } else {
//         echo "LDAP bind failed...";
//     }
//
// }
//
// ?>