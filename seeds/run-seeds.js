const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users } = require('../src/schema');
const { eq } = require('drizzle-orm');

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function runSeeds() {
  try {
    console.log(' Running database seeds...');
    
    await seedUsers(db);
    
    console.log(' All seeds completed successfully!');
  } catch (error) {
    console.error(' Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function seedUsers(db) {
  console.log('   Seeding users...');
  const bcrypt = require('bcrypt');
  const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpassword', 10);

  await db.insert(users).values([
    {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      phone: process.env.ADMIN_NUMBER,
      password: hashedAdminPassword,
      designation: 'Admin',
      role: 'Admin',
      warehouse_id: null,
      is_active: true,
    },
  ]).onConflictDoNothing();
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds().catch(error => {
    console.error('Failed to run seeds:', error);
    process.exit(1);
  });
}

module.exports = { runSeeds };