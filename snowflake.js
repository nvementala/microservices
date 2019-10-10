var persistence = null;

const snowflake = require('snowflake-sdk');
const sqlTmplt = require('./snowflake_sqltemplate');


exports.initialize = function (options) {
    if (options) {
        persistence = options.persistence;
        //console.log("type="+persistence.type);
        switch (persistence.type) {
            case "snowflake":
                persistence.connection = snowflake.createConnection({
                    "account": persistence.account,
                    "username": persistence.user,
                    "password": persistence.password
                });

                persistence.connection.connect(function (err, conn) {
                    if (err) {
                        return cb(Error(422, err), null);
                    }
                    else {
                        console.log("Successfully established connection and connection id: " + conn.getId());
                    }
                })
                break;
            default:
                break;

        }
    }
}

function Error(status, err) {
    return { "status": status, "message": err };
}

function ExecuteQuery(strQuery, params, cb) {
    console.log(strQuery);

    let rsrc = params.join(".")
    persistence.connection.execute({
        // sqlText: 'select c1 from (select :1 as c1 union all select :2 as c1) where c1 = :1;',
        // sqlText: "SELECT * FROM ?.?.?;",
        sqlText: strQuery,
        binds: params,
        complete: function (err, stmt, rows) {
            if (err) {
                console.error('Failed to execute statement due to the following error: ' + err.message);
                return cb(Error(422, err), null);
            } else {
                console.log(rows);
                cb(null, rows);
            }
        }
    });

}

function NewConnectionFunc(account, user, password, cb) {
    persistence.connection.destroy(function (err, conn) {
        if (err) {
            console.error('Unable to disconnect: ' + err.message);
            cb(Error(422, err), null);
        }

        persistence.connection = snowflake.createConnection({
            "account": account,
            "username": user,
            "password": password
        });

        persistence.connection.connect(function (err, conn) {
            if (err) {
                return cb(Error(422, err), null);
            }
            else {
                console.log("Successfully established connection and connection id: " + conn.getId());
            }
        });

        cb(null, { "data": "OK" });

    });
}

exports.NewConnection = function (req, res) {
    NewConnectionFunc(req.body.account, req.body.user, req.body.password, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    })
}

exports.GetDatabases = function (req, res) {
    let params = [];
    ExecuteQuery(sqlTmplt.ShowDatabases, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        // res.status(200).json(results);
        let databases = [];
        for (let item of results) {
            databases.push({'name': item['name']});
        }
        res.status(200).json(databases);
    });
}

exports.CreateDatabase = function (req, res) {
    let database = req.body.name;

    // TODO: Change it to prepared statments 
    let sqlQuery = sqlTmplt.CreateDatabase + database
    let params = [];
    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    })
}

exports.DeleteDatabase = function (req, res) {
    let database = req.params.database;

    // TODO: Change it to prepared statments
    let sqlQuery = sqlTmplt.DropDatabase + database;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}

exports.GetSchemas = function (req, res) {

    let database = req.params.database;

    // TODO: Change it to prepared statments
    let sqlQuery = sqlTmplt.ShowSchemas + database;
    let params = [];
    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        // res.status(200).json(results);
        let schemas = [];
        for (let item of results) {
            schemas.push({'name': item['name']});
        }
        res.status(200).json(schemas);
    });
}

exports.CreateSchema = function (req, res) {

    let database = req.params.database;
    let schema = req.body.name;
    // TODO: Change it to prepared statments
    let sqlQuery = sqlTmplt.CreateSchema + database + "." + schema;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}

exports.DeleteSchema = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;
    // TODO: Change it to prepared statments
    let sqlQuery = sqlTmplt.DeleteSchema + database + "." + schema;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}

exports.GetTables = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;

    // TODO: Change it to prepared statments
    let sqlQuery = sqlTmplt.ShowTables + database + "." + schema;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        // res.status(200).json(results);
        let tables = [];
        for (let item of results) {
            tables.push({'name': item['name']});
        }
        res.status(200).json(tables);
    });
}

exports.CreateTable = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;
    
    let table = req.body.table;
    let columns = req.body.columns;

    let colDetails = [];
    let primaryKeyCols = [];
    for (let item of columns) {
        let tmp = item['column'] + " " + item['ctype'];
        if (item['special'])
            tmp += " " + item['special'];
        if (item['foreignkey']) {
            let foreignkeyTable = item['foreignkey']['table'];
            let foreignkeyColumn = item['foreignkey']['column'];
            tmp += ` REFERENCES ${database}.${schema}.${foreignkeyTable} (${foreignkeyColumn})`
        }
        colDetails.push(tmp);

        if (item['primarykey'])
            primaryKeyCols.push(item['column']);
    }

    let columnSql = colDetails.join(",");
    let sqlQuery = "";
    if (primaryKeyCols.length > 0) {
        let primaryKeySql = `PRIMARY KEY (${primaryKeyCols.join(",")})`;
        sqlQuery = `CREATE TABLE ${database}.${schema}.${table} ( ${[columnSql, primaryKeySql].join(",")} );`
    }
    else {
        sqlQuery = `CREATE TABLE ${database}.${schema}.${table} ( ${columnSql} );`
    }

    let params = [];
    
    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}

exports.GetTableRows = function (req, res) {

    let database = req.params.database;
    let schema = req. params.schema;
    let table = req.params.table;

    let sqlQuery = sqlTmplt.SelectRowsFromTable + database + "." + schema + "." + table;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}

exports.GetTableRowsLimit = function (req, res) {
    
    let database = req.params.database;
    let schema = req. params.schema;
    let table = req.params.table;
    let limit = req.params.limit;

    let sqlQuery = sqlTmplt.SelectRowsFromTable + database + "." + schema + "." + table + " LIMIT " + limit;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}

exports.GetTableRowCount = function (req, res) {

    let database = req.params.database;
    let schema = req. params.schema;
    let table = req.params.table;

    let sqlQuery = sqlTmplt.SelectRowCount + database + "." + schema + "." + table;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}





exports.Root = function (req, res) {
    res.status(200).json({ "return value ": "Your first successful Microservice End Point" })
}

