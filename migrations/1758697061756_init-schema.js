/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE warehouse (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL UNIQUE,
      location TEXT
    );

    CREATE TABLE warehouse_time_slots (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      "from" TIME NOT NULL,
      "to" TIME NOT NULL,
      warehouse_id UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE
    );

    CREATE TABLE visitor_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TYPE user_role AS ENUM ('Admin', 'Receptionist', 'Approver');

    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password TEXT NOT NULL,
      designation VARCHAR(100),  -- New column for department-like info
      role user_role NOT NULL,   -- New enum column for roles
      warehouse_id UUID REFERENCES warehouse(id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE visitor_request (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(150),
      visitor_type_id UUID NOT NULL REFERENCES visitor_types(id),
      warehouse_id UUID NOT NULL REFERENCES warehouse(id),
      warehouse_time_slot_id UUID NOT NULL REFERENCES warehouse_time_slots(id),
      accompanying JSONB DEFAULT '[]',
      date DATE NOT NULL CHECK (date >= CURRENT_DATE),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved'))
    );

    CREATE TABLE warehouse_workflow (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      warehouse_id UUID NOT NULL REFERENCES warehouse(id) ON DELETE CASCADE,
      visitor_type_id UUID NOT NULL REFERENCES visitor_types(id),
      step_no INT NOT NULL,
      approver UUID NOT NULL REFERENCES users(id),
      UNIQUE (warehouse_id, visitor_type_id, step_no)
    );

    CREATE TABLE approval (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      visitor_request_id UUID NOT NULL REFERENCES visitor_request(id) ON DELETE CASCADE,
      step_no INT NOT NULL,
      approver UUID NOT NULL REFERENCES users(id),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))
    );

    CREATE OR REPLACE FUNCTION insert_approvals_for_request()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO approval (visitor_request_id, step_no, approver)
      SELECT NEW.id, wf.step_no, wf.approver
      FROM warehouse_workflow wf
      WHERE wf.warehouse_id = NEW.warehouse_id
        AND wf.visitor_type_id = NEW.visitor_type_id
      ORDER BY wf.step_no;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_insert_approvals
    AFTER INSERT ON visitor_request
    FOR EACH ROW
    EXECUTE FUNCTION insert_approvals_for_request();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS trg_insert_approvals ON visitor_request;
    DROP FUNCTION IF EXISTS insert_approvals_for_request();
    DROP TABLE IF EXISTS approval CASCADE;
    DROP TABLE IF EXISTS warehouse_workflow CASCADE;
    DROP TABLE IF EXISTS visitor_request CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS visitor_types CASCADE;
    DROP TABLE IF EXISTS warehouse_time_slots CASCADE;
    DROP TABLE IF EXISTS warehouse CASCADE;
    DROP TYPE IF EXISTS user_role;
  `);
};