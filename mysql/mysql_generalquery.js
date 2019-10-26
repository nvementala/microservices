const mysql = require('mysql');

const sqlTmplt = require('./mysql_sqltemplate');
const relstoreJs = require('../relstore');


exports.GeneralQuery = function (req, res) {

    let database = req.params.database;
    let statement = req.body.statements;

    let sqlQuery = [mysql.format(sqlTmplt.UseDB, [database]), statement].join(" ");

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        // return the 2nd item in the results array, as it has resp of SQL statment passed
        if (results.length > 1)
            return res.status(200).json(results[1]);
        return res.status(200).json(results);
    });
}