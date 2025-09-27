require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Create the postgres-js client
const client = postgres({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 20,
  idle_timeout: 300000,
  connect_timeout: 10000,
});

// Wrap with drizzle ORM
const db = drizzle(client);

module.exports = db;
