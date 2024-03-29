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

exports.SelectTableSchema = ["SELECT * FROM ", ".information_schema.columns WHERE table_schema = :1 AND table_name = :2 ORDER BY ORDINAL_POSITION;"];

exports.ShowProcedures = "SHOW PROCEDURES IN ";
