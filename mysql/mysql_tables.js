const mysql = require('mysql');

const sqlTmplt = require('./mysql_sqltemplate');
const relstoreJs = require('../relstore');


exports.GetTables = function (req, res) {

    let database = req.params.database;
    let params = [database];
    let sqlQuery = mysql.format(sqlTmplt.ShowTables, params);

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.GetTableSchema = function (req, res) {

    let database = req.params.database;
    let tablename = req.params.table;
    let params = [database, tablename];
    let strQuery = mysql.format(sqlTmplt.GetTableSchema, params);

    relstoreJs.ExecuteQuery(strQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.CreateTable = function (req, res) {

    let database = req.params.database;
    let table = req.body.table;
    let columns = req.body.columns;

    let colDetails = [];
    let primaryKeyCols = [];

    for (let item of columns) {
        let tmp = item['column'] + " " + item['ctype'];
        if (item['special']) {
            tmp += " " + item['special'];
        }

        if (item['foreignkey']) {
            let foreignkeyTable = item['foreignkey']['table'];
            let foreignkeyColumn = item['foreignkey']['column'];
            tmp += ` REFERENCES ${database}.${foreignkeyTable} (${foreignkeyColumn})`
        }
        colDetails.push(tmp);

        if (item['primarykey'])
            primaryKeyCols.push(item['column']);

    }

    let columnSql = colDetails.join(",");
    let sqlQuery = "";
    if (primaryKeyCols.length > 0) {
        let primaryKeySql = `PRIMARY KEY (${primaryKeyCols.join(",")})`;
        sqlQuery = `CREATE TABLE ${database}.${table} ( ${[columnSql, primaryKeySql].join(",")} );`
    }
    else {
        sqlQuery = `CREATE TABLE ${database}.${table} ( ${columnSql} );`
    }

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.InsertRecord = function (req, res) {

    let database = req.params.database;
    let table = req.params.table;
    let columns = req.body.columns;

    let columnsDict = {};
    for (let item of columns) {
        columnsDict[item['column']] = item['value'];
    }

    let params = [database, table, columnsDict]
    let sqlQuery = mysql.format(sqlTmplt.InsertRecordIntoTable, params);
    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.GetTableRows = function (req, res) {

    let database = req.params.database;
    let table = req.params.table;

    let params = [database, table];
    let sqlQuery = mysql.format(sqlTmplt.GetTableRows, params);

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.GetTableRowsLimit = function (req, res) {

    let database = req.params.database;
    let table = req.params.table;
    let limit = parseInt(req.params.limit);

    let params = [database, table, limit];
    let sqlQuery = mysql.format(sqlTmplt.GetTableRowsLimit, params);

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}


exports.GetTableRowCount = function (req, res) {

    let database = req.params.database;
    let table = req.params.table;

    let params = [database, table];
    let sqlQuery = mysql.format(sqlTmplt.GetTableRowCount, params);

    relstoreJs.ExecuteQuery(sqlQuery, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}