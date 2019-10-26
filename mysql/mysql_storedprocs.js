const mysql = require('mysql');

const sqlTmplt = require('./mysql_sqltemplate');
const relstoreJs = require('../relstore');


exports.CreateSP = function (req, res) {

    let database = req.params.database;
    let storedProc = req.body.name;

    let params = [database, storedProc];
    let sqlQuery1 = mysql.format(sqlTmplt.DropSP, params);

    let procParams = req.body.params;
    let paramsSql = procParams.map(x => x['mode'] + " " + x["name"] + " " + x["type"]).join(",");
    let procBody = req.body.body;

    let sqlQuery2 = `CREATE PROCEDURE \`${database}\`.\`${storedProc}\` ( ${paramsSql} ) 
                    BEGIN ${procBody} END`;

    let sqlQuery = [sqlQuery1, sqlQuery2].join(" ");
    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.GetSPs = function (req, res) {

    let database = req.params.database;

    let sqlQuery = mysql.format(sqlTmplt.GetSP, [database]);
    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.GetSPDetails = function (req, res) {

    let database = req.params.database;
    let storedProc = req.params.name;

    let params = [database, storedProc];
    let sqlQuery = mysql.format(sqlTmplt.GetSPDetails, params);

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        res.status(200).json(results);
    });
}


exports.DeleteSP = function (req, res) {

    let database = req.params.database;
    let storedProc = req.params.name;

    let params = [database, storedProc];
    let sqlQuery = mysql.format(sqlTmplt.DropSP, params);

    relstoreJs.ExecuteQuery(strQ, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.ExecSP = function (req, res) {

    let database = req.params.database;
    let storedProc = req.params.name;
    let procParams = req.body.params;

    let preStatements = req.body.prestatements;
    preStatements = preStatements.endsWith(";") ? preStatements : preStatements + ";";

    let inputParams = [];
    for (let item of procParams) {
        switch (item["mode"]) {
            case "inout":
            case "out":
            case "in":
                inputParams.push(item["name"]);
                break;
            case "literal":
                inputParams.push(`'${mysql.escape(item["name"])}'`);
                break;
            default:
                break;
        }
    }

    let execStatement = `CALL ${database}.${storedProc} ( ${inputParams.join(", ")} );`;

    let postStatements = req.body.poststatements;
    postStatements = postStatements.endsWith(";") ? postStatements : postStatements + ";";

    let sqlQuery = [preStatements, execStatement, postStatements].join(" ");

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        let resp = {};
        res.status(200).json(results);
    });
}