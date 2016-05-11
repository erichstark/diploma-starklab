var shell = require('shelljs');

module.exports = function (req, res) {
    var cmd = '\/Applications\/MATLAB_R2015b.app\/bin\/matlab -nosplash -nodesktop -noFigureWindows -r \"cd \/Users\/Erich\/Desktop\/DP\/Matlab\/diploma-matlab\/;Sikmy_vrh_par(' + req.body.v0 + ',' + req.body.alfa_deg + ',\'' + req.session.user + '\');projectile_sim;exit;\"';

    shell.exec(cmd, function (code, stdout, stderr) {
        console.log('matlab exit');
    });

    res.sendStatus(200);
};