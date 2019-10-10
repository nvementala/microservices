exports.DropDatabase = "DROP DATABASE ";
exports.ShowDatabases = "SHOW DATABASES";
exports.CreateDatabase = "CREATE DATABASE ";

exports.ShowSchemas = "SHOW TERSE SCHEMAS IN ";
exports.CreateSchema = "CREATE SCHEMA ";
exports.DeleteSchema = "DROP SCHEMA ";

exports.ShowTables = "SHOW TERSE TABLES IN ";
exports.SelectRowsFromTable = "SELECT * FROM ";
exports.SelectRowsFromTableLimit = "SELECT * FROM :1.:2.:3 LIMIT :4;";
exports.SelectRowCount = "SELECT count(*) as total_rows FROM ";
