// helpers/authHelpers.js
const bcrypt = require("bcryptjs");
const pool = require("../db/Pool");

// Authenticate user by email and password
async function authenticateUser(email, password) {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at, u.last_login,
            u.password_hash, r.name AS role_name, w.id AS warehouse_id, w.name AS warehouse_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN warehouses w ON w.id = u.warehouse_id
     WHERE u.email = $1`,
    [email]
  );
  const user = rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  delete user.password_hash;
  return user;
}

async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at, u.last_login,
            r.name AS role_name, w.id AS warehouse_id, w.name AS warehouse_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN warehouses w ON w.id = u.warehouse_id
     WHERE u.id = $1`,
    [id]
  );
  return rows[0];
}

module.exports = {
  getUserById,
  authenticateUser,
};
