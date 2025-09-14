// helpers/adminHelpers.js
const pool = require("../db/pool");
const bcrypt = require("bcryptjs");

const adminHelpers = {
  // -------------------- Users --------------------
  // ...existing code...

async createUser({ full_name, email, phone, password, is_active = true, role_id }) {
  const password_hash = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (full_name, email, phone, password_hash, is_active, role_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, full_name, email, phone, is_active, created_at, last_login, role_id;
  `;
  const values = [full_name, email, phone || null, password_hash, is_active, role_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
},


  async getAllUsers() {
    const { rows } = await pool.query(
      `SELECT id, full_name, email, phone, is_active, created_at, last_login
       FROM users
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async assignRoleToUser(user_id, role_id, assigned_by = null) {
    const query = `
      INSERT INTO user_roles (user_id, role_id, assigned_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role_id) DO NOTHING
      RETURNING user_id, role_id, assigned_at, assigned_by;
    `;
    const { rows } = await pool.query(query, [user_id, role_id, assigned_by]);
    if (!rows[0]) {
      return { user_id, role_id, message: "Role already assigned" };
    }
    return rows[0];
  },

  async getUserRoles(user_id) {
    const { rows } = await pool.query(
      `
      SELECT r.id, r.name, r.description, r.created_at
      FROM user_roles uR
      JOIN roles r ON r.id = uR.role_id
      WHERE uR.user_id = $1
      ORDER BY r.name ASC
      `,
      [user_id]
    );
    return rows;
  },

  // -------------------- Roles --------------------
  async getAllRoles() {
    const { rows } = await pool.query("SELECT id, name, description, created_at FROM roles ORDER BY name ASC");
    return rows;
  },

  async createRole({ name, description }) {
    const { rows } = await pool.query(
      "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at",
      [name, description || null]
    );
    return rows[0];
  },

  // -------------------- Warehouses --------------------
  async getAllWarehouses() {
    const { rows } = await pool.query(
      "SELECT id, name, address, timezone, created_at, created_by, updated_at, updated_by FROM warehouses ORDER BY created_at DESC"
    );
    return rows;
  },

  async getWarehouseById(id) {
    const { rows } = await pool.query(
      "SELECT id, name, address, timezone, created_at, created_by, updated_at, updated_by FROM warehouses WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  async createWarehouse({ name, address, timezone = "UTC", created_by = null }) {
    const query = `
      INSERT INTO warehouses (name, address, timezone, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, address, timezone, created_at, created_by, updated_at, updated_by;
    `;
    const values = [name, address || null, timezone || "UTC", created_by];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async updateWarehouse(id, { name, address, timezone, updated_by = null }) {
    const query = `
      UPDATE warehouses
      SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        timezone = COALESCE($3, timezone),
        updated_at = now(),
        updated_by = $4
      WHERE id = $5
      RETURNING id, name, address, timezone, created_at, created_by, updated_at, updated_by;
    `;
    const values = [name || null, address || null, timezone || null, updated_by, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteWarehouse(id) {
    const query = "DELETE FROM warehouses WHERE id = $1 RETURNING id;";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // -------------------- Visitor Types --------------------
  async getAllVisitorTypes() {
    const { rows } = await pool.query(
      `SELECT id, name, description, created_at, created_by, updated_at, updated_by
       FROM visitor_types
       ORDER BY name ASC`
    );
    return rows;
  },

  async getVisitorTypeById(id) {
    const { rows } = await pool.query(
      `SELECT id, name, description, created_at, created_by, updated_at, updated_by
       FROM visitor_types
       WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async createVisitorType({ name, description, created_by = null }) {
    const { rows } = await pool.query(
      `INSERT INTO visitor_types (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_at, created_by, updated_at, updated_by`,
      [name, description, created_by]
    );
    return rows[0];
  },

  async updateVisitorType(id, { name, description, updated_by = null }) {
    const { rows } = await pool.query(
      `UPDATE visitor_types
       SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         updated_at = now(),
         updated_by = $3
       WHERE id = $4
       RETURNING id, name, description, created_at, created_by, updated_at, updated_by`,
      [name || null, description || null, updated_by, id]
    );
    return rows[0];
  },

  async deleteVisitorType(id) {
    const { rows } = await pool.query(
      `DELETE FROM visitor_types WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0];
  },
};

module.exports = adminHelpers;