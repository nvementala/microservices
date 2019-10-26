let app = require('cirruswave');
let fs = require('fs');

let credentialsFile = "mysql_account.json";
let options = JSON.parse(fs.readFileSync(credentialsFile));

app.startservice('mysql', __dirname, './appserviceconfig.json', options);
