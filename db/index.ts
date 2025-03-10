import Database from "better-sqlite3";

const db = new Database("db/database.sqlite", {
  verbose: console.log,
  timeout: 10000,
});

db.exec("PRAGMA journal_mode = WAL;");

export default db;
