import Database from 'better-sqlite3';

const db = new Database('db/database.sqlite', { verbose: console.log });

export default db;