const pool = require("../src/db/Pool");
const bcrypt = require("bcryptjs");
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

    // Ensure we have a warehouse to attach (use Default Warehouse created by migrations)
    const { rows: whRows } = await pool.query(
      `SELECT id FROM warehouses WHERE name = $1 ORDER BY created_at ASC LIMIT 1`,
      ["Default Warehouse"]
    );
    const warehouse = whRows[0];
    if (!warehouse) {
      throw new Error("No warehouse found. Run migrations to seed 'Default Warehouse' first.");
    }

    // Upsert Admin user WITH role_id and warehouse_id
    const { rows: userRows } = await pool.query(
      `INSERT INTO users (full_name, email, phone, password_hash, is_active, role_id, warehouse_id)
       VALUES ($1, $2, $3, $4, true, $5, $6)
       ON CONFLICT (email) DO UPDATE
         SET full_name = EXCLUDED.full_name,
             phone = EXCLUDED.phone,
             password_hash = EXCLUDED.password_hash,
             is_active = true,
             role_id = EXCLUDED.role_id,
             warehouse_id = EXCLUDED.warehouse_id
       RETURNING *`,
      [ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, passwordHash, adminRole.id, warehouse.id]
    );
    const adminUser = userRows[0];

    console.log(`✅ Admin user seeded: ${ADMIN_EMAIL} (warehouse_id=${adminUser.warehouse_id})`);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();