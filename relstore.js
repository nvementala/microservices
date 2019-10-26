var persistence = null;
const mysql = require('mysql');

exports.initialize = function (options) {
    if (options) {
        persistence = options.persistence;
        //console.log("type="+persistence.type);
        switch (persistence.type) {
            case "mysql":
                if (!persistence.connectionlimit)
                    persistence.connectionlimit = 10;
                persistence.pool = mysql.createPool({
                    "connectionLimit": persistence.connectionlimit,
                    "host": persistence.host,
                    "user": persistence.user,
                    "password": persistence.password,
                    "multipleStatements": true
                });
                /*
                if(persistence.pool)
                    console.log("success");
                else
                    console.log("error");
                    */
                break;
            default:
                break;

        }
    }
}
// keymgr is could also be based
function Error(status, err) {
    return { "status": status, "message": err };
}

exports.ExecuteQuery = function (strQuery, cb) {
    console.log(strQuery);
    // execute will internally call prepare and query
    persistence.pool.getConnection(function (err, connection) {
        if (err) {
            cb(Error(422, err), null);
            return;
        }
        connection.query(strQuery, function (err, results, fields) {
            connection.release();
            if (err) {
                cb(Error(422, err), null)
            }
            else
                cb(null, results);
        })
    })
}