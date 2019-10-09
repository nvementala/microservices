var persistence = null;

const snowflake = require('snowflake-sdk');
const sqlTmplt = require('./snowflake_sqltemplate');

exports.initialize = function(options)
{	
    if (options) {
        persistence = options.persistence;
        //console.log("type="+persistence.type);
        switch(persistence.type)
        {
            case "snowflake":
                persistence.connection  = snowflake.createConnection({
                    "account":persistence.account,
                    "username": persistence.user,
                    "password":persistence.password
                });

                persistence.connection.connect(function(err, conn){
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

function Error(status, err)
{
   return {"status":status, "message":err};
}

function ExecuteQuery(strQuery, cb) {
    console.log(strQuery);

    persistence.connection.execute({
        sqlText: strQuery,
        complete: function(err, stmt, rows) {
            if (err) {
                console.error('Failed to execute statement due to the following error: ' + err.message);
                return cb(Error(422, err), null);
            } else {
                cb(null, rows);
            }
        }
    });

}

function NewConnectionFunc(account, user, password, cb) {
    persistence.connection.destroy(function(err, conn){
        if (err) {
            console.error('Unable to disconnect: ' + err.message);
            cb(Error(422, err), null);
        }

        persistence.connection  = snowflake.createConnection({
            "account": account,
            "username": user,
            "password": password
        });

        persistence.connection.connect(function(err, conn){
            if (err) {
                return cb(Error(422, err), null);
            }
            else {
                console.log("Successfully established connection and connection id: " + conn.getId());
            }
        });

        cb(null, {"data": "OK"});
        
    });
}

exports.NewConnection = function(req, res){
   NewConnectionFunc(req.body.account, req.body.user, req.body.password, function(err, results){
       if(err)
       {
           res.status(err.status).json(err.message);
           return;
       }
       res.status(200).json(results);
   })
}

exports.GetDatabases = function(req, res){
   ExecuteQuery(sqlTmplt.ShowDatabases, function(err, results){
       if(err)
       {
           res.status(err.status).json(err.message);
           return;
       }
       let databases = results.map(x => x['name']);
       res.status(200).json(databases);
   });
}

exports.Root = function(req,res)
{	
    res.status(200).json({"return value ": "Your first successful Microservice End Point"})
}

