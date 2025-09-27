const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users, warehouse, visitorTypes, warehouseTimeSlots, warehouseWorkflow } = require('../src/schema');
const { eq } = require('drizzle-orm');

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function runSeeds() {
  try {
    console.log(' Running database seeds...');
    
    await seedVisitorTypes(db);
    await seedWarehouses(db);
    await seedWarehouseTimeSlots(db);
    await seedUsers(db);
    await seedWarehouseWorkflow(db);
    
    console.log(' All seeds completed successfully!');
  } catch (error) {
    console.error(' Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function seedVisitorTypes(db) {
  console.log('   Seeding visitor types...');
  const visitorTypesData = [
    { name: 'Auditor', description: 'Auditor visitors' },
    { name: 'External Guest', description: 'External guests' },
    { name: 'Staff Visitor', description: 'Staff visitors' },
  ];
  await db.insert(visitorTypes).values(visitorTypesData).onConflictDoNothing();
}

async function seedWarehouses(db) {
  console.log('   Seeding warehouses...');
  const warehouses = [
    { name: 'Main Warehouse', location: 'Delhi, India' },
    { name: 'North Warehouse', location: 'Mumbai, India' },
    { name: 'South Warehouse', location: 'Bangalore, India' },
  ];
  await db.insert(warehouse).values(warehouses).onConflictDoNothing();
}

async function seedWarehouseTimeSlots(db) {
  console.log('   Seeding warehouse time slots...');

  const timeSlots = [
    { name: 'Morning Shift', from: '09:00', to: '13:00' },
    { name: 'Afternoon Shift', from: '13:00', to: '17:00' },
    { name: 'Evening Shift', from: '17:00', to: '21:00' }
  ];

  // Get all warehouses
  const warehouses = await db.select().from(warehouse);

  for (const wh of warehouses) {
    for (const slot of timeSlots) {
      await db.insert(warehouseTimeSlots).values({
        name: slot.name,
        from: slot.from,
        to: slot.to,
        warehouseId: wh.id, // ✅ assign warehouse
      }).onConflictDoNothing();
    }
  }
}


async function seedUsers(db) {
  console.log('   Seeding users...');
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || 'defaultpassword', 10);
  const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'adminpassword', 10);
  const hashedReceptionistPassword = await bcrypt.hash(process.env.RECEPTIONIST_PASSWORD || 'reception123', 10);

  // Get first warehouse ID for assigning users
  const warehouseResult = await db.select().from(warehouse).limit(1);
  const defaultWarehouseId = warehouseResult.length > 0 ? warehouseResult[0].id : null;

  await db.insert(users).values([
    {
      name: 'Factory Manager',
      email: 'factory@company.com',
      phone: '1234567890',
      password: hashedPassword,
      designation: 'Factory Manager',
      role: 'Approver',
      warehouse_id: defaultWarehouseId,
      is_active: true,
    },
    {
      name: 'CEO',
      email: 'ceo@company.com',
      phone: '0987654321',
      password: hashedPassword,
      designation: 'CEO',
      role: 'Approver',
      warehouse_id: null,
      is_active: true,
    },
    {
      name: 'Line Manager',
      email: 'line@company.com',
      phone: '1122334455',
      password: hashedPassword,
      designation: 'Line Manager',
      role: 'Approver',
      warehouse_id: defaultWarehouseId,
      is_active: true,
    },
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
    {
      name: 'Receptionist',
      email: 'reception@company.com',
      phone: '5566778899',
      password: hashedReceptionistPassword,
      designation: 'Receptionist',
      role: 'Receptionist',
      warehouse_id: defaultWarehouseId,
      is_active: true,
    },
  ]).onConflictDoNothing();
}

async function seedWarehouseWorkflow(db) {
  console.log('   Seeding warehouse workflows...');

  const warehouses = await db.select().from(warehouse);
  const visitorTypesList = await db.select().from(visitorTypes);
  const factoryManager = await db.select().from(users).where(eq(users.name, 'Factory Manager'));
  const ceo = await db.select().from(users).where(eq(users.name, 'CEO'));
  const lineManager = await db.select().from(users).where(eq(users.name, 'Line Manager'));

  if (factoryManager.length === 0 || ceo.length === 0 || lineManager.length === 0) {
    throw new Error('Required users not found');
  }

  const fmId = factoryManager[0].id;
  const ceoId = ceo[0].id;
  const lmId = lineManager[0].id;

  for (const wh of warehouses) {
    for (const vt of visitorTypesList) {
      let workflows = [];
      if (vt.name === 'Auditor') {
        workflows = [{ step_no: 1, approver: fmId }];
      } else if (vt.name === 'External Guest') {
        workflows = [
          { step_no: 1, approver: fmId },
          { step_no: 2, approver: ceoId }
        ];
      } else if (vt.name === 'Staff Visitor') {
        workflows = [
          { step_no: 1, approver: lmId },
          { step_no: 2, approver: fmId },
          { step_no: 3, approver: ceoId }
        ];
      }
      for (const wf of workflows) {
        await db.insert(warehouseWorkflow).values({
          warehouseId: wh.id,
          visitorTypeId: vt.id,
          stepNo: wf.step_no,
          approver: wf.approver
        }).onConflictDoNothing();
      }
    }
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds().catch(error => {
    console.error('Failed to run seeds:', error);
    process.exit(1);
  });
}

module.exports = { runSeeds };