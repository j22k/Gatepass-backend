require("dotenv").config();

module.exports = {
  migrationFolder: "./Backend/migrations", // Updated path to match the actual location of migration files
  direction: "up",
  databaseUrl: process.env.DATABASE_URL,
  schema: "public",
  dir: "migrations",
  verbose: true,
};
