exports.ShowDatabases = "SHOW DATABASES";
exports.CreateDatabase = "CREATE DATABASE ??";
exports.DropDatabase = "DROP DATABASE ??";

exports.ShowTables = "SHOW TABLES FROM ??";
exports.GetTableSchema = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";
exports.InsertRecordIntoTable = "INSERT INTO ??.?? SET ?";
exports.GetTableRows = "SELECT * FROM ??.??;";
exports.GetTableRowsLimit = "SELECT * FROM ??.?? LIMIT ?;";
exports.GetTableRowCount = "SELECT count(*) as count FROM ??.??;";

exports.DropSP = "DROP PROCEDURE IF EXISTS ??.??;";
exports.GetSP = "SHOW PROCEDURE STATUS WHERE DB = ?";
exports.GetSPDetails = "SHOW CREATE PROCEDURE ??.??";

exports.UseDB = "USE ??;";
