let app = require('cirruswave');
let fs = require('fs');

let credentialsFile = "snowflake_account.json";
let options = JSON.parse(fs.readFileSync(credentialsFile));

app.startservice('snowflake', __dirname, './appserviceconfig.json', options);
