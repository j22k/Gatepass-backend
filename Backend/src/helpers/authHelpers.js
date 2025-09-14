const bcrypt = require("bcryptjs");
// helpers/authHelpers.js
const pool = require("../db/pool");



// Authenticate user by email and password
async function authenticateUser(email, password) {
  // Find user by email
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, is_active, created_at, last_login, password_hash FROM users WHERE email = $1`,
    [email]
  );
  const user = rows[0];
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  // Remove password_hash before returning
  delete user.password_hash;
  return user;
}
async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, phone, is_active, created_at, last_login
     FROM users
     WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function getUserPermissions(userId) {
  // Gather distinct permission names assigned via roles
  const { rows } = await pool.query(
    `
    SELECT DISTINCT p.name
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = $1
    `,
    [userId]
  );
  return rows.map((r) => r.name);
}


module.exports = {
  getUserById,
  getUserPermissions,
  authenticateUser,
};