require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Create the postgres-js client using DATABASE_URL
const client = postgres(process.env.DATABASE_URL, {
  max: 20,
  idle_timeout: 300000,
  connect_timeout: 10000,
});

// Wrap with drizzle ORM
const db = drizzle(client);

module.exports = db;
