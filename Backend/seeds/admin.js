const pool = require("../src/db/pool");
const bcrypt = require("bcrypt");
require("dotenv").config();

(async () => {
  try {
    const {
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PHONE,
      ADMIN_PASSWORD,
      ADMIN_ROLE,
      ADMIN_ROLE_DESC,
      ADMIN_USER_TYPE,
      ADMIN_USER_TYPE_DESC,
    } = process.env;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Missing required ADMIN_EMAIL or ADMIN_PASSWORD in .env");
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // ✅ Seed Role
    const { rows: roleRows } = await pool.query(
      `INSERT INTO roles (name, description)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING *`,
      [ADMIN_ROLE, ADMIN_ROLE_DESC]
    );
    const adminRole = roleRows[0];

    // ✅ Seed User Type
    const { rows: userTypeRows } = await pool.query(
      `INSERT INTO user_types (name, description)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
       RETURNING *`,
      [ADMIN_USER_TYPE, ADMIN_USER_TYPE_DESC]
    );
    const superUserType = userTypeRows[0];

    // ✅ Seed Admin User
    await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role_id, user_type_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [
        ADMIN_NAME,
        ADMIN_EMAIL,
        ADMIN_PHONE,
        passwordHash,
        adminRole.id,
        superUserType.id,
      ]
    );

    console.log(`✅ Admin user seeded: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error("❌ Seeding failed", err);
  } finally {
    await pool.end();
  }
})();
