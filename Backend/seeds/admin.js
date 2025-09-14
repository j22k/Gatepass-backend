const pool = require("../src/db/pool"); // adjust path if your pool is at src/db/pool
const bcrypt = require("bcrypt");
require("dotenv").config();

(async () => {
  try {
    const {
      ADMIN_NAME = "Admin",
      ADMIN_EMAIL,
      ADMIN_PHONE = null,
      ADMIN_PASSWORD,
      ADMIN_ROLE = "Admin",
      ADMIN_ROLE_DESC = "Full system access",
    } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Missing required ADMIN_EMAIL or ADMIN_PASSWORD in .env");
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Ensure Admin role exists
    let { rows: roleRows } = await pool.query(
      `SELECT id, name FROM roles WHERE name = $1`,
      [ADMIN_ROLE]
    );
    let adminRole = roleRows[0];
    if (!adminRole) {
      ({ rows: roleRows } = await pool.query(
        `INSERT INTO roles (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, name`,
        [ADMIN_ROLE, ADMIN_ROLE_DESC]
      ));
      adminRole = roleRows[0];
    }

    // Upsert Admin user WITH role_id (required by NOT NULL constraint)
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, is_active, role_id)
       VALUES ($1, $2, $3, $4, true, $5)
       ON CONFLICT (email) DO UPDATE
         SET full_name = EXCLUDED.full_name,
             phone = EXCLUDED.phone,
             password_hash = EXCLUDED.password_hash,
             is_active = true,
             role_id = EXCLUDED.role_id
       RETURNING *`,
      [ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, passwordHash, adminRole.id]
    );
    const adminUser = userRows[0];

    // Also assign Admin role via user_roles for compatibility with code that still reads from user_roles
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by)
       VALUES ($1, $2, $1)
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [adminUser.id, adminRole.id]
    );

    console.log(`✅ Admin user seeded and role assigned: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();