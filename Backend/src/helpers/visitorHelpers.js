// helpers/adminHelpers.js
const pool = require("../db/pool");

const visitorHelper = {
  
    // Get all visitor types
  async getAllVisitorTypes() {
    const { rows } = await pool.query(
      "SELECT * FROM visitor_types ORDER BY created_at DESC"
    );
    return rows;
  },


  async getAllWarehouses() {
    const { rows } = await pool.query(
      "SELECT * FROM warehouses ORDER BY created_at DESC"
    );
    return rows;
  },

};



module.exports = visitorHelper;
