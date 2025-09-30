const { pgTable, uuid, varchar, text, time, date, jsonb, integer, boolean, pgEnum, unique, timestamp } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

const userRole = pgEnum('user_role', ['Admin', 'Receptionist', 'Approver']);

const warehouse = pgTable('warehouse', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar('name', { length: 100 }).notNull().unique(),
  location: text('location'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

const warehouseTimeSlots = pgTable('warehouse_time_slots', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar('name', { length: 100 }).notNull(),
  from: time('from').notNull(),
  to: time('to').notNull(),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouse.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

const visitorTypes = pgTable('visitor_types', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  password: text('password').notNull(),
  designation: varchar('designation', { length: 100 }),  // New column
  role: userRole('role').notNull(),  // New enum column
  warehouseId: uuid('warehouse_id').references(() => warehouse.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

const visitorRequest = pgTable('visitor_request', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 150 }),
  visitorTypeId: uuid('visitor_type_id').notNull().references(() => visitorTypes.id),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouse.id),
  warehouseTimeSlotId: uuid('warehouse_time_slot_id').notNull().references(() => warehouseTimeSlots.id),
  accompanying: jsonb('accompanying').default([]),
  date: date('date').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  trackingCode: varchar('tracking_code', { length: 8 }).unique(),  // New column for short tracking code
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

const warehouseWorkflow = pgTable('warehouse_workflow', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  warehouseId: uuid('warehouse_id').notNull().references(() => warehouse.id, { onDelete: 'cascade' }),
  visitorTypeId: uuid('visitor_type_id').notNull().references(() => visitorTypes.id),
  stepNo: integer('step_no').notNull(),
  approver: uuid('approver').notNull().references(() => users.id),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  unique: unique().on(table.warehouseId, table.visitorTypeId, table.stepNo),
}));

const approval = pgTable('approval', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  visitorRequestId: uuid('visitor_request_id').notNull().references(() => visitorRequest.id, { onDelete: 'cascade' }),
  stepNo: integer('step_no').notNull(),
  approver: uuid('approver').notNull().references(() => users.id),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

module.exports = {
  warehouse,
  warehouseTimeSlots,
  visitorTypes,
  users,
  visitorRequest,
  warehouseWorkflow,
  approval,
};
