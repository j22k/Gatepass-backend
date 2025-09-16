// helpers/visitorHelpers.js
const pool = require("../db/pool");

/**
 * Helper functions for visitor-related database operations
 * Handles warehouses, visitor types, and visit requests
 */
const visitorHelper = {
  /**
   * Retrieves all active warehouses from the database
   * @returns {Promise<Array>} - Array of warehouse objects
   */
  async getAllWarehouses() {
    const query = `
      SELECT id, name, address, timezone, created_at 
      FROM warehouses 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Retrieves all visitor types from the database
   * @returns {Promise<Array>} - Array of visitor type objects
   */
  async getAllVisitorTypes() {
    const query = `
      SELECT id, name, description, created_at
      FROM visitor_types
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Checks if a visitor type exists in the database
   * @param {string} id - UUID of the visitor type
   * @returns {Promise<boolean>} - True if visitor type exists
   */
  async visitorTypeExists(id) {
    const query = "SELECT 1 FROM visitor_types WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  /**
   * Checks if a warehouse exists in the database
   * @param {string} id - UUID of the warehouse
   * @returns {Promise<boolean>} - True if warehouse exists
   */
  async warehouseExists(id) {
    const query = "SELECT 1 FROM warehouses WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
  },

  /**
   * Creates a new visit request in the database
   * @param {Object} requestData - Visit request data
   * @returns {Promise<Object>} - Created visit request object
   */
  async createVisitRequest({ 
    visitor_name, 
    visitor_email, 
    visitor_phone, 
    accompanying_persons, 
    visit_date, 
    visit_time, 
    visitor_type_id, 
    description, 
    warehouse_id 
  }) {
    const query = `
      INSERT INTO visit_requests (
        visitor_name, 
        visitor_email, 
        visitor_phone, 
        accompanying_persons, 
        visit_date, 
        visit_time, 
        visitor_type_id, 
        description, 
        warehouse_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id, 
        visitor_name, 
        visitor_email, 
        visitor_phone, 
        accompanying_persons, 
        visit_date, 
        visit_time,
        visitor_type_id, 
        description, 
        warehouse_id, 
        status, 
        created_at
    `;
    
    const values = [
      visitor_name, 
      visitor_email, 
      visitor_phone || null, 
      JSON.stringify(accompanying_persons || []), // Ensure proper JSON serialization
      visit_date, 
      visit_time, 
      visitor_type_id, 
      description || null, 
      warehouse_id
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
};

module.exports = visitorHelper;