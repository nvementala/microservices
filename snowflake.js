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

    // let rsrc = params.join(".")
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
            databases.push({ 'name': item['name'] });
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
            schemas.push({ 'name': item['name'] });
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
            tables.push({ 'name': item['name'] });
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

exports.GetTableSchema = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;
    let table = req.params.table;

    let sqlQuery = sqlTmplt.SelectTableSchema[0] + database + sqlTmplt.SelectTableSchema[1];
    let params = [schema, table];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }
        res.status(200).json(results);
    });
}

exports.InsertRecord = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;
    let table = req.params.table;

    let colsData = req.body.columns;

    let colsToInsert = [];
    let dataToInsert = [];

    for (let item of colsData) {
        colsToInsert.push(item["column"]);
        dataToInsert.push(item["value"]);
    }

    let cols = colsToInsert.join(", ");
    let data = dataToInsert.map(x => "'" + x + "'").join(", ");

    let sqlQuery = `INSERT INTO ${database}.${schema}.${table} ( ${cols} )  VALUES (${data})`;
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
    let schema = req.params.schema;
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
    let schema = req.params.schema;
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
    let schema = req.params.schema;
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

exports.GetStoredProcedures = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;

    let sqlQuery = sqlTmplt.ShowProcedures + database + "." + schema;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        res.status(200).json(results);
    });

}

exports.CreateStoredProcedures = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;

    let spName = req.body.name;
    let spBody = req.body.body;
    let input_params = req.body.input_params;
    let return_type = req.body.return_type;

    let spIdentifier = database + "." + schema + "." + spName;
    let listOfInputParams = input_params.map(x => x['name'].toUpperCase() + " " + x['type']).join(", ");


    let sqlQuery = `CREATE OR REPLACE PROCEDURE ${spIdentifier} (${listOfInputParams})
                 RETURNS ${return_type} 
                 LANGUAGE JAVASCRIPT 
                 AS
                 $$
                    ${spBody}
                 $$;`;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        res.status(200).json(results);
    });
}

exports.GetStoredProceduresDetails = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;
    let spName = req.params.spname;

    let inputParamType = req.body.inputParamType;

    let spIdentifier = database + "." + schema + "." + spName;
    let listOfInputParamType = inputParamType.map(x => x.toUpperCase()).join(", ");

    let sqlQuery =  `DESC PROCEDURE ${spIdentifier} (${listOfInputParamType})`;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        res.status(200).json(results);
    });
}

exports.DeleteStoredProcedures = function (req, res) {
    
    let database = req.params.database;
    let schema = req.params.schema;
    let spName = req.params.spname;

    let inputParamType = req.body.inputParamType;

    let spIdentifier = database + "." + schema + "." + spName;
    let listOfInputParamType = inputParamType.map(x => x.toUpperCase()).join(", ");

    let sqlQuery = `DROP PROCEDURE ${spIdentifier} (${listOfInputParamType})`;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        res.status(200).json(results);
    });
}

exports.ExecStoredProcedures = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;
    let spName = req.params.spname;

    let inputParams = req.body.params;

    let spIdentifier = database + "." + schema + "." + spName;
    let listOfInputParams = inputParams.map(x => "'" + x.toUpperCase() + "'").join(", ");

    let sqlQuery = `CALL ${spIdentifier} (${listOfInputParams})`;
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        res.status(200).json(results);
    });
}

exports.ExecGeneralQuery = function (req, res) {

    let database = req.params.database;
    let schema = req.params.schema;

    let statement = req.body.statements;

    let sqlQuery = "USE " + database + "." + schema + "; "
    let params = [];

    ExecuteQuery(sqlQuery, params, function (err, results) {
        if (err) {
            res.status(err.status).json(err.message);
            return;
        }

        sqlQuery = statement;
        params = [];

        ExecuteQuery(sqlQuery, params, function (err, results) {
            if (err) {
                res.status(err.status).json(err.message);
                return;
            }

            res.status(200).json(results);
        });
    });

}

exports.Root = function (req, res) {
    res.status(200).json({ "return value ": "Your first successful Microservice End Point" })
}

