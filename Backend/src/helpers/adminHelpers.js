// helpers/adminHelpers.js
const pool = require("../db/pool");
const bcrypt = require("bcryptjs");

/**
 * Helper functions for admin-related database operations
 * Handles CRUD operations for users, roles, warehouses, and visitor types
 */
const adminHelpers = {
  // -------------------- User Management --------------------
  
  /**
   * Creates a new user in the database
   * @param {Object} userData - User data object
   * @returns {Promise<Object>} - Created user object (without password hash)
   */
  async createUser({ full_name, email, phone, password, is_active = true, role_id, warehouse_id }) {
    const password_hash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (full_name, email, phone, password_hash, is_active, role_id, warehouse_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name, email, phone, is_active, created_at, last_login, role_id, warehouse_id
    `;
    const values = [full_name, email, phone || null, password_hash, is_active, role_id, warehouse_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Retrieves all users with their role and warehouse information
   * @returns {Promise<Array>} - Array of user objects with joined data
   */
  async getAllUsers() {
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.is_active, 
        u.created_at, u.last_login,
        r.name AS role_name, 
        w.name AS warehouse_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      JOIN warehouses w ON w.id = u.warehouse_id
      ORDER BY u.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Retrieves a specific user by ID with role and warehouse information
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} - User object or null if not found
   */
  async getUserById(id) {
    const query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.is_active, 
        u.created_at, u.last_login,
        r.name AS role_name, 
        w.name AS warehouse_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      JOIN warehouses w ON w.id = u.warehouse_id
      WHERE u.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Updates user information (only provided fields are updated)
   * @param {string} id - User UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated user object or null if not found
   */
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
    
    const values = [
      full_name || null, 
      email || null, 
      phone || null, 
      is_active, 
      role_id || null, 
      warehouse_id || null
    ];
    
    // Handle password update separately if provided
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query += `, password_hash = $7`;
      values.push(password_hash);
    }
    
    query += ` WHERE id = $${values.length + 1} RETURNING id, full_name, email, phone, is_active, created_at, last_login, role_id, warehouse_id`;
    values.push(id);
    
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  /**
   * Deletes a user from the database
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} - Deleted user ID or null if not found
   */
  async deleteUser(id) {
    const query = "DELETE FROM users WHERE id = $1 RETURNING id";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  // -------------------- Role Management --------------------
  
  /**
   * Retrieves all roles from the database
   * @returns {Promise<Array>} - Array of role objects
   */
  async getAllRoles() {
    const query = "SELECT id, name, description, created_at FROM roles ORDER BY name ASC";
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Creates a new role in the database
   * @param {Object} roleData - Role data object
   * @returns {Promise<Object>} - Created role object
   */
  async createRole({ name, description }) {
    const query = `
      INSERT INTO roles (name, description) 
      VALUES ($1, $2) 
      RETURNING id, name, description, created_at
    `;
    const { rows } = await pool.query(query, [name, description || null]);
    return rows[0];
  },

  /**
   * Retrieves a specific role by ID
   * @param {string} id - Role UUID
   * @returns {Promise<Object|null>} - Role object or null if not found
   */
  async getRoleById(id) {
    const query = "SELECT id, name, description, created_at FROM roles WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Updates role information
   * @param {string} id - Role UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated role object or null if not found
   */
  async updateRole(id, { name, description }) {
    const query = `
      UPDATE roles
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description)
      WHERE id = $3
      RETURNING id, name, description, created_at
    `;
    const { rows } = await pool.query(query, [name || null, description || null, id]);
    return rows[0] || null;
  },

  /**
   * Deletes a role from the database
   * @param {string} id - Role UUID
   * @returns {Promise<Object|null>} - Deleted role ID or null if not found
   */
  async deleteRole(id) {
    const query = "DELETE FROM roles WHERE id = $1 RETURNING id";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  // -------------------- Warehouse Management --------------------
  
  /**
   * Retrieves all warehouses from the database
   * @returns {Promise<Array>} - Array of warehouse objects
   */
  async getAllWarehouses() {
    const query = `
      SELECT id, name, address, timezone, created_at, created_by, updated_at, updated_by 
      FROM warehouses 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Retrieves a specific warehouse by ID
   * @param {string} id - Warehouse UUID
   * @returns {Promise<Object|null>} - Warehouse object or null if not found
   */
  async getWarehouseById(id) {
    const query = `
      SELECT id, name, address, timezone, created_at, created_by, updated_at, updated_by 
      FROM warehouses 
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Creates a new warehouse in the database
   * @param {Object} warehouseData - Warehouse data object
   * @returns {Promise<Object>} - Created warehouse object
   */
  async createWarehouse({ name, address, timezone = "UTC", created_by = null }) {
    const query = `
      INSERT INTO warehouses (name, address, timezone, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, address, timezone, created_at, created_by, updated_at, updated_by
    `;
    const values = [name, address || null, timezone, created_by];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Updates warehouse information
   * @param {string} id - Warehouse UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated warehouse object or null if not found
   */
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
      RETURNING id, name, address, timezone, created_at, created_by, updated_at, updated_by
    `;
    const values = [name || null, address || null, timezone || null, updated_by, id];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  },

  /**
   * Deletes a warehouse from the database
   * @param {string} id - Warehouse UUID
   * @returns {Promise<Object|null>} - Deleted warehouse ID or null if not found
   */
  async deleteWarehouse(id) {
    const query = "DELETE FROM warehouses WHERE id = $1 RETURNING id";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  // -------------------- Visitor Type Management --------------------
  
  /**
   * Retrieves all visitor types from the database
   * @returns {Promise<Array>} - Array of visitor type objects
   */
  async getAllVisitorTypes() {
    const query = `
      SELECT id, name, description, created_at, created_by, updated_at, updated_by
      FROM visitor_types
      ORDER BY name ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Retrieves a specific visitor type by ID
   * @param {string} id - Visitor type UUID
   * @returns {Promise<Object|null>} - Visitor type object or null if not found
   */
  async getVisitorTypeById(id) {
    const query = `
      SELECT id, name, description, created_at, created_by, updated_at, updated_by
      FROM visitor_types
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Creates a new visitor type in the database
   * @param {Object} visitorTypeData - Visitor type data object
   * @returns {Promise<Object>} - Created visitor type object
   */
  async createVisitorType({ name, description, created_by = null }) {
    const query = `
      INSERT INTO visitor_types (name, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, name, description, created_at, created_by, updated_at, updated_by
    `;
    const { rows } = await pool.query(query, [name, description, created_by]);
    return rows[0];
  },

  /**
   * Updates visitor type information
   * @param {string} id - Visitor type UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} - Updated visitor type object or null if not found
   */
  async updateVisitorType(id, { name, description, updated_by = null }) {
    const query = `
      UPDATE visitor_types
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = now(),
        updated_by = $3
      WHERE id = $4
      RETURNING id, name, description, created_at, created_by, updated_at, updated_by
    `;
    const { rows } = await pool.query(query, [name || null, description || null, updated_by, id]);
    return rows[0] || null;
  },

  /**
   * Deletes a visitor type from the database
   * @param {string} id - Visitor type UUID
   * @returns {Promise<Object|null>} - Deleted visitor type ID or null if not found
   */
  async deleteVisitorType(id) {
    const query = "DELETE FROM visitor_types WHERE id = $1 RETURNING id";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  // -------------------- Permission Management --------------------
  
  /**
   * Retrieves all permissions from the database
   * @returns {Promise<Array>} - Array of permission objects
   */
  async getAllPermissions() {
    const query = "SELECT id, name, description, created_at FROM permissions ORDER BY name ASC";
    const { rows } = await pool.query(query);
    return rows;
  },

  // -------------------- Visit Request Management --------------------

  /**
   * Retrieves all visit requests with joined data for admin view
   * @returns {Promise<Array>} - Array of visit request objects with joined names
   */
  async getAllVisitRequests() {
    const query = `
      SELECT 
        vr.id, vr.visitor_name, vr.visitor_email, vr.visitor_phone, 
        vr.accompanying_persons, vr.visit_date, vr.visit_time, 
        vr.created_at, vr.visitor_type_id, vr.description, vr.warehouse_id, 
        vr.status, vr.updated_at, vr.updated_by, vr.approved_by, vr.approval_time,
        vt.name AS visitor_type_name, w.name AS warehouse_name, 
        u.full_name AS approved_by_name
      FROM visit_requests vr
      JOIN visitor_types vt ON vt.id = vr.visitor_type_id
      JOIN warehouses w ON w.id = vr.warehouse_id
      LEFT JOIN users u ON u.id = vr.approved_by
      ORDER BY vr.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Retrieves a specific visit request by ID with joined data
   * @param {string} id - Visit request UUID
   * @returns {Promise<Object|null>} - Visit request object or null if not found
   */
  async getVisitRequestById(id) {
    const query = `
      SELECT 
        vr.id, vr.visitor_name, vr.visitor_email, vr.visitor_phone, 
        vr.accompanying_persons, vr.visit_date, vr.visit_time, 
        vr.created_at, vr.visitor_type_id, vr.description, vr.warehouse_id, 
        vr.status, vr.updated_at, vr.updated_by, vr.approved_by, vr.approval_time,
        vt.name AS visitor_type_name, w.name AS warehouse_name, 
        u.full_name AS approved_by_name
      FROM visit_requests vr
      JOIN visitor_types vt ON vt.id = vr.visitor_type_id
      JOIN warehouses w ON w.id = vr.warehouse_id
      LEFT JOIN users u ON u.id = vr.approved_by
      WHERE vr.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  /**
   * Updates a visit request (primarily for status changes like approval/rejection)
   * @param {string} id - Visit request UUID
   * @param {Object} updateData - Data to update (status, updated_by)
   * @returns {Promise<Object|null>} - Updated visit request object or null if not found
   */
  async updateVisitRequest(id, { status, updated_by }) {
    let query = `
      UPDATE visit_requests
      SET 
        status = COALESCE($1, status),
        updated_at = now(),
        updated_by = $2
    `;
    const values = [status, updated_by];
    
    // If approving/rejecting, set approval fields
    if (status === 'approved' || status === 'rejected') {
      query += `, approved_by = $3, approval_time = now()`;
      values.push(updated_by);
    }
    
    query += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);
    
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }
};

module.exports = adminHelpers;
