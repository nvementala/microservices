const mysql = require('mysql');

const sqlTmplt = require('./mysql_sqltemplate');
const relstoreJs = require('../relstore');


exports.GetDatabases = function (req, res) {

    let showDatabase = sqlTmplt.ShowDatabases;
    relstoreJs.ExecuteQuery(showDatabase, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.CreateDatabase = function (req, res) {

    let database = req.body.name;
    let params = [database];
    let sqlQuery = mysql.format(sqlTmplt.CreateDatabase, params);

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.DeleteDatabase = function (req, res) {

    let database = req.params.name;
    let params = [database];
    let sqlQuery = mysql.format(sqlTmplt.DropDatabase, params);

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}