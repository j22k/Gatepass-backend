// helpers/adminHelpers.js
const pool = require("../db/pool");

const adminHelpers = {
  // Users
  async createUser({ name, email, phone, role_id, usertype_id }) {
    const query = `
      INSERT INTO users (full_name, email, phone, role_id, user_type_id) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`;
    const values = [name, email, phone, role_id, usertype_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async getAllUsers() {
    const { rows } = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    return rows;
  },

  // Warehouses
  async getAllWarehouses() {
    const { rows } = await pool.query("SELECT * FROM warehouses");
    return rows;
  },

  async createWarehouse({ name, location }) {
    const query = `
      INSERT INTO warehouses (name, address) 
      VALUES ($1, $2) 
      RETURNING *`;
    const { rows } = await pool.query(query, [name, location]);
    return rows[0];
  },

  // Roles
  async getAllRoles() {
    const { rows } = await pool.query("SELECT * FROM roles");
    return rows;
  },

  async createRole({ name }) {
    const query = `INSERT INTO roles (name) VALUES ($1) RETURNING *`;
    const { rows } = await pool.query(query, [name]);
    return rows[0];
  },
  
  async createVisitorType({ name, description }) {
    const query = `
      INSERT INTO visitor_types (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, description]);
    return rows[0];
  },

  // Get all visitor types
  async getAllVisitorTypes() {
    const { rows } = await pool.query(
      "SELECT * FROM visitor_types ORDER BY created_at DESC"
    );
    return rows;
  },

  // Get visitor type by ID
  async getVisitorTypeById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM visitor_types WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  // Update visitor type
  async updateVisitorType(id, { name, description }) {
    const query = `
      UPDATE visitor_types
      SET name = COALESCE($1, name),
          description = COALESCE($2, description)
      WHERE id = $3
      RETURNING *;
    `;
    const values = [name, description, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Delete visitor type
  async deleteVisitorType(id) {
    const query = "DELETE FROM visitor_types WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
  async createWarehouse({ name, address, timezone }) {
    const query = `
      INSERT INTO warehouses (name, address, timezone)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, address, timezone || "UTC"];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async getAllWarehouses() {
    const { rows } = await pool.query(
      "SELECT * FROM warehouses ORDER BY created_at DESC"
    );
    return rows;
  },

  async getWarehouseById(id) {
    const { rows } = await pool.query(
      "SELECT * FROM warehouses WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  async updateWarehouse(id, { name, address, timezone }) {
    const query = `
      UPDATE warehouses
      SET name = COALESCE($1, name),
          address = COALESCE($2, address),
          timezone = COALESCE($3, timezone)
      WHERE id = $4
      RETURNING *;
    `;
    const values = [name, address, timezone, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteWarehouse(id) {
    const query = "DELETE FROM warehouses WHERE id = $1 RETURNING *;";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

};



module.exports = adminHelpers;
