// helpers/adminHelpers.js
const pool = require("../db/Pool");
const bcrypt = require("bcryptjs");

const adminHelpers = {
  // -------------------- Users --------------------
  async createUser({ full_name, email, phone, password, is_active = true, role_id, warehouse_id }) {
    const password_hash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (full_name, email, phone, password_hash, is_active, role_id, warehouse_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name, email, phone, is_active, created_at, last_login, role_id, warehouse_id;
    `;
    const values = [full_name, email, phone || null, password_hash, is_active, role_id, warehouse_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async getAllUsers() {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at, u.last_login,
              r.name AS role_name, w.name AS warehouse_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       JOIN warehouses w ON w.id = u.warehouse_id
       ORDER BY u.created_at DESC`
    );
    return rows;
  },

  async getUserById(id) {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at, u.last_login,
              r.name AS role_name, w.name AS warehouse_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       JOIN warehouses w ON w.id = u.warehouse_id
       WHERE u.id = $1`,
      [id]
    );
    return rows[0];
  },

  async updateUser(id, { full_name, email, phone, password, is_active, role_id, warehouse_id }) {
    let query = `
      UPDATE users
      SET
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        is_active = COALESCE($4, is_active),
        role_id = COALESCE($5, role_id),
        warehouse_id = COALESCE($6, warehouse_id),
        last_login = now()
    `;
    const values = [full_name || null, email || null, phone || null, is_active, role_id || null, warehouse_id || null];
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query += `, password_hash = $7`;
      values.push(password_hash);
    }
    query += ` WHERE id = $${values.length + 1} RETURNING id, full_name, email, phone, is_active, created_at, last_login, role_id, warehouse_id;`;
    values.push(id);
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async deleteUser(id) {
    const { rows } = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id;", [id]);
    return rows[0];
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

  async getRoleById(id) {
    const { rows } = await pool.query("SELECT id, name, description, created_at FROM roles WHERE id = $1", [id]);
    return rows[0];
  },

  async updateRole(id, { name, description }) {
    const { rows } = await pool.query(
      `UPDATE roles
       SET
         name = COALESCE($1, name),
         description = COALESCE($2, description)
       WHERE id = $3
       RETURNING id, name, description, created_at;`,
      [name || null, description || null, id]
    );
    return rows[0];
  },

  async deleteRole(id) {
    const { rows } = await pool.query("DELETE FROM roles WHERE id = $1 RETURNING id;", [id]);
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
    const values = [name, address || null, timezone, created_by];
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
    const { rows } = await pool.query("DELETE FROM warehouses WHERE id = $1 RETURNING id;", [id]);
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
    const { rows } = await pool.query("DELETE FROM visitor_types WHERE id = $1 RETURNING id", [id]);
    return rows[0];
  },
};

module.exports = adminHelpers;
