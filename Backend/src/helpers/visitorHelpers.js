// helpers/visitorHelpers.js
const pool = require("../db/pool");

const visitorHelper = {
  async getAllWarehouses() {
    const { rows } = await pool.query(
      "SELECT id, name, address, timezone, created_at FROM warehouses ORDER BY created_at DESC"
    );
    return rows;
  },

  async getAllVisitorTypes() {
    const { rows } = await pool.query(
      `SELECT id, name, description, created_at
       FROM visitor_types
       ORDER BY name ASC`
    );
    return rows;
  },
};

module.exports = visitorHelper;