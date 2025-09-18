require("dotenv").config();

module.exports = {
  migrationFolder: "./migrations", // Updated path to match running from Backend/ directory
  direction: "up",
  databaseUrl: process.env.DATABASE_URL,
  schema: "public",
  dir: "migrations",
  verbose: true,
};
